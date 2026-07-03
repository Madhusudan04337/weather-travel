import httpx
from typing import Any, Dict, List

class GeocodingClientError(Exception):
    pass

class GeocodingClient:
    """
    Client for interacting with the Open-Meteo Geocoding API for autocomplete.
    """
    GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"

    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    async def search_cities(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        params = {
            "name": query,
            "count": limit,
            "format": "json"
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(self.GEOCODING_API_URL, params=params)
                response.raise_for_status()
                data = response.json()
                return data.get("results", [])
            except httpx.HTTPError as exc:
                raise GeocodingClientError(f"HTTP Error occurred: {exc}")
