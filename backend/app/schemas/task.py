from typing import Optional
from pydantic import BaseModel

class TaskBase(BaseModel):
    title: str
    assignee: str
    due_date: Optional[str] = None
    status: str = "TODO"
    priority: str = "MEDIUM"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None

class TaskOut(TaskBase):
    id: str
    tender_id: str

    class Config:
        from_attributes = True
