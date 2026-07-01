from datetime import date
from app.clients.open_meteo_client import OpenMeteoClient
from app.schemas.weather import WeatherLocation, WeatherForecast, WeatherSummary
from app.utils.weather_codes import get_weather_description

class WeatherServiceError(Exception):
    pass

class WeatherService:
    """
    Orchestrates the retrieval of weather data from Open-Meteo and
    transforms raw JSON responses into strongly-typed Pydantic schemas.
    """
    
    def __init__(self, client: OpenMeteoClient | None = None):
        self.client = client or OpenMeteoClient()
        
    async def get_weather_summary(self, city: str, travel_date: date) -> WeatherSummary:
        """
        Searches for the given city, fetches the forecast for the travel_date,
        and returns a WeatherSummary object.
        """
        # 1. Search the city to get coordinates
        city_data = await self.client.search_city(city)
        
        # 2. Convert to WeatherLocation schema
        location = WeatherLocation(
            name=city_data.get("name", city),
            latitude=city_data["latitude"],
            longitude=city_data["longitude"],
            country=city_data.get("country")
        )
        
        # 3. Fetch the forecast using the retrieved coordinates
        forecast_data = await self.client.get_forecast(
            latitude=location.latitude,
            longitude=location.longitude,
            travel_date=travel_date
        )
        
        # 4. Extract data from the 'daily' arrays
        daily = forecast_data.get("daily", {})
        if not daily or not daily.get("time"):
            raise WeatherServiceError(f"No daily forecast data returned for {travel_date}.")
            
        # The API returns arrays; we take the first element (index 0) 
        # since we requested start_date = end_date = travel_date
        wmo_code = daily.get("weather_code", [0])[0]
        
        forecast = WeatherForecast(
            date=travel_date,
            temperature_max=daily.get("temperature_2m_max", [0.0])[0],
            temperature_min=daily.get("temperature_2m_min", [0.0])[0],
            precipitation_probability=daily.get("precipitation_probability_max", [0])[0],
            weather_code=wmo_code,
            weather_description=get_weather_description(wmo_code)
        )
        
        # 5. Return the combined summary
        return WeatherSummary(
            location=location,
            forecast=forecast
        )
