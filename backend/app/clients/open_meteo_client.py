import httpx
from datetime import date
from typing import Any, Dict, Optional

class OpenMeteoClientError(Exception):
    """Base exception for Open-Meteo client errors."""
    pass

class CityNotFoundError(OpenMeteoClientError):
    """Raised when a city cannot be found via the geocoding API."""
    pass

class OpenMeteoClient:
    """
    A lightweight client strictly responsible for communicating with Open-Meteo APIs.
    """

    GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"
    FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    async def search_city(self, city: str) -> Dict[str, Any]:
        """
        Call the Open-Meteo Geocoding API to find the best matching city.
        
        Returns a dictionary representing the city data, e.g.:
        {
            "name": "Chennai",
            "latitude": 13.08784,
            "longitude": 80.27847,
            "country": "India"
        }
        """
        params = {
            "name": city,
            "count": 1,
            "format": "json"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.GEOCODING_API_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            results = data.get("results")
            if not results:
                raise CityNotFoundError(f"City '{city}' not found.")
                
            return results[0]

    async def get_forecast(
        self,
        latitude: float,
        longitude: float,
        travel_date: date,
    ) -> Dict[str, Any]:
        """
        Call the Open-Meteo Forecast API to get weather for the requested travel date.
        
        Returns a dictionary containing daily weather data.
        """
        date_str = travel_date.isoformat()
        
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": date_str,
            "end_date": date_str,
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
            "timezone": "auto"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.FORECAST_API_URL, params=params)
            response.raise_for_status()
            return response.json()
