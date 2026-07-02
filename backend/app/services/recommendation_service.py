from app.schemas.weather import WeatherSummary
from app.schemas.recommendation import Recommendation

class RecommendationService:
    """
    Pure business logic service for generating travel recommendations based on weather.
    """
    
    def generate_recommendation(self, weather: WeatherSummary) -> Recommendation:
        """
        Evaluate weather conditions and return a deterministic recommendation.
        """
        code = weather.forecast.weather_code
        temp = weather.forecast.temperature_max
        rain = weather.forecast.precipitation_probability
        
        # Thunderstorms
        if code in [95, 96, 99]:
            return Recommendation(
                suitable=False,
                title="Severe Weather",
                message=(
                    f"Thunderstorms are expected with a {rain}% chance of rain. "
                    "Outdoor activities are not recommended. Consider postponing your trip."
                ),
                risk_level="high",
            )
            
        # Extreme Heat
        if temp >= 38:
            return Recommendation(
                suitable=True,
                title="Extreme Heat",
                message=(
                    "Very hot weather is expected. Stay hydrated, wear light clothing, "
                    "avoid outdoor activities during the afternoon, and carry water."
                ),
                risk_level="medium",
            )
            
        # Snow conditions
        if code in [71, 73, 77, 85]:
            return Recommendation(
                suitable=True,
                title="Winter Weather",
                message="Carry winter clothing.",
                risk_level="medium",
            )
            
        # Light / Moderate Rain or Drizzle
        if code in [51, 53, 55, 56, 57, 61, 63, 66, 80, 81]:
            return Recommendation(
                suitable=True,
                title="Rainy Conditions",
                message=(
                    f"There is a {rain}% chance of rain. "
                    "Carry an umbrella and plan indoor activities if needed."
                ),
                risk_level="medium",
            )
            
        # Fog
        if code in [45, 48]:
            return Recommendation(
                suitable=True,
                title="Low Visibility",
                message="Check transport schedules due to fog.",
                risk_level="medium",
            )

        # Clear or Cloudy (0, 1, 2, 3)
        return Recommendation(
            suitable=True,
            title="Great Weather",
            message=(
                f"Pleasant weather with a maximum temperature of {temp}°C. "
                "Great conditions for sightseeing and outdoor activities."
            ),
            risk_level="low",
        )
