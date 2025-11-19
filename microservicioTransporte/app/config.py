from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Microservicio Transporte"
    database_url: str = "postgresql+psycopg2://etxebus:etxebus@transporte-db:5432/etxebus_transporte"
    default_headway_minutes: int = 12
    service_start_hour: int = 5
    timezone: str = "UTC"

    class Config:
        env_prefix = "TRANSPORTE_"


def get_settings() -> Settings:
    return Settings()
