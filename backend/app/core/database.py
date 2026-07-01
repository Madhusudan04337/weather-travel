"""
MongoDB connection manager and index initialisation.

Startup sequence (called from ``app/main.py`` lifespan):
  1. ``connect_to_mongo()``   — create the Motor client and verify connectivity.
  2. ``ensure_indexes()``     — create collection indexes (idempotent).

Shutdown sequence:
  1. ``close_mongo_connection()``
"""
from __future__ import annotations

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.core.config import settings
from app.core.constants import TRAVEL_REQUEST_COLLECTION

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo() -> None:
    """Create the Motor client and verify the connection with a ping."""
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    await db.client.admin.command("ping")


async def close_mongo_connection() -> None:
    """Close the Motor client connection pool."""
    if db.client is not None:
        db.client.close()


def get_database() -> AsyncIOMotorDatabase:
    """Return the Motor database instance for the configured database name."""
    return db.client[settings.DATABASE_NAME]


async def ensure_indexes() -> None:
    """
    Create all collection indexes required by the application.

    This function is **idempotent** — calling it multiple times is safe.
    MongoDB skips index creation if an identical index already exists.

    Called once during application startup (after ``connect_to_mongo``),
    NOT from individual repositories.  Keeping index definitions here
    gives a single place to audit what indexes exist across the application.

    travel_requests indexes
    -----------------------
    - ``created_at DESC``       — default sort for list() (newest first).
    - ``status ASC``            — future: filter by Pending / Approved / Rejected.
    - ``travel_date ASC``       — future: range queries (upcoming trips, etc.).
    - ``destination_city ASC``  — future: city-based search / filtering.
    """
    database = get_database()
    col = database[TRAVEL_REQUEST_COLLECTION]

    await col.create_index([("created_at", DESCENDING)], name="idx_created_at_desc")
    await col.create_index([("status", ASCENDING)], name="idx_status")
    await col.create_index([("travel_date", ASCENDING)], name="idx_travel_date")
    await col.create_index([("destination_city", ASCENDING)], name="idx_destination_city")

    logger.info(
        "Indexes ensured for collection '%s'.", TRAVEL_REQUEST_COLLECTION
    )
