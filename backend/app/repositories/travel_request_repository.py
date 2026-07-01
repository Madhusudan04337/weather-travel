"""
Travel Request Repository — pure MongoDB I/O layer.

Responsibilities
----------------
✅ CRUD operations against the ``travel_requests`` collection.
✅ ObjectId ↔ string conversion.
✅ Python type → BSON-compatible primitive serialisation.
✅ Stamping system-managed fields (status, timestamps, placeholders) on create.
✅ Stamping ``updated_at`` on every update (persistence concern, not business).
✅ Catching and wrapping ``PyMongoError`` into ``RepositoryError``.

Explicitly NOT responsible for
--------------------------------
❌ Business rules (date range, notes requirement, etc.) → service layer.
❌ HTTP error responses                                 → API layer.
❌ Weather / recommendation / approval logic            → dedicated services.
❌ FastAPI imports of any kind.
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING, ReturnDocument
from pymongo.errors import PyMongoError

from app.core.constants import TRAVEL_REQUEST_COLLECTION
from app.core.exceptions import RepositoryError
from app.models.travel_request import TravelRequestModel, TravelRequestStatus
from app.schemas.travel_request import TravelRequestCreate, TravelRequestUpdate
from app.schemas.weather import WeatherSummary

logger = logging.getLogger(__name__)


class TravelRequestRepository:
    """
    Async repository for travel request documents.

    Instantiated per-request (or once per lifespan) and injected into
    the service layer via FastAPI's dependency system.

    Parameters
    ----------
    db:
        An ``AsyncIOMotorDatabase`` instance provided by
        ``app.core.database.get_database()``.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db[TRAVEL_REQUEST_COLLECTION]

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _to_object_id(id: str) -> ObjectId | None:
        """
        Parse a string into a BSON ``ObjectId``.

        Returns ``None`` on a malformed ID so callers can treat the
        situation as "not found" rather than a server error.
        """
        try:
            return ObjectId(id)
        except (InvalidId, TypeError):
            return None

    @staticmethod
    def _doc_to_model(doc: dict[str, Any]) -> TravelRequestModel:
        """
        Convert a raw MongoDB document to a ``TravelRequestModel``.

        Handles two Motor/MongoDB quirks:
        - ``_id`` (ObjectId) is renamed to ``id`` (str).
        - Datetime values returned by Motor are timezone-naive (UTC);
          UTC tzinfo is attached so Pydantic's typed field is satisfied.
        """
        data = dict(doc)
        data["id"] = str(data.pop("_id"))

        # Motor returns naive UTC datetimes — make them timezone-aware.
        for field in ("created_at", "updated_at"):
            value = data.get(field)
            if isinstance(value, datetime) and value.tzinfo is None:
                data[field] = value.replace(tzinfo=timezone.utc)

        return TravelRequestModel.model_validate(data)

    @staticmethod
    def _to_mongo_doc(data: dict[str, Any]) -> dict[str, Any]:
        """
        Serialise Python types to BSON-compatible primitives.

        Conversions applied
        -------------------
        - ``datetime.date`` → ISO string ``"YYYY-MM-DD"``
          MongoDB has no native date-only type; ISO strings are naturally
          sortable and round-trip through Pydantic cleanly on read-back.
        - ``Enum`` → ``.value`` (the underlying string primitive).
          Keeps stored documents readable without requiring enum imports
          at the database layer.
        - All other values pass through unchanged; Motor handles
          ``datetime``, ``bool``, ``int``, ``list``, ``None``, etc.
        """
        result: dict[str, Any] = {}
        for key, value in data.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, Enum):
                result[key] = value.value
            else:
                result[key] = value
        return result

    # ── Public CRUD methods ───────────────────────────────────────────────────

    async def create(self, data: TravelRequestCreate) -> TravelRequestModel:
        """
        Insert a new travel request document.

        The repository is responsible for adding all system-managed fields
        (``status``, ``created_at``, ``updated_at``, and future placeholders)
        so the service layer only needs to pass the validated user input.

        Parameters
        ----------
        data:
            A validated ``TravelRequestCreate`` schema from the service layer.

        Returns
        -------
        TravelRequestModel
            The fully persisted document, including the generated ``_id``.

        Raises
        ------
        RepositoryError
            If the insert or subsequent fetch fails.
        """
        now = datetime.now(tz=timezone.utc)

        doc = self._to_mongo_doc({
            **data.model_dump(),
            # ── System-managed fields ─────────────────────────────────────
            "status": TravelRequestStatus.PENDING,
            "created_at": now,
            "updated_at": now,
            # ── Future-phase placeholders (Phase 3-6) ─────────────────────
            "weather": None,
            "recommendation": None,
            "approval": None,
            "tasks": [],
        })

        try:
            result = await self._col.insert_one(doc)
            created = await self._col.find_one({"_id": result.inserted_id})
            if created is None:
                raise RepositoryError(
                    "create",
                    "Document not found immediately after insertion.",
                )
            logger.info("Created travel request %s", result.inserted_id)
            return self._doc_to_model(created)
        except RepositoryError:
            raise
        except PyMongoError as exc:
            logger.exception("MongoDB error during create")
            raise RepositoryError("create", str(exc)) from exc

    async def get_by_id(self, id: str) -> TravelRequestModel | None:
        """
        Retrieve a single document by its string-encoded ObjectId.

        Returns ``None`` if the ID is malformed or the document does
        not exist — the service layer decides whether to raise 404.

        Raises
        ------
        RepositoryError
            If the database query itself fails.
        """
        oid = self._to_object_id(id)
        if oid is None:
            logger.debug("get_by_id: '%s' is not a valid ObjectId", id)
            return None
        try:
            doc = await self._col.find_one({"_id": oid})
            return self._doc_to_model(doc) if doc else None
        except PyMongoError as exc:
            logger.exception("MongoDB error during get_by_id(%s)", id)
            raise RepositoryError("get_by_id", str(exc)) from exc

    async def list(
        self,
        filters: dict[str, Any] | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, list[TravelRequestModel]]:
        """
        Return a paginated, newest-first list of travel requests.

        Parameters
        ----------
        filters:
            Optional MongoDB query dict for future filtering support
            (e.g. by ``status``, ``trip_type``, ``destination_city``).
            Pass ``None`` (default) to return all documents.
        skip:
            Number of documents to skip (zero-based offset).
        limit:
            Maximum number of documents to return in this page.

        Returns
        -------
        tuple[int, list[TravelRequestModel]]
            ``(total_count, page)`` where ``total_count`` is the size of
            the filtered collection before pagination, enabling the caller
            to compute total page counts.

        Raises
        ------
        RepositoryError
            If either the count or the find query fails.
        """
        query = filters or {}
        try:
            total = await self._col.count_documents(query)
            cursor = (
                self._col.find(query)
                .sort("created_at", DESCENDING)
                .skip(skip)
                .limit(limit)
            )
            docs = await cursor.to_list(length=limit)
            return total, [self._doc_to_model(d) for d in docs]
        except PyMongoError as exc:
            logger.exception(
                "MongoDB error during list(skip=%d, limit=%d, filters=%r)",
                skip, limit, filters,
            )
            raise RepositoryError("list", str(exc)) from exc

    async def update(
        self,
        id: str,
        data: TravelRequestUpdate,
    ) -> TravelRequestModel | None:
        """
        Partially update a document using ``$set``.

        Only fields **explicitly set** in the PATCH payload are written —
        determined via ``model_fields_set`` rather than ``exclude_none``,
        so a caller can intentionally clear a nullable field (e.g. set
        ``notes=null``) without it being silently ignored.

        ``updated_at`` is always stamped to UTC now (persistence concern).

        Parameters
        ----------
        id:
            String ObjectId of the document to update.
        data:
            Validated ``TravelRequestUpdate`` schema from the service layer.

        Returns
        -------
        TravelRequestModel | None
            The updated document, or ``None`` if the ID was not found.

        Raises
        ------
        RepositoryError
            If the database operation fails.
        """
        oid = self._to_object_id(id)
        if oid is None:
            logger.debug("update: '%s' is not a valid ObjectId", id)
            return None

        # Use model_fields_set — only fields the caller explicitly included
        # in the PATCH body (even if their value is None / null).
        explicitly_set = data.model_dump(include=data.model_fields_set)
        update_payload = self._to_mongo_doc(explicitly_set)
        update_payload["updated_at"] = datetime.now(tz=timezone.utc)

        try:
            updated_doc = await self._col.find_one_and_update(
                {"_id": oid},
                {"$set": update_payload},
                return_document=ReturnDocument.AFTER,
            )
            if updated_doc is None:
                logger.debug("update: document '%s' not found", id)
                return None
            logger.info("Updated travel request %s", id)
            return self._doc_to_model(updated_doc)
        except PyMongoError as exc:
            logger.exception("MongoDB error during update(%s)", id)
            raise RepositoryError("update", str(exc)) from exc

    async def update_weather(self, id: str, weather: WeatherSummary) -> bool:
        """
        Update the weather field for a specific travel request document.

        Parameters
        ----------
        id:
            String ObjectId of the document to update.
        weather:
            The WeatherSummary schema object to embed in the document.

        Returns
        -------
        bool
            ``True`` if the document was updated, ``False`` if not found.

        Raises
        ------
        RepositoryError
            If the database operation fails.
        """
        oid = self._to_object_id(id)
        if oid is None:
            logger.debug("update_weather: '%s' is not a valid ObjectId", id)
            return False

        try:
            result = await self._col.update_one(
                {"_id": oid},
                {"$set": {"weather": weather.model_dump()}}
            )
            updated = result.modified_count == 1
            if updated:
                logger.info("Updated weather for travel request %s", id)
            else:
                logger.debug("update_weather: document '%s' not found or unmodified", id)
            return updated
        except PyMongoError as exc:
            logger.exception("MongoDB error during update_weather(%s)", id)
            raise RepositoryError("update_weather", str(exc)) from exc

    async def delete(self, id: str) -> bool:
        """
        Hard-delete a document by its string ObjectId.

        Parameters
        ----------
        id:
            String ObjectId of the document to delete.

        Returns
        -------
        bool
            ``True`` if a document was deleted, ``False`` if the ID was
            not found or was malformed.

        Raises
        ------
        RepositoryError
            If the database operation fails.

        Note
        ----
        This is a hard delete.  A future soft-delete implementation would
        set ``deleted_at`` / ``is_deleted`` instead of removing the document,
        supporting audit trails and recovery.
        """
        oid = self._to_object_id(id)
        if oid is None:
            logger.debug("delete: '%s' is not a valid ObjectId", id)
            return False
        try:
            result = await self._col.delete_one({"_id": oid})
            deleted = result.deleted_count == 1
            if deleted:
                logger.info("Deleted travel request %s", id)
            else:
                logger.debug("delete: document '%s' not found", id)
            return deleted
        except PyMongoError as exc:
            logger.exception("MongoDB error during delete(%s)", id)
            raise RepositoryError("delete", str(exc)) from exc
