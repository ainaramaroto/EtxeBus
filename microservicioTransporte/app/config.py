from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration pulled from the environment."""

    app_name: str = "microservicioTransporte"
    database_url: str = "postgresql+psycopg2://etxebus:etxebus@localhost:5432/etxebus_transporte"
    timezone: str = "UTC"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="TRANSPORTE_",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
