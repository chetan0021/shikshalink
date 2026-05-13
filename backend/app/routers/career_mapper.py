from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import CareerOpportunity
from app.db.session import get_db
from app.schemas import CareerMatchOut, CareerOpportunityOut
from app.services.career_semantic import semantic_rank_opportunities

router = APIRouter()


@router.get("/suggestions", response_model=list[CareerOpportunityOut])
def suggestions(
    db: Session = Depends(get_db),
    interest: str | None = Query(None, description="Keyword such as solar, ITI, lab"),
    region: str | None = Query(None, description="State or region hint"),
    grade: int | None = Query(None, ge=1, le=12),
) -> list[CareerOpportunity]:
    stmt = select(CareerOpportunity)
    if grade is not None:
        stmt = stmt.where(
            CareerOpportunity.min_grade <= grade,
            CareerOpportunity.max_grade >= grade,
        )
    rows = db.scalars(stmt).all()
    filtered: list[CareerOpportunity] = list(rows)
    if interest:
        key = interest.lower()
        filtered = [
            r
            for r in filtered
            if key in r.title.lower() or key in r.description.lower() or key in r.category.lower()
        ]
    if region:
        reg = region.lower()
        filtered = [r for r in filtered if reg in r.region_hint.lower()]
    return filtered[:25]


@router.get("/semantic", response_model=list[CareerMatchOut])
def semantic_matches(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=2, description="Natural language interests / goals"),
    region: str | None = Query(None),
    grade: int | None = Query(None, ge=6, le=8),
    limit: int = Query(12, ge=1, le=25),
) -> list[CareerMatchOut]:
    ranked = semantic_rank_opportunities(db, q, grade=grade, region=region, limit=limit)
    out: list[CareerMatchOut] = []
    for opp, sim in ranked:
        out.append(
            CareerMatchOut(
                id=opp.id,
                title=opp.title,
                category=opp.category,
                region_hint=opp.region_hint,
                description=opp.description,
                min_grade=opp.min_grade,
                max_grade=opp.max_grade,
                similarity=round(sim, 4),
            )
        )
    return out
