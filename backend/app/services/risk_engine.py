"""Dropout risk snapshots using LightGBM when available, else transparent heuristic."""

from __future__ import annotations

import uuid
from collections.abc import Sequence
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db.models import RiskSnapshot, Student
from app.services.lgbm_risk import (
    feature_snapshot_row,
    invalidate_lgbm_cache,
    predict_score_and_contrib,
    train_or_load_model,
)


def band_for_score(score: float) -> str:
    if score >= 0.72:
        return "Green"
    if score >= 0.45:
        return "Yellow"
    return "Red"


def compute_student_risk(
    db: Session,
    student: Student,
    window_days: int = 30,
) -> tuple[float, str, list[dict[str, Any]], str]:
    _ = window_days
    score, factors, mode = predict_score_and_contrib(db, student)
    band = band_for_score(score)
    row = feature_snapshot_row(db, student)
    if row.attendance_rate < 0.55:
        factors.append(
            {
                "key": "alert",
                "label": "Attendance drag",
                "detail": "Sustained absence pattern increases dropout probability",
                "weight": 0.0,
                "contribution": 0.0,
            }
        )
    return score, band, factors, mode


def refresh_risk_snapshots_for_school(db: Session, school_id: uuid.UUID) -> int:
    """Recompute risk rows only for students belonging to one school (operational boundary)."""
    invalidate_lgbm_cache()
    train_or_load_model(db, force=True)

    students = db.scalars(
        select(Student)
        .where(Student.school_id == school_id)
        .options(selectinload(Student.school))
    ).all()
    count = 0
    for student in students:
        score, band, factors, mode = compute_student_risk(db, student)
        snap = RiskSnapshot(
            student_id=student.id,
            score=score,
            band=band,
            factors=factors,
            risk_engine=mode,
        )
        db.add(snap)
        count += 1
    db.commit()
    return count


def refresh_all_risk_snapshots(db: Session) -> int:
    invalidate_lgbm_cache()
    train_or_load_model(db, force=True)

    students = db.scalars(select(Student).options(selectinload(Student.school))).all()
    count = 0
    for student in students:
        score, band, factors, mode = compute_student_risk(db, student)
        snap = RiskSnapshot(
            student_id=student.id,
            score=score,
            band=band,
            factors=factors,
            risk_engine=mode,
        )
        db.add(snap)
        count += 1
    db.commit()
    return count


def latest_snapshots_for_school(
    db: Session, school_id: uuid.UUID, limit: int = 50
) -> Sequence[RiskSnapshot]:
    """Latest snapshot per student, only within the given school (privacy / tenancy boundary)."""
    subq = (
        select(
            RiskSnapshot.student_id.label("sid"),
            func.max(RiskSnapshot.computed_at).label("mx"),
        )
        .join(Student, Student.id == RiskSnapshot.student_id)
        .where(Student.school_id == school_id)
        .group_by(RiskSnapshot.student_id)
        .subquery()
    )
    stmt = (
        select(RiskSnapshot)
        .join(subq, RiskSnapshot.student_id == subq.c.sid)
        .where(RiskSnapshot.computed_at == subq.c.mx)
        .options(selectinload(RiskSnapshot.student).selectinload(Student.school))
        .order_by(RiskSnapshot.score.asc())
        .limit(limit)
    )
    return db.scalars(stmt).all()
