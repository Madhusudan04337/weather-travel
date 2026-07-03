from pydantic import BaseModel

class CityResponse(BaseModel):
    name: str
    state: str | None = None
    country: str | None = None
    latitude: float
    longitude: float
