from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def JsonColumn():
    return JSON().with_variant(JSONB(), "postgresql")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class School(Base):
    __tablename__ = "schools"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    udise_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    district: Mapped[str] = mapped_column(String(256), nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    enrollment_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    teacher_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    grant_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    infra_status: Mapped[str | None] = mapped_column(Text, nullable=True)

    students: Mapped[list[Student]] = relationship(back_populates="school")
    admin_tasks: Mapped[list[AdminBotTask]] = relationship(back_populates="school")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    grade: Mapped[int] = mapped_column(Integer, nullable=False)
    parent_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    school: Mapped[School] = relationship(back_populates="students")
    attendance_events: Mapped[list[AttendanceEvent]] = relationship(back_populates="student")
    parent_calls: Mapped[list[ParentCallEvent]] = relationship(back_populates="student")
    risk_snapshots: Mapped[list[RiskSnapshot]] = relationship(back_populates="student")


class AttendanceEvent(Base):
    __tablename__ = "attendance_events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    event_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)

    student: Mapped[Student] = relationship(back_populates="attendance_events")


class AdminBotTask(Base):
    __tablename__ = "admin_bot_tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("schools.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="pending")
    form_payload: Mapped[dict[str, Any] | None] = mapped_column(JsonColumn(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    school: Mapped[School | None] = relationship(back_populates="admin_tasks")


class ParentCallEvent(Base):
    __tablename__ = "parent_call_events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    language: Mapped[str] = mapped_column(String(16), nullable=False)
    call_status: Mapped[str] = mapped_column(String(64), nullable=False, default="queued")
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    transcript_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    student: Mapped[Student] = relationship(back_populates="parent_calls")


class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)
    band: Mapped[str] = mapped_column(String(16), nullable=False)
    factors: Mapped[list[Any]] = mapped_column(JsonColumn(), nullable=False)
    risk_engine: Mapped[str | None] = mapped_column(String(32), nullable=True)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    student: Mapped[Student] = relationship(back_populates="risk_snapshots")


class CareerOpportunity(Base):
    __tablename__ = "career_opportunities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    region_hint: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    min_grade: Mapped[int] = mapped_column(Integer, nullable=False, default=6)
    max_grade: Mapped[int] = mapped_column(Integer, nullable=False, default=8)


class BeoTask(Base):
    __tablename__ = "beo_tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    assigned_role: Mapped[str] = mapped_column(String(64), nullable=False)
    assignee_name: Mapped[str] = mapped_column(String(256), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="open")
    escalated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class UdiseImportBatch(Base):
    __tablename__ = "udise_import_batches"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    rows_imported: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class StateMetric(Base):
    __tablename__ = "state_metrics"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    state_code: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    state_name: Mapped[str] = mapped_column(String(128), nullable=False)
    metric_key: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class VendorBudgetLine(Base):
    __tablename__ = "vendor_budget_lines"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True
    )
    fiscal_year: Mapped[str] = mapped_column(String(16), nullable=False)
    vendor_name: Mapped[str] = mapped_column(String(256), nullable=False)
    allocated_inr: Mapped[float] = mapped_column(Float, nullable=False)
    utilized_inr: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
