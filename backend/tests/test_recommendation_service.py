from datetime import date
import pytest
from app.schemas.weather import WeatherSummary, WeatherLocation, WeatherForecast
from app.services.recommendation_service import RecommendationService

@pytest.fixture
def service():
    return RecommendationService()

def create_mock_weather(weather_code: int) -> WeatherSummary:
    return WeatherSummary(
        location=WeatherLocation(name="Test City", latitude=0.0, longitude=0.0, country="Test"),
        forecast=WeatherForecast(
            date=date(2026, 1, 1),
            temperature_max=20.0,
            temperature_min=10.0,
            precipitation_probability=0,
            weather_code=weather_code,
            weather_description="Mock Description"
        )
    )

def test_recommendation_sunny(service):
    weather = create_mock_weather(0) # Clear sky
    rec = service.generate_recommendation(weather)
    
    assert rec.suitable is True
    assert rec.risk_level == "low"
    assert "Great Weather" in rec.title

def test_recommendation_rain(service):
    weather = create_mock_weather(61) # Rain
    rec = service.generate_recommendation(weather)
    
    assert rec.suitable is True
    assert rec.risk_level == "medium"
    assert "umbrella" in rec.message.lower()

def test_recommendation_heavy_rain(service):
    weather = create_mock_weather(95) # Thunderstorm
    rec = service.generate_recommendation(weather)
    
    assert rec.suitable is False
    assert rec.risk_level == "high"
    assert "postponing" in rec.message.lower()

def test_recommendation_snow(service):
    weather = create_mock_weather(71) # Snow
    rec = service.generate_recommendation(weather)
    
    assert rec.suitable is True
    assert rec.risk_level == "medium"
    assert "winter clothing" in rec.message.lower()

def test_recommendation_fog(service):
    weather = create_mock_weather(45) # Fog
    rec = service.generate_recommendation(weather)
    
    assert rec.suitable is True
    assert rec.risk_level == "medium"
    assert "transport schedules" in rec.message.lower()
