"""
Pydantic schemas for the Travel Request API.

Layer responsibilities
----------------------
Schema  → validate **format and types** (whitespace, length, enum membership).
Service → validate **business rules** (date range, notes requirement).

Three public shapes:
  TravelRequestCreate       POST  /api/v1/travel-requests        (inbound)
  TravelRequestUpdate       PATCH /api/v1/travel-requests/{id}   (inbound)
  TravelRequestResponse     all outbound API responses           (outbound)
  TravelRequestListResponse paginated list wrapper               (outbound)

Enums are imported from the domain model — single source of truth.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.models.travel_request import (
    BudgetRange,
    TravelRequestModel,
    TravelRequestStatus,
    TripType,
)


# ── Re-export enums so the API layer never imports directly from models ────────
__all__ = [
    "BudgetRange",
    "TripType",
    "TravelRequestStatus",
    "TravelRequestCreate",
    "TravelRequestUpdate",
    "TravelRequestResponse",
    "TravelRequestListResponse",
]


# ── Shared validator helpers ──────────────────────────────────────────────────


def _strip_required(v: str) -> str:
    """Strip whitespace; raise if the result is empty."""
    stripped = v.strip()
    if not stripped:
        raise ValueError("must not be blank.")
    return stripped


def _strip_optional(v: str | None) -> str | None:
    """Strip whitespace from optional strings; normalise empty → None."""
    if v is None:
        return None
    stripped = v.strip()
    return stripped if stripped else None


# ── Base schema (shared fields + format validators) ───────────────────────────


class TravelRequestBase(BaseModel):
    """
    Shared field definitions and format-only validators for Create and Update.

    No business rules live here — those belong in ``TravelRequestService``.
    """

    destination_city: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["Tokyo"],
        description="Name of the destination city.",
    )
    travel_date: date = Field(
        ...,
        examples=["2026-09-15"],
        description="Planned departure date (ISO 8601, YYYY-MM-DD).",
    )
    trip_type: TripType = Field(..., examples=[TripType.VACATION])
    budget_range: BudgetRange = Field(..., examples=[BudgetRange.MEDIUM])
    special_needs: bool = Field(
        default=False,
        description="Whether the traveller has special requirements.",
    )
    notes: str | None = Field(
        default=None,
        max_length=1000,
        description="Required when special_needs is True; optional otherwise.",
    )

    @field_validator("destination_city")
    @classmethod
    def validate_destination_city(cls, v: str) -> str:
        """Remove leading/trailing whitespace; reject blank strings."""
        return _strip_required(v)

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, v: str | None) -> str | None:
        """Normalise empty-string notes to None."""
        return _strip_optional(v)


# ── CREATE schema ─────────────────────────────────────────────────────────────


class TravelRequestCreate(TravelRequestBase):
    """
    Inbound body for POST /api/v1/travel-requests.

    Format validation is inherited from TravelRequestBase.

    Business rules (enforced in TravelRequestService.create):
      1. travel_date must not be in the past.
      2. travel_date must be within the next 365 days.
      3. notes are required when special_needs is True.
    """


# ── UPDATE schema ─────────────────────────────────────────────────────────────


class TravelRequestUpdate(BaseModel):
    """
    Inbound body for PATCH /api/v1/travel-requests/{id}.

    All fields are optional — only supplied fields are updated.

    Business rules (enforced in TravelRequestService.update):
      1. If travel_date is supplied it must not be in the past.
      2. If travel_date is supplied it must be within the next 365 days.
      3. If special_needs is set to True, notes must be supplied too.
    """

    destination_city: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Updated destination city.",
    )
    travel_date: date | None = Field(default=None, description="Updated travel date.")
    trip_type: TripType | None = Field(default=None)
    budget_range: BudgetRange | None = Field(default=None)
    special_needs: bool | None = Field(default=None)
    notes: str | None = Field(default=None, max_length=1000)
    status: TravelRequestStatus | None = Field(
        default=None,
        description="Status transition — only admin / approval workflow should set this.",
    )

    @field_validator("destination_city")
    @classmethod
    def validate_destination_city(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return _strip_required(v)

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, v: str | None) -> str | None:
        return _strip_optional(v)


# ── RESPONSE schema ───────────────────────────────────────────────────────────


class TravelRequestResponse(BaseModel):
    """
    Outbound representation returned for every travel request endpoint.

    Phase 1 response — deliberately minimal.
    ``weather``, ``recommendation``, ``approval``, and ``tasks`` are stored in
    the database document (TravelRequestModel) but excluded from the API
    response until their respective phases are implemented.

    Enum fields are preserved as typed Enums; FastAPI serialises them to
    their string values automatically via the JSON response encoder.
    """

    id: str = Field(..., description="MongoDB document ID.")
    destination_city: str
    travel_date: date
    trip_type: TripType
    budget_range: BudgetRange
    special_needs: bool
    notes: str | None
    status: TravelRequestStatus
    weather: dict[str, Any] | None = None
    recommendation: dict[str, Any] | None = None
    approval: dict[str, Any] | None = None
    tasks: list[dict[str, Any]] = []

    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: TravelRequestModel) -> "TravelRequestResponse":
        """
        Construct a response from the domain model.

        Uses ``model_validate`` (Pydantic v2) to coerce the domain model dict
        into the response shape, automatically excluding unrecognised fields
        (e.g. placeholder fields not yet exposed in the API).
        """
        return cls.model_validate(model.model_dump())

    model_config = {"populate_by_name": True}


# ── PAGINATED LIST wrapper ────────────────────────────────────────────────────


class TravelRequestListResponse(BaseModel):
    """Paginated list wrapper returned by GET /api/v1/travel-requests."""

    total: int = Field(..., description="Total number of matching documents.")
    skip: int = Field(..., description="Number of documents skipped (offset).")
    limit: int = Field(..., description="Maximum documents returned in this page.")
    data: list[TravelRequestResponse]
