from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.models import School
from app.db.session import get_db
from app.realtime.hub import hub
from app.schemas import RiskCardOut
from app.services.risk_engine import (
    latest_snapshots_for_school,
    refresh_risk_snapshots_for_school,
)

router = APIRouter()


class RefreshRiskIn(BaseModel):
    school_id: UUID


@router.get("/cards", response_model=list[RiskCardOut])
def risk_cards(
    school_id: UUID | None = Query(
        None,
        description="Student-level risk is returned only when scoped to a single school.",
    ),
    db: Session = Depends(get_db),
) -> list[RiskCardOut]:
    if school_id is None:
        return []
    if db.get(School, school_id) is None:
        raise HTTPException(status_code=404, detail="School not found")
    snaps = latest_snapshots_for_school(db, school_id, limit=50)
    out: list[RiskCardOut] = []
    for s in snaps:
        st = s.student
        sch = st.school
        out.append(
            RiskCardOut(
                student_id=st.id,
                student_name=st.name,
                school_name=sch.name,
                district=sch.district,
                state=sch.state,
                band=s.band,
                score=round(float(s.score), 3),
                factors=list(s.factors or []),
                risk_engine=s.risk_engine,
            )
        )
    return out


@router.post("/refresh")
async def refresh(payload: RefreshRiskIn, db: Session = Depends(get_db)) -> dict[str, int]:
    if db.get(School, payload.school_id) is None:
        raise HTTPException(status_code=404, detail="School not found")
    count = refresh_risk_snapshots_for_school(db, payload.school_id)
    await hub.broadcast_json(
        {
            "type": "risk_refresh",
            "snapshots_created": count,
            "school_id": str(payload.school_id),
        }
    )
    return {"snapshots_created": count}
