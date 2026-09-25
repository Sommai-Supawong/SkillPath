from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


class Base(DeclarativeBase):
    pass


engine_kwargs = {"pool_pre_ping": True}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs.update(pool_size=2, max_overflow=1, pool_recycle=300)

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def ensure_schema() -> None:
    """Apply the small additive migration needed by pre-existing SQLite databases."""
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    if "skills" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("skills")}
    additions = {
        "skill_type": "VARCHAR(80) NOT NULL DEFAULT 'Tool'",
        "icon_key": "VARCHAR(80)",
        "icon_kind": "VARCHAR(20)",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.execute(text(f"ALTER TABLE skills ADD COLUMN {name} {definition}"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
