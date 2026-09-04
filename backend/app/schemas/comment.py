from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CommentCreate(BaseModel):
    tender_id: Optional[str] = None
    channel_id: Optional[str] = "general-ops"
    content: str
    author_name: str
    author_role: str = "TENDER_ANALYST"
    author_avatar: str = "TM"

class CommentOut(BaseModel):
    id: str
    tender_id: Optional[str] = None
    channel_id: Optional[str] = "general-ops"
    author_name: str
    author_role: str
    author_avatar: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
