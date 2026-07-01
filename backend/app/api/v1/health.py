from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health check")
async def health_check():
    """
    Returns the current health status of the API.

    - **status**: always "ok" when the service is up
    - **timestamp**: UTC time of the check
    - **version**: application version string
    """
    return {
        "status": "ok",
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "version": "1.0.0",
    }
