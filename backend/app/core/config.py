from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ResumeX API"
    app_version: str = "3.0.0"
    environment: str = Field(default="development", alias="NODE_ENV")
    port: int = 5000
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    frontend_url: str = "http://localhost:5173"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"]
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ai_cache_ttl_hours: int = 24
    max_upload_mb: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, value: str, info):
        environment = info.data.get("environment", "development")
        if not value:
            raise ValueError("JWT_SECRET is required")
        if environment == "production" and len(value) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters in production")
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def ai_enabled(self) -> bool:
        return bool(self.gemini_api_key or self.groq_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
