from typing import Literal
from pydantic import BaseModel, Field

class Recommendation(BaseModel):
    """
    Represents an actionable travel recommendation.
    """
    suitable: bool = Field(..., description="Whether the destination is suitable for travel.")
    title: str = Field(..., description="A short summary title of the recommendation.")
    message: str = Field(..., description="Detailed recommendation message.")
    risk_level: Literal["low", "medium", "high"] = Field(
        ..., description="The risk level associated with the weather conditions."
    )
