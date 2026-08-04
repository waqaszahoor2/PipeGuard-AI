from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: Literal["development", "test", "preview", "production"] = "development"
    app_version: str = "0.1.0"
    database_url: str = f"sqlite:///{PROJECT_ROOT / 'pipeguard.db'}"
    session_secret: str = "development-session-secret-change-me"
    csrf_secret: str = "development-csrf-secret-change-me"
    allowed_origins: str = "http://localhost:3000"
    model_path: Path = PROJECT_ROOT / "model_artifacts" / "approved_model.joblib"
    model_manifest_path: Path = PROJECT_ROOT / "model_artifacts" / "artifact_manifest.json"
    enable_demo_mode: bool = True
    enable_technician_login: bool = True
    max_csv_bytes: int = Field(default=4_000_000, ge=1, le=4_000_000)
    log_level: str = "INFO"
    access_session_minutes: int = Field(default=30, ge=5, le=240)
    login_rate_limit_per_minute: int = Field(default=10, ge=1, le=100)
    geocoder_base_url: str = "https://nominatim.openstreetmap.org"
    overpass_api_url: str = "https://overpass-api.de/api/interpreter"
    global_pipeline_max_results: int = Field(default=1000, ge=10, le=5000)
    global_pipeline_max_latitude_span: float = Field(default=2.0, ge=0.1, le=10.0)
    global_pipeline_max_longitude_span: float = Field(default=2.0, ge=0.1, le=10.0)
    geocoder_cache_seconds: int = Field(default=86400, ge=300)
    pipeline_cache_seconds: int = Field(default=1800, ge=60)

    @field_validator("session_secret", "csrf_secret")
    @classmethod
    def require_production_secret(cls, value: str, info):
        if not value:
            raise ValueError(f"{info.field_name} must not be empty")
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    def validate_production(self) -> None:
        if self.app_env == "production":
            for name, value in (
                ("session_secret", self.session_secret),
                ("csrf_secret", self.csrf_secret),
            ):
                if "change-me" in value or len(value) < 32:
                    raise RuntimeError(f"Secure {name} is required in production")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_production()
    return settings
