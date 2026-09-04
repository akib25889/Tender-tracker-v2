from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ChatMessageCreate(BaseModel):
    content: str
    sender_name: Optional[str] = "Sarah Jenkins"
    sender_role: Optional[str] = "Business Head"
    sender_avatar: Optional[str] = "SJ"


class ChatMessageOut(BaseModel):
    id: str
    channel_id: str
    sender_name: str
    sender_role: str
    sender_avatar: Optional[str] = None
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
