"""
Time utilities for the application.

Centralising datetime access here gives two benefits:
  1. No repeated ``datetime.now(timezone.utc)`` boilerplate.
  2. Tests can patch a single import point to freeze time, making date-
     sensitive business-rule tests deterministic regardless of when they run.
"""
from __future__ import annotations

from datetime import date, datetime, timezone


def utc_now() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def today_utc() -> date:
    """Return today's date in UTC."""
    return utc_now().date()
