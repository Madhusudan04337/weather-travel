"""
Application-wide constants.

Centralising values like collection names here means a single place to
update if a collection is renamed — rather than hunting through every
repository file.
"""
from __future__ import annotations

# ── MongoDB collection names ──────────────────────────────────────────────────

TRAVEL_REQUEST_COLLECTION: str = "travel_requests"

# Future collections will be declared here, e.g.:
# USER_COLLECTION: str = "users"
# WEATHER_CACHE_COLLECTION: str = "weather_cache"
