from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base


class ChatChannelMessage(Base):
    __tablename__ = "chat_channel_messages"

    id = Column(String(50), primary_key=True, index=True)
    channel_id = Column(String(50), nullable=False, index=True)
    sender_name = Column(String(100), nullable=False)
    sender_role = Column(String(100), nullable=False)
    sender_avatar = Column(String(10), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
