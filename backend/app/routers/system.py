from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import School, Student
from app.db.session import get_db

router = APIRouter()


@router.get("/schools")
def list_schools(db: Session = Depends(get_db), limit: int = 100) -> dict:
    """Public directory of schools for demo login scoping (no student PII)."""
    schools = db.scalars(select(School).order_by(School.state, School.district, School.name).limit(limit)).all()
    return {
        "schools": [
            {
                "id": str(sch.id),
                "udise_code": sch.udise_code,
                "name": sch.name,
                "district": sch.district,
                "state": sch.state,
            }
            for sch in schools
        ]
    }


@router.get("/demo-context")
def demo_context(db: Session = Depends(get_db)) -> dict:
    students = db.scalars(
        select(Student).options(selectinload(Student.school)).order_by(Student.name).limit(20)
    ).all()
    schools = db.scalars(select(School).order_by(School.state, School.district).limit(20)).all()
    return {
        "students": [
            {
                "id": str(s.id),
                "name": s.name,
                "grade": s.grade,
                "parent_phone": s.parent_phone,
                "school_udise": s.school.udise_code if s.school else None,
            }
            for s in students
        ],
        "schools": [
            {
                "id": str(sch.id),
                "udise_code": sch.udise_code,
                "name": sch.name,
                "district": sch.district,
                "state": sch.state,
            }
            for sch in schools
        ],
    }
