from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.task import TenderTask
from app.models.tender import Tender
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["Tasks & Deliverables"])

@router.get("", response_model=List[TaskOut])
def get_tasks(
    tender_id: Optional[str] = None,
    assignee: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TenderTask)
    if tender_id:
        query = query.filter(TenderTask.tender_id == tender_id)
    if assignee and assignee.upper() != "ALL":
        query = query.filter(TenderTask.assignee == assignee)
    if status and status.upper() != "ALL":
        query = query.filter(TenderTask.status == status.upper())
    return query.all()

@router.post("/tender/{tender_id}", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(tender_id: str, task_in: TaskCreate, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    task_id = f"TSK-{db.query(TenderTask).count() + 101}"
    db_task = TenderTask(
        id=task_id,
        tender_id=tender_id,
        title=task_in.title,
        assignee=task_in.assignee,
        due_date=task_in.due_date,
        status=task_in.status,
        priority=task_in.priority,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, updates: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(TenderTask).filter(TenderTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(TenderTask).filter(TenderTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None
