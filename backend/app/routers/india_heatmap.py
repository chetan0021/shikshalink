import os

import httpx
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import StateMetric
from app.db.session import get_db
from app.schemas import StateMetricOut

router = APIRouter()

DEFAULT_GEOJSON = (
    "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson"
)


@router.get("/metrics", response_model=list[StateMetricOut])
def metrics(
    db: Session = Depends(get_db),
    metric_key: str | None = Query(
        None,
        description="dropout_risk | attendance | budget_utilization | parent_engagement",
    ),
) -> list[StateMetric]:
    stmt = select(StateMetric).order_by(StateMetric.state_name.asc())
    if metric_key:
        stmt = stmt.where(StateMetric.metric_key == metric_key)
    stmt = stmt.limit(500)
    return list(db.scalars(stmt).all())


@router.get("/geojson")
async def india_geojson_proxy() -> JSONResponse:
    url = os.getenv("INDIA_STATES_GEOJSON_URL", DEFAULT_GEOJSON)
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return JSONResponse(content=response.json())
    except Exception:
        return JSONResponse(
            content={"type": "FeatureCollection", "features": [], "name": "fallback-empty"}
        )
