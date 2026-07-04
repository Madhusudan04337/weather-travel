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
from datetime import date, timedelta, datetime, timezone
from typing import Any

import httpx
from app.schemas.recommendation import Recommendation
from app.models.travel_request import Approval, ApprovalStatus, TravelRequestStatus, FulfillmentTask, TaskStatus

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
from app.services.recommendation_service import RecommendationService

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
    recommendation_service:
        A ``RecommendationService`` instance injected by FastAPI.
    """

    def __init__(
        self,
        repo: TravelRequestRepository,
        weather_service: WeatherService,
        recommendation_service: RecommendationService,
    ) -> None:
        self._repo = repo
        self._weather_service = weather_service
        self._recommendation_service = recommendation_service

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

        from app.clients.open_meteo_client import CityNotFoundError

        # ── Pre-validate the city and fetch weather ───────────────────────────
        try:
            weather_summary = await self._weather_service.get_weather_summary(
                data.destination_city, data.travel_date
            )
            forecast_unavailable = False
        except CityNotFoundError:
            from app.core.exceptions import BadRequestError
            raise BadRequestError("Destination city not found. Please enter a valid destination city.")
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 400:
                logger.info("Weather forecast unavailable for date %s", data.travel_date)
                weather_summary = None
                forecast_unavailable = True
            else:
                logger.exception("Weather integration failed with HTTP error")
                weather_summary = None
                forecast_unavailable = False
        except Exception:
            logger.exception("Weather integration failed")
            weather_summary = None
            forecast_unavailable = False

        # ── Create the request document ───────────────────────────────────────
        try:
            model = await self._repo.create(data)
        except RepositoryError as exc:
            logger.error("Repository failure during create: %s", exc.detail)
            raise ServiceError(
                f"Could not create travel request: {exc.detail}"
            ) from exc

        # ── Store pre-fetched weather data ────────────────────────────────────
        if weather_summary:
            updated = await self._repo.update_weather(model.id, weather_summary)
            if updated:
                model.weather = weather_summary.model_dump(mode="json")
                
            recommendation = self._recommendation_service.generate_recommendation(weather_summary, data.trip_type)
            rec_updated = await self._repo.update_recommendation(model.id, recommendation)
            if rec_updated:
                model.recommendation = recommendation.model_dump(mode="json")
                logger.info("Attached recommendation to travel request %s", model.id)
                
        elif forecast_unavailable:
            fallback_rec = Recommendation(
                suitable=False,
                title="Forecast Unavailable",
                message="Weather forecast is not available yet because the selected travel date is outside the forecast window. Please check again closer to your travel date.",
                risk_level="medium"
            )
            await self._repo.update_recommendation(model.id, fallback_rec)
            model.recommendation = fallback_rec.model_dump(mode="json")

        # ── Set up Approval Workflow ──────────────────────────────────────────
        if data.budget_range == "High":
            approval = Approval(
                required=True,
                status=ApprovalStatus.PENDING,
                approver="Manager"
            )
        else:
            approval = Approval(
                required=False,
                status=ApprovalStatus.NOT_REQUIRED
            )
            
        try:
            approval_updated = await self._repo.update_approval(model.id, approval)
            if approval_updated:
                model.approval = approval
                logger.info("Attached approval workflow to travel request %s", model.id)
        except Exception:
            logger.exception("Failed to attach approval workflow")

        # ── Handle Fulfillment Tasks (Low/Medium budget) ───────────────────────
        if data.budget_range != "High":
            tasks = [
                FulfillmentTask(
                    id="check_weather",
                    title="Check Weather Conditions",
                    description="Verify the latest weather forecast for the destination and travel date.",
                ),
                FulfillmentTask(
                    id="generate_recommendation",
                    title="Generate Travel Recommendation",
                    description="Analyse weather data and generate a personalised travel recommendation.",
                ),
                FulfillmentTask(
                    id="share_recommendation",
                    title="Share Recommendation with Requester",
                    description="Send the travel recommendation and weather report to the requester via email.",
                ),
            ]
            try:
                await self._repo.update_tasks(model.id, tasks)
                model.tasks = [t.model_dump(mode="json") for t in tasks]
                
                # Advance status to APPROVED immediately since no approval is needed
                await self._repo.update(model.id, TravelRequestUpdate(status=TravelRequestStatus.APPROVED))
                model.status = TravelRequestStatus.APPROVED
            except Exception:
                logger.exception("Failed to create initial fulfillment tasks")

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

    async def approve_request(self, id: str) -> TravelRequestResponse:
        """Approve a pending travel request."""
        try:
            existing = await self._repo.get_by_id(id)
        except RepositoryError as exc:
            raise ServiceError(f"Could not retrieve travel request: {exc.detail}") from exc
            
        if not existing:
            raise NotFoundError(f"Travel request '{id}' not found.")
            
        if not existing.approval or existing.approval.status != ApprovalStatus.PENDING:
            raise BusinessRuleError("Only pending requests can be approved.")
            
        # Update Approval object
        existing.approval.status = ApprovalStatus.APPROVED
        existing.approval.approved_at = datetime.now(tz=timezone.utc)
        
        try:
            await self._repo.update_approval(id, existing.approval)
            # Update TravelRequestStatus
            updated = await self._repo.update(id, TravelRequestUpdate(status=TravelRequestStatus.APPROVED))
        except RepositoryError as exc:
            raise ServiceError(f"Could not update travel request: {exc.detail}") from exc
            
        if not updated:
            raise NotFoundError(f"Travel request '{id}' not found.")
            
        # ── Auto-create fulfillment tasks upon approval ───────────────────────
        if not updated.tasks:
            tasks = [
                FulfillmentTask(
                    id="check_weather",
                    title="Check Weather Conditions",
                    description="Verify the latest weather forecast for the destination and travel date.",
                ),
                FulfillmentTask(
                    id="generate_recommendation",
                    title="Generate Travel Recommendation",
                    description="Analyse weather data and generate a personalised travel recommendation.",
                ),
                FulfillmentTask(
                    id="share_recommendation",
                    title="Share Recommendation with Requester",
                    description="Send the travel recommendation and weather report to the requester via email.",
                ),
            ]
            try:
                await self._repo.update_tasks(id, tasks)
                # reload to get the tasks
                updated = await self._repo.get_by_id(id)
            except Exception:
                logger.exception("Failed to auto-create fulfillment tasks on approval")

        logger.info("Travel request approved: %s", id)
        return TravelRequestResponse.from_model(updated)

    async def reject_request(self, id: str, remarks: str | None = None) -> TravelRequestResponse:
        """Reject a pending travel request."""
        try:
            existing = await self._repo.get_by_id(id)
        except RepositoryError as exc:
            raise ServiceError(f"Could not retrieve travel request: {exc.detail}") from exc
            
        if not existing:
            raise NotFoundError(f"Travel request '{id}' not found.")
            
        if not existing.approval or existing.approval.status != ApprovalStatus.PENDING:
            raise BusinessRuleError("Only pending requests can be rejected.")
            
        # Update Approval object
        existing.approval.status = ApprovalStatus.REJECTED
        existing.approval.rejected_at = datetime.now(tz=timezone.utc)
        existing.approval.remarks = remarks
        
        try:
            await self._repo.update_approval(id, existing.approval)
            # Update TravelRequestStatus to CLOSED
            updated = await self._repo.update(id, TravelRequestUpdate(status=TravelRequestStatus.CLOSED))
        except RepositoryError as exc:
            raise ServiceError(f"Could not update travel request: {exc.detail}") from exc
            
        if not updated:
            raise NotFoundError(f"Travel request '{id}' not found.")
            
        logger.info("Travel request rejected: %s", id)
        return TravelRequestResponse.from_model(updated)

    async def create_fulfillment_tasks(self, id: str) -> TravelRequestResponse:
        """Create the three standard fulfillment tasks for an approved request."""
        try:
            existing = await self._repo.get_by_id(id)
        except RepositoryError as exc:
            raise ServiceError(f"Could not retrieve travel request: {exc.detail}") from exc

        if not existing:
            raise NotFoundError(f"Travel request '{id}' not found.")

        if existing.status != TravelRequestStatus.APPROVED:
            raise BusinessRuleError("Fulfillment tasks can only be created for approved requests.")

        if existing.tasks:
            raise BusinessRuleError("Fulfillment tasks have already been created for this request.")

        tasks = [
            FulfillmentTask(
                id="check_weather",
                title="Check Weather Conditions",
                description="Verify the latest weather forecast for the destination and travel date.",
            ),
            FulfillmentTask(
                id="generate_recommendation",
                title="Generate Travel Recommendation",
                description="Analyse weather data and generate a personalised travel recommendation.",
            ),
            FulfillmentTask(
                id="share_recommendation",
                title="Share Recommendation with Requester",
                description="Send the travel recommendation and weather report to the requester via email.",
            ),
        ]

        try:
            await self._repo.update_tasks(id, tasks)
        except RepositoryError as exc:
            raise ServiceError(f"Could not create fulfillment tasks: {exc.detail}") from exc

        # Reload fresh document
        updated = await self._repo.get_by_id(id)
        if not updated:
            raise NotFoundError(f"Travel request '{id}' not found after task creation.")

        logger.info("Created fulfillment tasks for travel request %s", id)
        return TravelRequestResponse.from_model(updated)

    async def complete_task(self, request_id: str, task_id: str) -> TravelRequestResponse:
        """Mark a fulfillment task as completed. Auto-closes the request when all tasks are done."""
        try:
            existing = await self._repo.get_by_id(request_id)
        except RepositoryError as exc:
            raise ServiceError(f"Could not retrieve travel request: {exc.detail}") from exc

        if not existing:
            raise NotFoundError(f"Travel request '{request_id}' not found.")

        # Parse tasks from raw dicts
        tasks = [FulfillmentTask(**t) for t in existing.tasks]

        # Find the target task
        target = next((t for t in tasks if t.id == task_id), None)
        if not target:
            raise BusinessRuleError(f"Task '{task_id}' not found on this request.")

        if target.status == TaskStatus.COMPLETED:
            raise BusinessRuleError(f"Task '{task_id}' is already completed.")

        # Mark task complete
        target.status = TaskStatus.COMPLETED
        target.completed_at = datetime.now(tz=timezone.utc)

        try:
            await self._repo.update_tasks(request_id, tasks)
        except RepositoryError as exc:
            raise ServiceError(f"Could not complete task: {exc.detail}") from exc

        # Check if all tasks completed -> auto-close
        all_done = all(t.status == TaskStatus.COMPLETED for t in tasks)
        if all_done:
            try:
                await self._repo.update(request_id, TravelRequestUpdate(status=TravelRequestStatus.CLOSED))
            except RepositoryError as exc:
                raise ServiceError(f"Could not close travel request: {exc.detail}") from exc

            # Simulated email notification
            logger.info(
                "[EMAIL SIMULATED] Closure notification sent for travel request %s to requester.",
                request_id,
            )

        # Reload fresh document
        updated = await self._repo.get_by_id(request_id)
        if not updated:
            raise NotFoundError(f"Travel request '{request_id}' not found.")

        logger.info("Completed task '%s' on travel request %s", task_id, request_id)
        return TravelRequestResponse.from_model(updated)

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

        if existing.status != TravelRequestStatus.PENDING:
            raise BusinessRuleError("Only pending requests can be updated.")

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

        # Step 5 — Refresh weather and recommendation if relevant fields changed
        needs_weather_refresh = False
        if "destination_city" in data.model_fields_set and data.destination_city != existing.destination_city:
            needs_weather_refresh = True
        if "travel_date" in data.model_fields_set and data.travel_date != existing.travel_date:
            needs_weather_refresh = True

        if needs_weather_refresh:
            try:
                weather_summary = await self._weather_service.get_weather_summary(
                    updated.destination_city, updated.travel_date
                )
                
                weather_updated = await self._repo.update_weather(updated.id, weather_summary)
                if weather_updated:
                    updated.weather = weather_summary.model_dump(mode="json")
                    
                recommendation = self._recommendation_service.generate_recommendation(weather_summary, updated.trip_type)
                rec_updated = await self._repo.update_recommendation(updated.id, recommendation)
                if rec_updated:
                    updated.recommendation = recommendation.model_dump(mode="json")
                    logger.info("Attached new recommendation to travel request %s", updated.id)
                    
            except httpx.HTTPStatusError as exc:
                if exc.response.status_code == 400:
                    logger.info("Weather forecast unavailable for date %s", updated.travel_date)
                    fallback_rec = Recommendation(
                        suitable=False,
                        title="Forecast Unavailable",
                        message="Weather forecast is not available yet because the selected travel date is outside the forecast window. Please check again closer to your travel date.",
                        risk_level="medium"
                    )
                    await self._repo.update_recommendation(updated.id, fallback_rec)
                    updated.recommendation = fallback_rec.model_dump(mode="json")
                else:
                    logger.exception("Weather integration failed with HTTP error during update")
            except Exception:
                logger.exception("Weather integration failed during update")

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
            existing = await self._repo.get_by_id(id)
        except RepositoryError as exc:
            logger.error("Repository failure loading document for delete(%s): %s", id, exc.detail)
            raise ServiceError(f"Could not retrieve travel request: {exc.detail}") from exc

        if not existing:
            raise NotFoundError(f"Travel request '{id}' not found.")

        if existing.status != TravelRequestStatus.PENDING:
            raise BusinessRuleError("Only pending requests can be deleted.")

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
