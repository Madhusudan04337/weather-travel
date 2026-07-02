from app.schemas.weather import WeatherSummary
from app.schemas.recommendation import Recommendation
from app.models.travel_request import TripType

class RecommendationService:
    """
    Pure business logic service for generating travel recommendations based on weather.
    """
    
    def generate_recommendation(self, weather: WeatherSummary, trip_type: TripType) -> Recommendation:
        """
        Evaluate weather conditions and return a deterministic recommendation.
        """
        code = weather.forecast.weather_code
        temp = weather.forecast.temperature_max
        rain = weather.forecast.precipitation_probability
        
        # Thunderstorms
        if code in [95, 96, 99]:
            message = (
                f"Thunderstorms are expected with a {rain}% chance of rain. "
                "Outdoor activities are not recommended. Consider postponing your trip."
            )
            if trip_type == TripType.ADVENTURE:
                message = "Adventure activities are not recommended due to thunderstorms."
                
            return Recommendation(
                suitable=False,
                title="Severe Weather",
                message=message,
                risk_level="high",
            )
            
        # Extreme Heat
        if temp >= 38:
            if trip_type == TripType.VACATION:
                message = "Visit outdoor attractions during the morning or evening. Stay hydrated throughout the day."
            elif trip_type == TripType.BUSINESS:
                message = "Plan meetings indoors where possible and avoid unnecessary outdoor travel during peak heat."
            else: # Adventure
                message = "Avoid strenuous outdoor activities during the hottest part of the day and carry sufficient water."
                
            return Recommendation(
                suitable=True,
                title="Extreme Heat",
                message=message,
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
            if trip_type == TripType.BUSINESS:
                message = "Moderate rain is expected. Carry an umbrella and allow extra travel time."
            elif trip_type == TripType.VACATION:
                message = "Carry an umbrella and consider visiting museums or other indoor attractions during showers."
            else: # Adventure
                message = "Wet conditions may affect trekking or other outdoor activities. Use appropriate gear."
                
            return Recommendation(
                suitable=True,
                title="Rainy Conditions",
                message=message,
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
        if trip_type == TripType.VACATION:
            message = "Perfect weather for sightseeing and outdoor attractions. Enjoy your vacation, but stay hydrated during the warmer hours."
        elif trip_type == TripType.BUSINESS:
            message = "Weather conditions are suitable for business travel. Allow a little extra travel time if rain is expected."
        else: # Adventure
            message = "Weather conditions are suitable for outdoor activities. Always check local conditions before starting your adventure."

        return Recommendation(
            suitable=True,
            title="Great Weather",
            message=message,
            risk_level="low",
        )
