import pytest

from app.core.config import Settings


def test_production_requires_database_and_cors(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    with pytest.raises(ValueError, match="DATABASE_URL"):
        Settings()

    monkeypatch.setenv("DATABASE_URL", "sqlite:///./local.db")
    with pytest.raises(ValueError, match="PostgreSQL"):
        Settings()

    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@example.test/db?sslmode=require")
    with pytest.raises(ValueError, match="CORS_ORIGINS"):
        Settings()


def test_production_database_url_and_cors_normalization(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@example.test/db?sslmode=require")
    monkeypatch.setenv("CORS_ORIGINS", "https://skillpath.vercel.app/")
    settings = Settings()
    assert settings.DATABASE_URL == "postgresql+psycopg://user:pass@example.test/db?sslmode=require"
    assert settings.CORS_ORIGINS == ["https://skillpath.vercel.app"]


def test_render_cannot_silently_use_development_defaults(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    with pytest.raises(ValueError, match="ENVIRONMENT=production"):
        Settings()
