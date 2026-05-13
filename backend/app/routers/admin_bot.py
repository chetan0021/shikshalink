from __future__ import annotations

import os
import tempfile
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import AdminBotTask, School
from app.db.session import get_db
from app.realtime.hub import hub
from app.schemas import AdminBotTaskCreate, AdminBotTaskOut, VoicePipelineOut
from app.services.form_extract import extract_form_payload
from app.services.pdf_export import build_admin_form_pdf
from app.services.transcription import transcribe_audio_file

router = APIRouter()


@router.get("/pending-tasks", response_model=list[AdminBotTaskOut])
def pending_tasks(db: Session = Depends(get_db)) -> list[AdminBotTask]:
    rows = db.scalars(
        select(AdminBotTask)
        .where(AdminBotTask.status.in_(("pending", "in_review")))
        .order_by(AdminBotTask.created_at.desc())
        .limit(100)
    ).all()
    return list(rows)


@router.post("/tasks", response_model=AdminBotTaskOut)
def create_task(body: AdminBotTaskCreate, db: Session = Depends(get_db)) -> AdminBotTask:
    school_id = None
    if body.school_udise:
        school = db.scalars(select(School).where(School.udise_code == body.school_udise)).first()
        if not school:
            raise HTTPException(status_code=404, detail="School UDISE not found")
        school_id = school.id
    task = AdminBotTask(school_id=school_id, title=body.title, status="pending")
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.post("/voice-pipeline", response_model=VoicePipelineOut)
async def voice_pipeline(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    language: str | None = Form(None),
    title: str = Form("Teacher voice note intake"),
    school_udise: str | None = Form(None),
) -> VoicePipelineOut:
    suffix = Path(file.filename or "note.webm").suffix or ".webm"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        content = await file.read()
        tmp.write(content)
        tmp.flush()
        transcript, backend = transcribe_audio_file(Path(tmp.name), language=language)

        form_payload = extract_form_payload(transcript)
        validation_errors = list(form_payload.get("validation_errors") or [])

        school_id = None
        if school_udise:
            sch = db.scalars(select(School).where(School.udise_code == school_udise)).first()
            if sch:
                school_id = sch.id

        status = "pending" if validation_errors else "in_review"
        task = AdminBotTask(
            school_id=school_id,
            title=title,
            status=status,
            form_payload={
                **form_payload,
                "transcript": transcript,
                "transcription_backend": backend,
            },
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        await hub.broadcast_json(
            {
                "type": "admin_voice",
                "task_id": str(task.id),
                "status": task.status,
                "validation_errors": validation_errors,
            }
        )

        return VoicePipelineOut(
            task_id=task.id,
            transcript=transcript,
            transcription_backend=backend,
            form_payload=form_payload,
            validation_errors=validation_errors,
            task_status=task.status,
        )
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


@router.get("/tasks/{task_id}/pdf")
def download_task_pdf(task_id: UUID, db: Session = Depends(get_db)) -> Response:
    task = db.get(AdminBotTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    payload = dict(task.form_payload or {})
    pdf_bytes = build_admin_form_pdf(task.title, payload)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="shiksha-admin-{task_id}.pdf"'
        },
    )
