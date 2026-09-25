import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "SkillPath API"
    API_PREFIX = "/api"

    def __init__(self):
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
        if self.ENVIRONMENT not in {"development", "production"}:
            raise ValueError("ENVIRONMENT must be development or production.")
        if os.getenv("RENDER", "").lower() == "true" and self.ENVIRONMENT != "production":
            raise ValueError("Set ENVIRONMENT=production on Render.")

        database_url = os.getenv("DATABASE_URL", "").strip()
        if self.ENVIRONMENT == "production" and not database_url:
            raise ValueError("DATABASE_URL is required in production.")
        if database_url.startswith("postgres://"):
            database_url = "postgresql+psycopg://" + database_url[len("postgres://"):]
        elif database_url.startswith("postgresql://"):
            database_url = "postgresql+psycopg://" + database_url[len("postgresql://"):]
        self.DATABASE_URL = database_url or "sqlite:///./skillpath.db"
        if self.ENVIRONMENT == "production" and not self.DATABASE_URL.startswith("postgresql+psycopg://"):
            raise ValueError("Production DATABASE_URL must use PostgreSQL with psycopg.")

        origins = os.getenv("CORS_ORIGINS", "" if self.ENVIRONMENT == "production" else "http://localhost:3000")
        self.CORS_ORIGINS = [origin.strip().rstrip("/") for origin in origins.split(",") if origin.strip()]
        if self.ENVIRONMENT == "production" and (not self.CORS_ORIGINS or "*" in self.CORS_ORIGINS):
            raise ValueError("Production CORS_ORIGINS must list the frontend origin explicitly.")


settings = Settings()
