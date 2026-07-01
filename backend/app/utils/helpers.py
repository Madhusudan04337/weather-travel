from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(tz=timezone.utc)


def sanitize_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    """Convert MongoDB ObjectId to string and remove internal fields."""
    if doc is None:
        return {}
    sanitized = {k: v for k, v in doc.items() if k != "_id"}
    if "_id" in doc:
        sanitized["id"] = str(doc["_id"])
    return sanitized
