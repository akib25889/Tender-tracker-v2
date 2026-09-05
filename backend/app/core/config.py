from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), str(ROOT_DIR / ".env"), ".env"),
        extra="ignore",
    )

    PROJECT_NAME: str = "TenderTracker Command Center API"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"

    # Database: SQLite by default for zero-config local dev, PostgreSQL / MySQL ready
    DATABASE_URL: str = "sqlite:///./tender_tracker.db"

    # Local SSD storage directory
    STORAGE_ROOT: Path = ROOT_DIR / "storage"

    # Security & JWT
    SECRET_KEY: str = "tendertracker-command-center-secret-key-2026-v2"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]


settings = Settings()
