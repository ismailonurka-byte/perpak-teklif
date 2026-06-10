from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # SMTP
    SMTP_ENABLED: bool = False
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # App
    APP_NAME: str = "Vanto"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    # Demo seed'leri (örnek müşteri/teklif/demo kullanıcı) yalnız bu açıkken çalışır.
    # Production'da kapalı kalmalı ki gerçek veri her boot'ta resetlenmesin/çakışmasın.
    SEED_DEMO: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def effective_database_url(self) -> str:
        """Render/Heroku 'postgres://' ve düz 'postgresql://' → 'postgresql+psycopg://'.
        SQLite ve zaten '+psycopg' içeren URL'lere dokunmaz."""
        url = self.DATABASE_URL
        if "+psycopg" in url or url.startswith("sqlite"):
            return url
        if url.startswith("postgres://"):
            return "postgresql+psycopg://" + url[len("postgres://"):]
        if url.startswith("postgresql://"):
            return "postgresql+psycopg://" + url[len("postgresql://"):]
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
