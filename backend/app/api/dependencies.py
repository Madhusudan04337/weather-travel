"""
FastAPI dependencies for dependency injection.
"""
from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.repositories.travel_request_repository import TravelRequestRepository
from app.services.travel_request_service import TravelRequestService


def get_travel_request_repository(
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> TravelRequestRepository:
    return TravelRequestRepository(db)


def get_travel_request_service(
    repo: TravelRequestRepository = Depends(get_travel_request_repository)
) -> TravelRequestService:
    return TravelRequestService(repo)
