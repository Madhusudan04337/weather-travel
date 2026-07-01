"""
Travel Request Service — business rule and orchestration layer.

Responsibilities
----------------
✅ Own all business rules (date range, notes requirement, merged-state validation).
✅ Translate repository None / False returns into NotFoundError.
✅ Translate RepositoryError into ServiceError (keeps API layer ignorant of DB).
✅ Return TravelRequestResponse directly — API layer needs zero conversion logic.

Explicitly NOT responsible for
--------------------------------
❌ MongoDB queries         → TravelRequestRepository
❌ HTTP status codes       → API layer
❌ Pydantic field parsing  → schema layer
"""
from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Any

from app.core.exceptions import (
    BusinessRuleError,
    NotFoundError,
    RepositoryError,
    ServiceError,
)
from app.core.time import today_utc
from app.repositories.travel_request_repository import TravelRequestRepository
from app.schemas.travel_request import (
    TravelRequestCreate,
    TravelRequestListResponse,
    TravelRequestResponse,
    TravelRequestUpdate,
)

logger = logging.getLogger(__name__)


from app.services.weather_service import WeatherService

class TravelRequestService:
    """
    Orchestrates travel request operations and enforces business rules.

    Parameters
    ----------
    repo:
        A ``TravelRequestRepository`` instance injected by FastAPI's
        dependency system.
    weather_service:
        A ``WeatherService`` instance injected by FastAPI.
    """

    def __init__(
        self,
        repo: TravelRequestRepository,
        weather_service: WeatherService,
    ) -> None:
        self._repo = repo
        self._weather_service = weather_service

    # ── Public methods ────────────────────────────────────────────────────────

    async def create(self, data: TravelRequestCreate) -> TravelRequestResponse:
        """
        Validate business rules and persist a new travel request.

        Business rules enforced
        -----------------------
        1. travel_date must not be in the past.
        2. travel_date must be within the next 365 days.
        3. notes are required when special_needs is True.

        Parameters
        ----------
        data:
            Validated inbound schema from the API layer.

        Returns
        -------
        TravelRequestResponse
            The persisted request ready for the HTTP response.

        Raises
        ------
        BusinessRuleError
            If any business rule is violated.
        ServiceError
            If the repository fails for an infrastructure reason.
        """
        self._validate_travel_date(data.travel_date)
        self._validate_notes(data.special_needs, data.notes)

        try:
            model = await self._repo.create(data)
        except RepositoryError as exc:
            logger.error("Repository failure during create: %s", exc.detail)
            raise ServiceError(
                f"Could not create travel request: {exc.detail}"
            ) from exc

        # ── Fetch and store weather data ──────────────────────────────────────
        try:
            weather_summary = await self._weather_service.get_weather_summary(
                data.destination_city, data.travel_date
            )
            
            # Delegate MongoDB update to the repository's public API
            updated = await self._repo.update_weather(model.id, weather_summary)
            if updated:
                model.weather = weather_summary.model_dump()
        except Exception as exc:
            # We don't want a weather failure to fail the whole creation
            logger.warning("Failed to attach weather summary: %s", exc)

        logger.info("Travel request created: %s", model.id)
        return TravelRequestResponse.from_model(model)

    async def get_by_id(self, id: str) -> TravelRequestResponse:
        """
        Retrieve a single travel request by its ID.

        Parameters
        ----------
        id:
            String-encoded MongoDB ObjectId.

        Returns
        -------
        TravelRequestResponse

        Raises
        ------
        NotFoundError
            If the document does not exist or the ID is malformed.
        ServiceError
            If the repository fails for an infrastructure reason.
        """
        try:
            model = await self._repo.get_by_id(id)
        except RepositoryError as exc:
            logger.error("Repository failure during get_by_id(%s): %s", id, exc.detail)
            raise ServiceError(
                f"Could not retrieve travel request: {exc.detail}"
            ) from exc

        if model is None:
            raise NotFoundError(f"Travel request '{id}' not found.")

        return TravelRequestResponse.from_model(model)

    async def list(
        self,
        filters: dict[str, Any] | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> TravelRequestListResponse:
        """
        Return a paginated, newest-first list of travel requests.

        Parameters
        ----------
        filters:
            Optional MongoDB query dict passed through to the repository.
            Future phases will populate this from query parameters
            (status, trip_type, destination_city, etc.).
        skip:
            Zero-based offset for pagination.
        limit:
            Maximum documents per page.

        Returns
        -------
        TravelRequestListResponse

        Raises
        ------
        ServiceError
            If the repository fails for an infrastructure reason.
        """
        try:
            total, models = await self._repo.list(
                filters=filters, skip=skip, limit=limit
            )
        except RepositoryError as exc:
            logger.error("Repository failure during list: %s", exc.detail)
            raise ServiceError(
                f"Could not list travel requests: {exc.detail}"
            ) from exc

        return TravelRequestListResponse(
            total=total,
            skip=skip,
            limit=limit,
            data=[TravelRequestResponse.from_model(m) for m in models],
        )

    async def update(
        self,
        id: str,
        data: TravelRequestUpdate,
    ) -> TravelRequestResponse:
        """
        Partially update a travel request and validate the resulting merged state.

        Why validate the merged state (not just the incoming payload)?
        -------------------------------------------------------------
        Consider a document where ``special_needs=True`` and
        ``notes="Wheelchair assistance"``.  A PATCH payload of
        ``{"notes": null}`` is individually valid — but after merging it
        produces ``{special_needs: True, notes: null}``, which violates the
        business rule.  Validating only the payload would miss this.

        Merge strategy
        --------------
        Start from the existing document's field values, then overwrite only
        the fields that were **explicitly supplied** in the PATCH body
        (determined via ``model_fields_set``).

        Parameters
        ----------
        id:
            String-encoded MongoDB ObjectId of the document to update.
        data:
            Validated inbound PATCH schema (may be partially populated).

        Returns
        -------
        TravelRequestResponse
            The updated document.

        Raises
        ------
        NotFoundError
            If the document does not exist.
        BusinessRuleError
            If the merged state violates a business rule.
        ServiceError
            If the repository fails for an infrastructure reason.
        """
        # Step 1 — Load existing document.
        try:
            existing = await self._repo.get_by_id(id)
        except RepositoryError as exc:
            logger.error(
                "Repository failure loading document for update(%s): %s",
                id, exc.detail,
            )
            raise ServiceError(
                f"Could not retrieve travel request: {exc.detail}"
            ) from exc

        if existing is None:
            raise NotFoundError(f"Travel request '{id}' not found.")

        # Step 2 — Merge existing values with the explicitly-set PATCH fields.
        merged: dict[str, Any] = existing.model_dump()
        for field in data.model_fields_set:
            merged[field] = getattr(data, field)

        # Step 3 — Validate the merged state against business rules.
        merged_date: date = merged["travel_date"]
        self._validate_travel_date(merged_date)
        self._validate_notes(merged["special_needs"], merged["notes"])

        # Step 4 — Persist only the changed fields.
        try:
            updated = await self._repo.update(id, data)
        except RepositoryError as exc:
            logger.error("Repository failure during update(%s): %s", id, exc.detail)
            raise ServiceError(
                f"Could not update travel request: {exc.detail}"
            ) from exc

        if updated is None:
            # Extremely unlikely (race condition after get_by_id), but handled.
            raise NotFoundError(f"Travel request '{id}' not found.")

        logger.info("Travel request updated: %s", id)
        return TravelRequestResponse.from_model(updated)

    async def delete(self, id: str) -> None:
        """
        Delete a travel request by ID.

        Parameters
        ----------
        id:
            String-encoded MongoDB ObjectId of the document to delete.

        Raises
        ------
        NotFoundError
            If the document does not exist or the ID is malformed.
        ServiceError
            If the repository fails for an infrastructure reason.
        """
        try:
            deleted = await self._repo.delete(id)
        except RepositoryError as exc:
            logger.error("Repository failure during delete(%s): %s", id, exc.detail)
            raise ServiceError(
                f"Could not delete travel request: {exc.detail}"
            ) from exc

        if not deleted:
            raise NotFoundError(f"Travel request '{id}' not found.")

        logger.info("Travel request deleted: %s", id)

    # ── Private validators ────────────────────────────────────────────────────

    @staticmethod
    def _validate_travel_date(travel_date: date) -> None:
        """
        Enforce date range rules.

        Rules
        -----
        1. travel_date must not be in the past.
        2. travel_date must be within the next 365 days.

        Using ``timedelta(days=365)`` instead of ``date.replace(year+1)``
        to avoid a ValueError on leap-year dates (e.g. 2028-02-29 has
        no equivalent in 2029).

        Raises
        ------
        BusinessRuleError
        """
        today = today_utc()

        if travel_date < today:
            raise BusinessRuleError("travel_date cannot be in the past.")

        max_date = today + timedelta(days=365)
        if travel_date > max_date:
            raise BusinessRuleError(
                f"travel_date must be within the next 365 days "
                f"(on or before {max_date.isoformat()})."
            )

    @staticmethod
    def _validate_notes(special_needs: bool, notes: str | None) -> None:
        """
        Enforce the notes requirement rule.

        Rule
        ----
        notes are required when special_needs is True.

        Raises
        ------
        BusinessRuleError
        """
        if special_needs and not notes:
            raise BusinessRuleError(
                "notes are required when special_needs is True."
            )
