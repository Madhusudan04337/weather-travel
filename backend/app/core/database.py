from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None

db = Database()


async def connect_to_mongo() -> None:
    """Create database connection."""
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    # Ping to verify connection
    await db.client.admin.command("ping")


async def close_mongo_connection() -> None:
    """Close database connection."""
    if db.client is not None:
        db.client.close()


def get_database():
    """Return the motor database instance."""
    return db.client[settings.DATABASE_NAME]
