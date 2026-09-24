from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import ensure_schema
from app.routers.api import router


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_schema()
    yield


app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix=settings.API_PREFIX)


@app.get("/health")
def health():
    return {"status": "ok"}
