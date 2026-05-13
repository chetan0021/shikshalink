from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class AdminBotTaskOut(BaseModel):
    id: UUID
    title: str
    status: str
    school_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminBotTaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=512)
    school_udise: str | None = None


class TriggerCallBody(BaseModel):
    student_id: UUID
    language: Literal["kn", "hi", "en"]
    custom_phone_number: str | None = None


class ParentCallOut(BaseModel):
    id: UUID
    student_id: UUID
    language: str
    call_status: str
    sentiment_score: float | None
    created_at: datetime

    class Config:
        from_attributes = True


class RiskCardOut(BaseModel):
    student_id: UUID
    student_name: str
    school_name: str
    district: str
    state: str
    band: str
    score: float
    factors: list[dict[str, Any]]
    risk_engine: str | None = None


class CareerOpportunityOut(BaseModel):
    id: UUID
    title: str
    category: str
    region_hint: str
    description: str
    min_grade: int
    max_grade: int

    class Config:
        from_attributes = True


class CareerMatchOut(CareerOpportunityOut):
    similarity: float


class VoicePipelineOut(BaseModel):
    task_id: UUID
    transcript: str
    transcription_backend: str
    form_payload: dict[str, Any]
    validation_errors: list[str]
    task_status: str


class BeoTaskCreate(BaseModel):
    title: str
    description: str
    assigned_role: str
    assignee_name: str
    due_date: date


class BeoTaskOut(BaseModel):
    id: UUID
    title: str
    description: str
    assigned_role: str
    assignee_name: str
    due_date: date
    status: str
    escalated: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StateMetricOut(BaseModel):
    state_code: str
    state_name: str
    metric_key: str
    value: float
    updated_at: datetime

    class Config:
        from_attributes = True


class UdiseImportResult(BaseModel):
    batch_id: UUID
    rows_imported: int
    message: str
