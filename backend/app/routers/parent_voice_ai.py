import os
from uuid import UUID

from typing import Literal, cast

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.models import ParentCallEvent, RiskSnapshot, Student
from app.db.session import get_db
from app.realtime.hub import hub
from app.schemas import ParentCallOut, TriggerCallBody
from app.services.risk_engine import compute_student_risk
from app.services.tts_demo import run_tts_sync

router = APIRouter()


class FinalizeDemoPayload(BaseModel):
    sentiment_score: float = Field(ge=-1.0, le=1.0)
    transcript_summary: str | None = None


SCRIPTS = {
    "kn": "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಮಗುವಿನ ವಿದ್ಯಾರ್ಥಿ ಹಾಜರಾತಿ ಕುರಿತು ಶಾಲೆಯಿಂದ ಮಾಹಿತಿ: ಇಂದು ದಿನವೇ ದಯವಿಟ್ಟು ಶಾಲೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    "hi": "नमस्ते, यह आपके बच्चे की उपस्थिति के लिए स्कूल का संदेश है। कृपया आज ही संपर्क करें।",
    "en": "Hello, this is your child's school regarding attendance. Please reach us today before noon.",
}


@router.post("/trigger-call", response_model=ParentCallOut)
async def trigger_call(body: TriggerCallBody, db: Session = Depends(get_db)) -> ParentCallEvent:
    student = db.get(Student, body.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    call_status = "queued"

    # ── Real Twilio call when a custom phone number is provided ──────────────
    if body.custom_phone_number:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        from_number = os.getenv("TWILIO_FROM_NUMBER", "")

        if not (account_sid and auth_token and from_number):
            raise HTTPException(
                status_code=500,
                detail="Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your .env file.",
            )

        script_text = SCRIPTS.get(body.language, SCRIPTS["en"])

        # Build TwiML – Twilio will read this text aloud over the phone call.
        twiml = f"<Response><Say language=\"{_twilio_lang(body.language)}\">{script_text}</Say></Response>"

        try:
            from twilio.rest import Client  # imported lazily so demo still works without the package

            client = Client(account_sid, auth_token)
            tw_call = client.calls.create(
                to=body.custom_phone_number,
                from_=from_number,
                twiml=twiml,
            )
            call_status = tw_call.status  # e.g. "queued", "initiated"
        except Exception as exc:
            call_status = "failed"
            # Store the event with failed status so the UI can surface the error
            event = ParentCallEvent(
                student_id=body.student_id,
                language=body.language,
                call_status=call_status,
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            raise HTTPException(status_code=502, detail=f"Twilio error: {exc}") from exc
    # ─────────────────────────────────────────────────────────────────────────

    event = ParentCallEvent(
        student_id=body.student_id,
        language=body.language,
        call_status=call_status,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    await hub.broadcast_json(
        {
            "type": "parent_call_queued",
            "call_id": str(event.id),
            "student_id": str(body.student_id),
            "language": body.language,
        }
    )
    return event


def _twilio_lang(lang: str) -> str:
    """Map our language codes to BCP-47 tags accepted by Twilio <Say>."""
    return {"kn": "en-IN", "hi": "hi-IN", "en": "en-IN"}.get(lang, "en-IN")


@router.post("/finalize-demo/{call_id}", response_model=ParentCallOut)
async def finalize_demo(
    call_id: UUID,
    body: FinalizeDemoPayload,
    db: Session = Depends(get_db),
) -> ParentCallEvent:
    event = db.get(ParentCallEvent, call_id)
    if not event:
        raise HTTPException(status_code=404, detail="Call not found")
    event.call_status = "completed"
    event.sentiment_score = body.sentiment_score
    event.transcript_summary = body.transcript_summary or "Demo transcript stored for sentiment training."
    db.add(event)
    db.flush()
    student = db.get(Student, event.student_id)
    if student:
        score, band, factors, mode = compute_student_risk(db, student)
        db.add(
            RiskSnapshot(
                student_id=student.id,
                score=score,
                band=band,
                factors=factors,
                risk_engine=mode,
            )
        )
    db.commit()
    db.refresh(event)
    await hub.broadcast_json(
        {
            "type": "parent_call_completed",
            "call_id": str(event.id),
            "sentiment": body.sentiment_score,
        }
    )
    return event


@router.get("/tts-sample")
def tts_sample(lang: str = Query("kn", pattern="^(kn|hi|en)$")) -> Response:
    text = SCRIPTS.get(lang, SCRIPTS["en"])
    audio, mime = run_tts_sync(text, cast(Literal["kn", "hi", "en"], lang))
    return Response(content=audio, media_type=mime)
