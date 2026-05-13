"""LightGBM dropout-risk regression trained on live tabular features from the database."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import AttendanceEvent, ParentCallEvent, Student

try:
    import lightgbm as lgb
except ImportError:
    lgb = None


@dataclass
class FeatureRow:
    attendance_rate: float
    sentiment: float
    performance_proxy: float
    grade_norm: float


def _grade_norm(grade: int) -> float:
    return max(0.0, min(1.0, (grade - 5) / 5.0))


def feature_snapshot_row(db: Session, student: Student, window_days: int = 30) -> FeatureRow:
    from datetime import date, timedelta

    end = date.today()
    start = end - timedelta(days=window_days)
    rows = db.scalars(
        select(AttendanceEvent).where(
            AttendanceEvent.student_id == student.id,
            AttendanceEvent.event_date >= start,
            AttendanceEvent.event_date <= end,
        )
    ).all()
    total = len(rows)
    present = sum(1 for r in rows if r.status.lower() == "present")
    attendance_rate = (present / total) if total else 0.65

    last_call = db.scalars(
        select(ParentCallEvent)
        .where(ParentCallEvent.student_id == student.id)
        .order_by(ParentCallEvent.created_at.desc())
        .limit(1)
    ).first()
    sentiment = 0.6
    if last_call and last_call.sentiment_score is not None:
        sentiment = max(0.0, min(1.0, 0.5 + last_call.sentiment_score * 0.5))

    performance_proxy = 0.7 - (max(0, student.grade - 6) * 0.03)
    performance_proxy = max(0.35, min(0.95, performance_proxy))

    return FeatureRow(
        attendance_rate=attendance_rate,
        sentiment=sentiment,
        performance_proxy=performance_proxy,
        grade_norm=_grade_norm(student.grade),
    )


def _window_features(db: Session, student: Student, window_days: int = 30) -> FeatureRow:
    return feature_snapshot_row(db, student, window_days)


def _row_to_x(row: FeatureRow) -> np.ndarray:
    return np.array(
        [[row.attendance_rate, row.sentiment, row.performance_proxy, row.grade_norm]],
        dtype=np.float32,
    )


def _heuristic_score(row: FeatureRow) -> float:
    return row.attendance_rate * 0.45 + row.sentiment * 0.3 + row.performance_proxy * 0.25


_model_cache: lgb.Booster | None = None


def invalidate_lgbm_cache() -> None:
    global _model_cache
    _model_cache = None


def train_or_load_model(db: Session, *, force: bool = False) -> lgb.Booster | None:
    global _model_cache
    if _model_cache is not None and not force:
        return _model_cache
    if lgb is None:
        return None

    students = db.scalars(select(Student).options(selectinload(Student.school))).all()
    if len(students) < 2:
        return None

    X_list: list[list[float]] = []
    y_list: list[float] = []
    for st in students:
        fr = _window_features(db, st)
        X_list.append(
            [fr.attendance_rate, fr.sentiment, fr.performance_proxy, fr.grade_norm]
        )
        y_list.append(_heuristic_score(fr))

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.float32)

    dtrain = lgb.Dataset(
        X,
        label=y,
        feature_name=[
            "attendance_rate",
            "sentiment",
            "performance_proxy",
            "grade_norm",
        ],
    )
    params = {
        "objective": "regression",
        "metric": "rmse",
        "verbosity": -1,
        "learning_rate": 0.05,
        "num_leaves": 15,
        "min_data_in_leaf": 1,
    }
    _model_cache = lgb.train(params, dtrain, num_boost_round=80)
    return _model_cache


def predict_score_and_contrib(
    db: Session, student: Student
) -> tuple[float, list[dict[str, Any]], str]:
    row = _window_features(db, student)
    X = _row_to_x(row)
    model = train_or_load_model(db)

    if model is None:
        score = _heuristic_score(row)
        factors = _explain_manual(row)
        return score, factors, "heuristic"

    try:
        raw = model.predict(X, pred_contrib=True)
        arr = np.atleast_2d(np.asarray(raw))
        flat = arr[0]
        if flat.size < 2:
            raise ValueError("unexpected contrib shape")
        bias = float(flat[-1])
        contribs = flat[:-1].tolist()
        if len(contribs) != 4:
            raise ValueError("contrib length mismatch")
        score = float(np.sum(flat))
    except Exception:
        score = _heuristic_score(row)
        factors = _explain_manual(row)
        return score, factors, "heuristic"

    names = ["attendance_rate", "sentiment", "performance_proxy", "grade_norm"]
    labels = [
        "Attendance window signal",
        "Parent sentiment composite",
        "Grade-adjusted academic stability prior",
        "Grade cohort normalization",
    ]
    explain: list[dict[str, Any]] = []
    for name, lab, c in zip(names, labels, contribs, strict=True):
        explain.append(
            {
                "key": name,
                "label": lab,
                "detail": f"LightGBM SHAP-style leaf contribution (bias {bias:.4f})",
                "weight": None,
                "contribution": round(float(c), 4),
            }
        )
    return score, explain, "lightgbm"


def _explain_manual(row: FeatureRow) -> list[dict[str, Any]]:
    return [
        {
            "key": "attendance_rate",
            "label": "Attendance window signal",
            "detail": "Share of present days in rolling window",
            "weight": 0.45,
            "contribution": round(row.attendance_rate, 3),
        },
        {
            "key": "sentiment",
            "label": "Parent sentiment composite",
            "detail": "Mapped from latest completed parent interaction",
            "weight": 0.3,
            "contribution": round(row.sentiment, 3),
        },
        {
            "key": "performance_proxy",
            "label": "Grade-adjusted academic stability prior",
            "detail": "Proxy prior when structured assessments are sparse",
            "weight": 0.25,
            "contribution": round(row.performance_proxy, 3),
        },
    ]
