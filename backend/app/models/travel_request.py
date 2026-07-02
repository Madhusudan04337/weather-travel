"""
Domain model — represents a travel request document as stored in MongoDB.

This is NOT a Beanie/ODM model. It is a plain Pydantic model that describes
the shape of a MongoDB document, used internally by the repository and
service layers.  Motor handles all database I/O.
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class TripType(str, Enum):
    """Allowed trip categories."""

    VACATION = "Vacation"
    BUSINESS = "Business"
    ADVENTURE = "Adventure"


class BudgetRange(str, Enum):
    """Allowed budget brackets."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TravelRequestStatus(str, Enum):
    """Lifecycle status of a travel request."""

    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    CLOSED = "Closed"

class ApprovalStatus(str, Enum):
    """Approval workflow status."""

    NOT_REQUIRED = "Not Required"
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class Approval(BaseModel):
    """
    Approval workflow information.
    """

    required: bool
    status: ApprovalStatus
    approver: str | None = None
    approved_at: datetime | None = None
    rejected_at: datetime | None = None
    remarks: str | None = None
    

# ── Domain model ──────────────────────────────────────────────────────────────


class TravelRequestModel(BaseModel):
    """
    Full representation of a travel-request MongoDB document.

    Field naming convention
    -----------------------
    - ``id`` is the string-serialised ``_id`` (ObjectId) value.
      The repository is responsible for the ObjectId ↔ str conversion.
    - All datetime values are UTC-aware.

    Placeholder fields
    ------------------
    ``weather``, ``recommendation``, ``approval`` and ``tasks`` are
    reserved for future phases.  They are stored as ``None`` / ``[]``
    on creation so that the document schema is stable and downstream
    features can populate them without a schema migration.
    """

    # ── Identity ──────────────────────────────────────────────────────────────
    id: str = Field(..., description="String-encoded MongoDB ObjectId (_id).")

    # ── User-supplied fields ──────────────────────────────────────────────────
    destination_city: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Name of the destination city.",
    )
    travel_date: date = Field(..., description="Planned departure date (ISO 8601).")
    trip_type: TripType = Field(..., description="Category of the trip.")
    budget_range: BudgetRange = Field(..., description="Approximate budget bracket.")
    special_needs: bool = Field(
        default=False,
        description="Whether the traveller has special requirements.",
    )
    notes: str | None = Field(
        default=None,
        max_length=1000,
        description="Required when special_needs is True; optional otherwise.",
    )

    # ── System-managed fields ─────────────────────────────────────────────────
    status: TravelRequestStatus = Field(
        default=TravelRequestStatus.PENDING,
        description="Lifecycle status managed by the approval workflow.",
    )

    # ── Future-phase placeholders ─────────────────────────────────────────────
    weather: dict[str, Any] | None = Field(
        default=None,
        description="[Phase 3] Weather data fetched for the destination and date.",
    )
    recommendation: dict[str, Any] | None = Field(
        default=None,
        description="[Phase 4] AI recommendation output.",
    )
    approval: Approval | None = Field(
        default=None,
        description="[Phase 5] Approval workflow information.",
    )
    tasks: list[dict[str, Any]] = Field(
        default_factory=list,
        description="[Phase 6] Checklist / task items attached to this request.",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(tz=timezone.utc),
        description="UTC timestamp of document creation.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(tz=timezone.utc),
        description="UTC timestamp of the last update.",
    )

    model_config = {
        # Allow population from MongoDB dicts that use native Python types.
        "populate_by_name": True,
    }