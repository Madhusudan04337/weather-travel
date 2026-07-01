from datetime import date as dt_date
from pydantic import BaseModel, Field

class WeatherLocation(BaseModel):
    """
    Represents the geographic location of a city.
    """
    name: str = Field(..., description="Name of the city.")
    latitude: float = Field(..., description="Latitude coordinate.")
    longitude: float = Field(..., description="Longitude coordinate.")
    country: str | None = Field(default=None, description="Country name.")

class WeatherForecast(BaseModel):
    """
    Represents the weather forecast for a specific date.
    """
    date: dt_date = Field(..., description="Date of the forecast.")
    temperature_max: float = Field(..., description="Maximum temperature in Celsius.")
    temperature_min: float = Field(..., description="Minimum temperature in Celsius.")
    precipitation_probability: int = Field(..., description="Probability of precipitation (percentage).")
    weather_code: int = Field(..., description="WMO Weather interpretation code.")
    weather_description: str = Field(..., description="Human-readable description of the weather code.")

class WeatherSummary(BaseModel):
    """
    A high-level summary combining the location and its specific forecast.
    """
    location: WeatherLocation
    forecast: WeatherForecast
