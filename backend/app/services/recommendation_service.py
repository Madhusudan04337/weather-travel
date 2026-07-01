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
        
        # Heavy Rain or Thunderstorms
        if code in [65, 67, 75, 82, 86, 95, 96, 99]:
            return Recommendation(
                suitable=False,
                title="Not Recommended",
                message="Consider postponing the trip due to heavy rain or thunderstorms.",
                risk_level="high",
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
                message="Carry an umbrella.",
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
            message="Great weather for travel.",
            risk_level="low",
        )
