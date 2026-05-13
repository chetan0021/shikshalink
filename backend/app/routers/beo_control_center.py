from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import BeoTask
from app.db.session import get_db
from app.schemas import BeoTaskCreate, BeoTaskOut

router = APIRouter()


@router.get("/tasks", response_model=list[BeoTaskOut])
def list_tasks(db: Session = Depends(get_db)) -> list[BeoTask]:
    return list(db.scalars(select(BeoTask).order_by(BeoTask.due_date.asc()).limit(200)).all())


@router.post("/tasks", response_model=BeoTaskOut)
def create_task(body: BeoTaskCreate, db: Session = Depends(get_db)) -> BeoTask:
    task = BeoTask(
        title=body.title,
        description=body.description,
        assigned_role=body.assigned_role,
        assignee_name=body.assignee_name,
        due_date=body.due_date,
        status="open",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.post("/tasks/{task_id}/escalate", response_model=BeoTaskOut)
def escalate(task_id: UUID, db: Session = Depends(get_db)) -> BeoTask:
    task = db.get(BeoTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.escalated = True
    task.status = "escalated"
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
