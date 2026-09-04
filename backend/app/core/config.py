from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TenderTracker Command Center API"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    
    # Database: SQLite by default for zero-config local dev, MySQL 8.4 ready
    DATABASE_URL: str = "sqlite:///./tender_tracker.db"
    
    # Local SSD storage directory
    STORAGE_ROOT: Path = Path(__file__).resolve().parent.parent.parent / "storage"
    
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

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
