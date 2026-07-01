"""
Unit tests for TravelRequestService.

Strategy
--------
- The repository is fully mocked (AsyncMock) — no MongoDB connection needed.
- ``today_utc`` is patched to a fixed date (2026-07-01) so every date-
  sensitive assertion is deterministic regardless of when the suite runs.
- Each test is focused on a single behaviour or rule.

Test matrix
-----------
create
  ✅ valid request
  ✅ past date            → BusinessRuleError
  ✅ date beyond 365 days → BusinessRuleError
  ✅ special_needs=True, notes=None  → BusinessRuleError
  ✅ special_needs=True, notes given → OK

get_by_id
  ✅ existing document  → TravelRequestResponse
  ✅ not found          → NotFoundError

list
  ✅ empty collection   → TravelRequestListResponse(total=0, data=[])
  ✅ with documents     → TravelRequestListResponse(total=n, data=[...])

update
  ✅ destination only              → OK
  ✅ notes=None + special_needs=True already set → BusinessRuleError (merged-state)
  ✅ disable special_needs, clear notes          → OK (rule no longer applies)
  ✅ not found                                   → NotFoundError

delete
  ✅ existing document → None (success)
  ✅ not found         → NotFoundError
"""
from __future__ import annotations

import pytest
from datetime import date, datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.exceptions import BusinessRuleError, NotFoundError, ServiceError
from app.models.travel_request import (
    BudgetRange,
    TravelRequestModel,
    TravelRequestStatus,
    TripType,
)
from app.schemas.travel_request import (
    TravelRequestCreate,
    TravelRequestListResponse,
    TravelRequestResponse,
    TravelRequestUpdate,
)
from app.services.travel_request_service import TravelRequestService

# ── Fixed test date (patched as "today") ──────────────────────────────────────

FIXED_TODAY = date(2026, 7, 1)
VALID_DATE = FIXED_TODAY + timedelta(days=90)   # 2026-09-29 — always valid
PAST_DATE = FIXED_TODAY - timedelta(days=1)     # 2026-06-30 — always past
FAR_DATE = FIXED_TODAY + timedelta(days=366)    # beyond 365-day window

# Module path of today_utc used inside the service (patch this, not the source)
_TODAY_PATCH = "app.services.travel_request_service.today_utc"


# ── Shared fixtures ───────────────────────────────────────────────────────────


@pytest.fixture
def mock_repo() -> MagicMock:
    """Fully mocked TravelRequestRepository with async methods."""
    repo = MagicMock()
    repo.create = AsyncMock()
    repo.get_by_id = AsyncMock()
    repo.list = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    return repo


@pytest.fixture
def service(mock_repo: MagicMock) -> TravelRequestService:
    return TravelRequestService(mock_repo)


def _make_model(**overrides) -> TravelRequestModel:
    """Build a TravelRequestModel with sensible defaults for testing."""
    now = datetime(2026, 7, 1, 0, 0, 0, tzinfo=timezone.utc)
    defaults: dict = {
        "id": "507f1f77bcf86cd799439011",
        "destination_city": "Tokyo",
        "travel_date": VALID_DATE,
        "trip_type": TripType.VACATION,
        "budget_range": BudgetRange.MEDIUM,
        "special_needs": False,
        "notes": None,
        "status": TravelRequestStatus.PENDING,
        "weather": None,
        "recommendation": None,
        "approval": None,
        "tasks": [],
        "created_at": now,
        "updated_at": now,
    }
    defaults.update(overrides)
    return TravelRequestModel(**defaults)


def _make_create(**overrides) -> TravelRequestCreate:
    """Build a TravelRequestCreate with valid defaults."""
    defaults: dict = {
        "destination_city": "Tokyo",
        "travel_date": VALID_DATE,
        "trip_type": TripType.VACATION,
        "budget_range": BudgetRange.MEDIUM,
        "special_needs": False,
        "notes": None,
    }
    defaults.update(overrides)
    # Bypass schema-level validation (business rules live in service)
    return TravelRequestCreate.model_construct(**defaults)


# ── create() ─────────────────────────────────────────────────────────────────


class TestCreate:
    async def test_valid_request_calls_repo_and_returns_response(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        model = _make_model()
        mock_repo.create.return_value = model
        data = _make_create()

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            result = await service.create(data)

        mock_repo.create.assert_awaited_once_with(data)
        assert isinstance(result, TravelRequestResponse)
        assert result.destination_city == "Tokyo"
        assert result.status == TravelRequestStatus.PENDING

    async def test_past_date_raises_business_rule_error(
        self, service: TravelRequestService
    ):
        data = _make_create(travel_date=PAST_DATE)

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            with pytest.raises(BusinessRuleError, match="cannot be in the past"):
                await service.create(data)

    async def test_date_beyond_365_days_raises_business_rule_error(
        self, service: TravelRequestService
    ):
        data = _make_create(travel_date=FAR_DATE)

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            with pytest.raises(BusinessRuleError, match="within the next 365 days"):
                await service.create(data)

    async def test_special_needs_true_without_notes_raises_business_rule_error(
        self, service: TravelRequestService
    ):
        data = _make_create(special_needs=True, notes=None)

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            with pytest.raises(BusinessRuleError, match="notes are required"):
                await service.create(data)

    async def test_special_needs_true_with_notes_succeeds(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        model = _make_model(special_needs=True, notes="Wheelchair assistance")
        mock_repo.create.return_value = model
        data = _make_create(special_needs=True, notes="Wheelchair assistance")

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            result = await service.create(data)

        assert result.special_needs is True
        assert result.notes == "Wheelchair assistance"


# ── get_by_id() ───────────────────────────────────────────────────────────────


class TestGetById:
    async def test_existing_document_returns_response(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        model = _make_model()
        mock_repo.get_by_id.return_value = model

        result = await service.get_by_id(model.id)

        mock_repo.get_by_id.assert_awaited_once_with(model.id)
        assert isinstance(result, TravelRequestResponse)
        assert result.id == model.id

    async def test_missing_document_raises_not_found_error(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        mock_repo.get_by_id.return_value = None

        with pytest.raises(NotFoundError, match="not found"):
            await service.get_by_id("507f1f77bcf86cd799439011")


# ── list() ────────────────────────────────────────────────────────────────────


class TestList:
    async def test_empty_collection_returns_empty_list_response(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        mock_repo.list.return_value = (0, [])

        result = await service.list()

        assert isinstance(result, TravelRequestListResponse)
        assert result.total == 0
        assert result.data == []

    async def test_returns_paginated_response_with_correct_totals(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        models = [_make_model(), _make_model(id="507f1f77bcf86cd799439012")]
        mock_repo.list.return_value = (10, models)

        result = await service.list(skip=0, limit=2)

        mock_repo.list.assert_awaited_once_with(filters=None, skip=0, limit=2)
        assert result.total == 10
        assert result.skip == 0
        assert result.limit == 2
        assert len(result.data) == 2


# ── update() ─────────────────────────────────────────────────────────────────


class TestUpdate:
    async def test_update_destination_only_succeeds(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        existing = _make_model(destination_city="Tokyo")
        updated = _make_model(destination_city="Osaka")
        mock_repo.get_by_id.return_value = existing
        mock_repo.update.return_value = updated

        data = TravelRequestUpdate.model_construct(
            _fields_set={"destination_city"},
            destination_city="Osaka",
        )

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            result = await service.update(existing.id, data)

        assert result.destination_city == "Osaka"
        mock_repo.update.assert_awaited_once()

    async def test_clearing_notes_while_special_needs_true_raises_business_rule_error(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        """
        Existing: special_needs=True, notes="Wheelchair assistance"
        PATCH:    notes=null
        Merged:   special_needs=True, notes=null  → rule violated
        """
        existing = _make_model(special_needs=True, notes="Wheelchair assistance")
        mock_repo.get_by_id.return_value = existing

        data = TravelRequestUpdate.model_construct(
            _fields_set={"notes"},
            notes=None,
        )

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            with pytest.raises(BusinessRuleError, match="notes are required"):
                await service.update(existing.id, data)

        mock_repo.update.assert_not_awaited()

    async def test_disabling_special_needs_and_clearing_notes_succeeds(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        """
        Existing: special_needs=True, notes="Wheelchair assistance"
        PATCH:    special_needs=False, notes=null
        Merged:   special_needs=False, notes=null  → rule no longer applies
        """
        existing = _make_model(special_needs=True, notes="Wheelchair assistance")
        updated = _make_model(special_needs=False, notes=None)
        mock_repo.get_by_id.return_value = existing
        mock_repo.update.return_value = updated

        data = TravelRequestUpdate.model_construct(
            _fields_set={"special_needs", "notes"},
            special_needs=False,
            notes=None,
        )

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            result = await service.update(existing.id, data)

        assert result.special_needs is False
        assert result.notes is None

    async def test_updating_to_past_date_raises_business_rule_error(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        existing = _make_model()
        mock_repo.get_by_id.return_value = existing

        data = TravelRequestUpdate.model_construct(
            _fields_set={"travel_date"},
            travel_date=PAST_DATE,
        )

        with patch(_TODAY_PATCH, return_value=FIXED_TODAY):
            with pytest.raises(BusinessRuleError, match="cannot be in the past"):
                await service.update(existing.id, data)

    async def test_not_found_raises_not_found_error(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        mock_repo.get_by_id.return_value = None

        data = TravelRequestUpdate.model_construct(
            _fields_set={"destination_city"},
            destination_city="Osaka",
        )

        with pytest.raises(NotFoundError):
            await service.update("507f1f77bcf86cd799439011", data)


# ── delete() ─────────────────────────────────────────────────────────────────


class TestDelete:
    async def test_existing_document_deletes_successfully(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        mock_repo.delete.return_value = True

        result = await service.delete("507f1f77bcf86cd799439011")

        mock_repo.delete.assert_awaited_once_with("507f1f77bcf86cd799439011")
        assert result is None  # delete() returns None on success

    async def test_missing_document_raises_not_found_error(
        self, service: TravelRequestService, mock_repo: MagicMock
    ):
        mock_repo.delete.return_value = False

        with pytest.raises(NotFoundError, match="not found"):
            await service.delete("507f1f77bcf86cd799439011")
