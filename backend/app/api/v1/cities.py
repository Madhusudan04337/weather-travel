from fastapi import APIRouter, Depends, Query
from app.services.geocoding_service import GeocodingService
from app.schemas.city import CityResponse

router = APIRouter(prefix="/cities", tags=["cities"])

def get_geocoding_service() -> GeocodingService:
    return GeocodingService()

@router.get("/search", response_model=list[CityResponse])
async def search_cities(
    q: str = Query(..., min_length=3, description="Search query for city name"),
    service: GeocodingService = Depends(get_geocoding_service)
):
    """
    Search for cities matching the query text.
    Returns an array of up to 5 cities.
    Returns an empty array if no matches are found.
    """
    return await service.search_cities(q)
