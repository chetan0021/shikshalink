from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_cors_origins
from app.db.session import init_db
from app.routers import (
    admin_bot,
    beo_control_center,
    career_mapper,
    dropout_risk,
    india_heatmap,
    parent_voice_ai,
    realtime,
    system,
    udise_ingestion,
)
from app.services.seed_demo import seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="SHIKSHA LINK API",
    version="1.0.0",
    description="Connected intelligence backend for Indian public education workflows.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(admin_bot.router, prefix="/api/admin-bot", tags=["admin-bot"])
app.include_router(parent_voice_ai.router, prefix="/api/parent-voice-ai", tags=["parent-voice-ai"])
app.include_router(dropout_risk.router, prefix="/api/dropout-risk", tags=["dropout-risk"])
app.include_router(career_mapper.router, prefix="/api/career-mapper", tags=["career-mapper"])
app.include_router(beo_control_center.router, prefix="/api/beo-control-center", tags=["beo-control-center"])
app.include_router(udise_ingestion.router, prefix="/api/udise-ingestion", tags=["udise-ingestion"])
app.include_router(india_heatmap.router, prefix="/api/india-heatmap", tags=["india-heatmap"])
app.include_router(system.router, prefix="/api/system", tags=["system"])
app.include_router(realtime.router)
