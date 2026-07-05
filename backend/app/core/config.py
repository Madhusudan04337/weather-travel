from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache
import json


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Weather Travel API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "weather_travel"

    # JWT
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS — can be overridden via ALLOWED_ORIGINS env var on Render
    # Accepted formats:
    #   JSON array:        '["https://a.com","https://b.com"]'
    #   Comma-separated:   'https://a.com,https://b.com'
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://sky-route.netlify.app",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: object) -> list[str]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            value = value.strip()
            # Try JSON array first: ["url1","url2"]
            if value.startswith("["):
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [str(v).strip() for v in parsed]
                except json.JSONDecodeError:
                    pass
            # Fall back to comma-separated: url1,url2
            return [v.strip() for v in value.split(",") if v.strip()]
        return value  # type: ignore[return-value]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
