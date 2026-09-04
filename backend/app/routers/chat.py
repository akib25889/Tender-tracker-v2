import time
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chat import ChatChannelMessage
from app.schemas.chat import ChatMessageCreate, ChatMessageOut

router = APIRouter(prefix="/chat", tags=["Channel Chat Discussions"])


@router.get("/channels/{channel_id}/messages", response_model=List[ChatMessageOut])
def get_channel_messages(channel_id: str, db: Session = Depends(get_db)):
    return (
        db.query(ChatChannelMessage)
        .filter(ChatChannelMessage.channel_id == channel_id)
        .order_by(ChatChannelMessage.created_at.asc())
        .all()
    )


@router.post(
    "/channels/{channel_id}/messages",
    response_model=ChatMessageOut,
    status_code=status.HTTP_201_CREATED,
)
def send_channel_message(
    channel_id: str,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
):
    msg_id = f"MSG-{int(time.time() * 1000)}"
    message = ChatChannelMessage(
        id=msg_id,
        channel_id=channel_id,
        sender_name=payload.sender_name or "Sarah Jenkins",
        sender_role=payload.sender_role or "Business Head",
        sender_avatar=payload.sender_avatar or "SJ",
        content=payload.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
