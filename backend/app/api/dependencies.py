"""
FastAPI dependencies for dependency injection.
"""

from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.repositories.travel_request_repository import TravelRequestRepository
from app.services.travel_request_service import TravelRequestService
from app.services.weather_service import WeatherService
from app.services.recommendation_service import RecommendationService

def get_travel_request_repository(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> TravelRequestRepository:
    return TravelRequestRepository(db)


def get_weather_service() -> WeatherService:
    return WeatherService()

def get_recommendation_service() -> RecommendationService:
    return RecommendationService()

def get_travel_request_service(
    repo: TravelRequestRepository = Depends(get_travel_request_repository),
    weather_service: WeatherService = Depends(get_weather_service),
    recommendation_service: RecommendationService = Depends(get_recommendation_service),
) -> TravelRequestService:
    return TravelRequestService(repo, weather_service, recommendation_service)
