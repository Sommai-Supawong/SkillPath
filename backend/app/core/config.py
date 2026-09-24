import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "SkillPath API"
    API_PREFIX = "/api"
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./skillpath.db")
    CORS_ORIGINS = [origin.strip() for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",") if origin.strip()]


settings = Settings()
