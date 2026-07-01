"""
Integration tests for the travel requests API endpoints.
"""
from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.models.travel_request import BudgetRange, TravelRequestStatus, TripType
from app.core.time import today_utc
from datetime import timedelta

# Shared test data for integration
# Use dependencies overrides to mock the database or just let it test the service endpoints if they are mocking out the repo.
# For API tests, we typically mock the service or the repository.
# Here we'll mock the service layer to keep tests isolated to the HTTP layer.

from unittest.mock import AsyncMock, MagicMock
from app.api.dependencies import get_travel_request_service
from app.services.travel_request_service import TravelRequestService
from app.schemas.travel_request import TravelRequestResponse, TravelRequestListResponse
from app.core.exceptions import BusinessRuleError, NotFoundError

# We will patch the dependency in each test
@pytest.fixture
def mock_service():
    service = MagicMock(spec=TravelRequestService)
    service.create = AsyncMock()
    service.get_by_id = AsyncMock()
    service.list = AsyncMock()
    service.update = AsyncMock()
    service.delete = AsyncMock()
    return service

@pytest.fixture
def client(mock_service):
    app.dependency_overrides[get_travel_request_service] = lambda: mock_service
    # We yield the client
    yield app
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_travel_request(client, mock_service):
    valid_date = (today_utc() + timedelta(days=10)).isoformat()
    req_data = {
        "destination_city": "Paris",
        "travel_date": valid_date,
        "trip_type": TripType.BUSINESS.value,
        "budget_range": BudgetRange.HIGH.value,
        "special_needs": False,
        "notes": None
    }
    
    # Setup mock response
    mock_service.create.return_value = TravelRequestResponse(
        id="dummy-id",
        status=TravelRequestStatus.PENDING,
        created_at="2026-07-01T12:00:00Z",
        updated_at="2026-07-01T12:00:00Z",
        **req_data
    )

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.post("/api/v1/requests", json=req_data)
        
    assert response.status_code == 201
    assert response.json()["id"] == "dummy-id"
    assert response.json()["destination_city"] == "Paris"


@pytest.mark.asyncio
async def test_create_travel_request_business_rule_error(client, mock_service):
    valid_date = (today_utc() + timedelta(days=10)).isoformat()
    req_data = {
        "destination_city": "Paris",
        "travel_date": valid_date,
        "trip_type": TripType.BUSINESS.value,
        "budget_range": BudgetRange.HIGH.value,
        "special_needs": True,
        "notes": None
    }
    
    # Simulate a business rule error from the service
    mock_service.create.side_effect = BusinessRuleError("notes are required when special_needs is True.")

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.post("/api/v1/requests", json=req_data)
        
    assert response.status_code == 422
    assert response.json()["detail"] == "notes are required when special_needs is True."


@pytest.mark.asyncio
async def test_get_travel_request(client, mock_service):
    valid_date = (today_utc() + timedelta(days=10)).isoformat()
    req_data = {
        "destination_city": "Paris",
        "travel_date": valid_date,
        "trip_type": TripType.BUSINESS.value,
        "budget_range": BudgetRange.HIGH.value,
        "special_needs": False,
        "notes": None
    }
    mock_service.get_by_id.return_value = TravelRequestResponse(
        id="dummy-id",
        status=TravelRequestStatus.PENDING,
        created_at="2026-07-01T12:00:00Z",
        updated_at="2026-07-01T12:00:00Z",
        **req_data
    )

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.get("/api/v1/requests/dummy-id")
        
    assert response.status_code == 200
    assert response.json()["id"] == "dummy-id"


@pytest.mark.asyncio
async def test_get_travel_request_not_found(client, mock_service):
    mock_service.get_by_id.side_effect = NotFoundError("Travel request not found")

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.get("/api/v1/requests/invalid-id")
        
    assert response.status_code == 404
    assert response.json()["detail"] == "Travel request not found"


@pytest.mark.asyncio
async def test_list_travel_requests(client, mock_service):
    mock_service.list.return_value = TravelRequestListResponse(
        total=0,
        skip=0,
        limit=10,
        data=[]
    )

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.get("/api/v1/requests")
        
    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["data"] == []


@pytest.mark.asyncio
async def test_update_travel_request(client, mock_service):
    valid_date = (today_utc() + timedelta(days=10)).isoformat()
    req_data = {
        "destination_city": "London",
        "travel_date": valid_date,
        "trip_type": TripType.BUSINESS.value,
        "budget_range": BudgetRange.HIGH.value,
        "special_needs": False,
        "notes": None
    }
    mock_service.update.return_value = TravelRequestResponse(
        id="dummy-id",
        status=TravelRequestStatus.PENDING,
        created_at="2026-07-01T12:00:00Z",
        updated_at="2026-07-01T12:00:00Z",
        **req_data
    )

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.patch("/api/v1/requests/dummy-id", json={"destination_city": "London"})
        
    assert response.status_code == 200
    assert response.json()["destination_city"] == "London"


@pytest.mark.asyncio
async def test_delete_travel_request(client, mock_service):
    mock_service.delete.return_value = None

    async with AsyncClient(transport=ASGITransport(app=client), base_url="http://test") as ac:
        response = await ac.delete("/api/v1/requests/dummy-id")
        
    assert response.status_code == 204
