from app.clients.geocoding_client import GeocodingClient
from app.schemas.city import CityResponse
import logging

logger = logging.getLogger(__name__)

class GeocodingService:
    def __init__(self, client: GeocodingClient | None = None):
        self.client = client or GeocodingClient()

    async def search_cities(self, query: str) -> list[CityResponse]:
        try:
            raw_results = await self.client.search_cities(query, limit=5)
            cities = []
            for r in raw_results:
                cities.append(CityResponse(
                    name=r.get("name", ""),
                    state=r.get("admin1", None),
                    country=r.get("country", None),
                    latitude=r.get("latitude", 0.0),
                    longitude=r.get("longitude", 0.0)
                ))
            return cities
        except Exception:
            logger.exception(f"Error fetching city suggestions for query: {query}")
            return []  # Return empty array on error as requested
