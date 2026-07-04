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
        temp_max = weather.forecast.temperature_max
        temp_min = weather.forecast.temperature_min
        rain = weather.forecast.precipitation_probability
        
        # 1. Severe Weather / Thunderstorms (High Risk)
        if code in [95, 96, 99] or (code in [65, 67, 82] and rain > 80):
            message = (
                f"Severe weather expected with a {rain}% chance of heavy rain and storms. "
                "Major travel disruptions are likely."
            )
            if trip_type == TripType.ADVENTURE:
                message = f"Adventure activities are highly dangerous due to severe storms and {rain}% precipitation. Postpone outdoor plans."
            elif trip_type == TripType.BUSINESS:
                message = "Plan for severe delays. Reschedule in-person meetings to virtual if possible."
                
            return Recommendation(suitable=False, title="Severe Weather", message=message, risk_level="high")
            
        # 2. Extreme Heat (Medium/High Risk depending on trip)
        if temp_max >= 35:
            if trip_type == TripType.ADVENTURE:
                return Recommendation(
                    suitable=False, title="Extreme Heat Warning",
                    message=f"Highs reaching {temp_max}°C. Extreme heat poses severe risks for adventure activities. Postpone or strictly limit to early dawn.",
                    risk_level="high"
                )
            elif trip_type == TripType.VACATION:
                return Recommendation(
                    suitable=True, title="Very Hot Weather",
                    message=f"Temperatures up to {temp_max}°C. Stick to indoor, air-conditioned attractions and stay hydrated.",
                    risk_level="medium"
                )
            else:
                return Recommendation(
                    suitable=True, title="Heat Wave",
                    message=f"Highs of {temp_max}°C. Dress in light layers and minimize outdoor transit.",
                    risk_level="low"
                )
                
        # 3. Extreme Cold / Winter Conditions (Medium/High Risk)
        if temp_min <= -5 or code in [71, 73, 75, 77, 85, 86]:
            if trip_type == TripType.ADVENTURE:
                return Recommendation(
                    suitable=True, title="Freezing Conditions",
                    message=f"Lows of {temp_min}°C with potential snow. Requires specialized sub-zero winter gear and extreme weather experience.",
                    risk_level="high"
                )
            elif trip_type == TripType.BUSINESS:
                return Recommendation(
                    suitable=True, title="Winter Weather",
                    message="Snow and freezing temperatures expected. Expect transit delays and pack heavy winter business attire.",
                    risk_level="medium"
                )
            else:
                return Recommendation(
                    suitable=True, title="Cold & Snowy",
                    message="Perfect for winter tourism, but ensure you pack heavy coats and check road closures.",
                    risk_level="medium"
                )
                
        # 4. Rainy / Wet Conditions
        if code in [51, 53, 55, 56, 57, 61, 63, 66, 80, 81] or rain >= 60:
            if trip_type == TripType.VACATION:
                return Recommendation(
                    suitable=True, title="Rainy Conditions",
                    message=f"{rain}% chance of precipitation. Have backup indoor activities planned like museums or theaters.",
                    risk_level="medium"
                )
            elif trip_type == TripType.ADVENTURE:
                return Recommendation(
                    suitable=True, title="Wet & Slippery",
                    message=f"High rain probability ({rain}%). Trails will be muddy and slippery. Waterproof gear is mandatory.",
                    risk_level="medium"
                )
            else:
                return Recommendation(
                    suitable=True, title="Rain Expected",
                    message=f"Rain likely ({rain}%). Carry an umbrella and plan extra time for taxis or public transit.",
                    risk_level="low"
                )
                
        # 5. Low Visibility (Fog)
        if code in [45, 48]:
            return Recommendation(
                suitable=True, title="Low Visibility",
                message="Dense fog expected. Flights and road transport may face morning delays.",
                risk_level="medium"
            )

        # 6. Ideal / Clear Weather
        if trip_type == TripType.ADVENTURE:
            return Recommendation(
                suitable=True, title="Ideal Conditions",
                message=f"Excellent weather for outdoor adventures. Highs around {temp_max}°C and low rain risk ({rain}%).",
                risk_level="low"
            )
        elif trip_type == TripType.VACATION:
            return Recommendation(
                suitable=True, title="Great Weather",
                message=f"Perfect conditions for sightseeing. Enjoy comfortable temperatures up to {temp_max}°C.",
                risk_level="low"
            )
        else:
            return Recommendation(
                suitable=True, title="Clear Skies",
                message="Optimal weather for business travel. No weather-related disruptions expected.",
                risk_level="low"
            )
