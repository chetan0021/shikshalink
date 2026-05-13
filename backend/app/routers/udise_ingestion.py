import csv
import io
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import School, UdiseImportBatch
from app.db.session import get_db
from app.schemas import UdiseImportResult

router = APIRouter()


def _norm_key(k: str) -> str:
    return k.strip().lower().replace(" ", "_")


def _row_dict(row: dict[str, Any]) -> dict[str, Any]:
    return {_norm_key(k): (v.strip() if isinstance(v, str) else v) for k, v in row.items() if k}


@router.post("/upload-csv", response_model=UdiseImportResult)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> UdiseImportResult:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV has no header row")

    count = 0
    for raw_row in reader:
        data = _row_dict(raw_row)
        code = data.get("udise_code") or data.get("udise") or data.get("school_id")
        if not code:
            continue
        name = data.get("school_name") or data.get("name") or "Imported school"
        district = data.get("district") or "Unknown district"
        state = data.get("state") or "Unknown state"
        enrollment = data.get("enrollment_total") or data.get("enrollment") or data.get("students")
        teachers = data.get("teacher_count") or data.get("teachers") or data.get("tot_teacher")
        grant = data.get("grant_inr") or data.get("grant") or data.get("grants")

        def _int(val: Any) -> int | None:
            if val in (None, ""):
                return None
            try:
                return int(float(str(val).replace(",", "")))
            except ValueError:
                return None

        def _float(val: Any) -> float | None:
            if val in (None, ""):
                return None
            try:
                return float(str(val).replace(",", ""))
            except ValueError:
                return None

        existing = db.scalars(select(School).where(School.udise_code == str(code))).first()
        if existing:
            existing.name = str(name)[:512]
            existing.district = str(district)[:256]
            existing.state = str(state)[:128]
            existing.enrollment_total = _int(enrollment) or existing.enrollment_total
            existing.teacher_count = _int(teachers) or existing.teacher_count
            g = _float(grant)
            if g is not None:
                existing.grant_inr = g
        else:
            db.add(
                School(
                    udise_code=str(code)[:32],
                    name=str(name)[:512],
                    district=str(district)[:256],
                    state=str(state)[:128],
                    enrollment_total=_int(enrollment),
                    teacher_count=_int(teachers),
                    grant_inr=_float(grant),
                )
            )
        count += 1

    batch = UdiseImportBatch(filename=file.filename, rows_imported=count, status="completed")
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return UdiseImportResult(
        batch_id=batch.id,
        rows_imported=count,
        message=f"Ingested {count} UDISE rows into schools registry",
    )


@router.get("/adapter-status")
def adapter_status() -> dict[str, str]:
    return {
        "csv": "active",
        "api": "ready",
        "scraper": "placeholder",
    }


@router.post("/adapter/api-sync")
def api_sync_stub(db: Session = Depends(get_db)) -> dict[str, Any]:
    _ = db
    return {"status": "noop", "detail": "Register official API keys; adapter returns structured payloads here."}


@router.post("/adapter/scraper-dry-run")
def scraper_dry_run() -> dict[str, str]:
    return {"status": "dry_run", "detail": "Playwright or Selenium job would run with vault-stored credentials."}
