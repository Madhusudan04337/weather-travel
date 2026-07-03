"""
REST API endpoints for travel requests.

This layer is extremely thin: it receives HTTP requests, delegates to the
service layer for all business logic, and returns the response. It does
not know about MongoDB, and it does not contain business rules.
"""
from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import get_travel_request_service
from app.schemas.travel_request import (
    TravelRequestCreate,
    TravelRequestListResponse,
    TravelRequestResponse,
    TravelRequestUpdate,
)
from app.services.travel_request_service import TravelRequestService


class RejectPayload(BaseModel):
    remarks: str | None = None

router = APIRouter(prefix="/requests", tags=["Travel Requests"])


@router.post(
    "",
    response_model=TravelRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new travel request",
)
async def create_travel_request(
    data: TravelRequestCreate,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.create(data)


@router.get(
    "/{id}",
    response_model=TravelRequestResponse,
    summary="Get a travel request by ID",
)
async def get_travel_request(
    id: str,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.get_by_id(id)


@router.get(
    "",
    response_model=TravelRequestListResponse,
    summary="List travel requests",
)
async def list_travel_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestListResponse:
    # Future: add filters here (status, city, etc.) and pass to list()
    return await service.list(filters=None, skip=skip, limit=limit)


# ── Specific sub-resource routes MUST come before the generic /{id} routes ──

@router.post(
    "/{id}/tasks",
    response_model=TravelRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create fulfillment tasks for an approved travel request",
)
async def create_fulfillment_tasks(
    id: str,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.create_fulfillment_tasks(id)


@router.patch(
    "/{id}/tasks/{task_id}/complete",
    response_model=TravelRequestResponse,
    summary="Mark a fulfillment task as completed",
)
async def complete_task(
    id: str,
    task_id: str,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.complete_task(request_id=id, task_id=task_id)


@router.patch(
    "/{id}/approve",
    response_model=TravelRequestResponse,
    summary="Approve a travel request",
)
async def approve_travel_request(
    id: str,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.approve_request(id)


@router.patch(
    "/{id}/reject",
    response_model=TravelRequestResponse,
    summary="Reject a travel request",
)
async def reject_travel_request(
    id: str,
    payload: RejectPayload,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.reject_request(id, remarks=payload.remarks)


# ── Generic /{id} routes (must come AFTER specific sub-resource routes) ──

@router.patch(
    "/{id}",
    response_model=TravelRequestResponse,
    summary="Partially update a travel request",
)
async def update_travel_request(
    id: str,
    data: TravelRequestUpdate,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> TravelRequestResponse:
    return await service.update(id, data)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a travel request",
)
async def delete_travel_request(
    id: str,
    service: TravelRequestService = Depends(get_travel_request_service),
) -> None:
    await service.delete(id)
