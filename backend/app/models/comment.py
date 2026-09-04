from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class TenderComment(Base):
    __tablename__ = "tender_comments"

    id = Column(String(50), primary_key=True, index=True)
    tender_id = Column(String(50), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=True, index=True)
    channel_id = Column(String(50), nullable=True, default="general-ops", index=True)
    author_name = Column(String(100), nullable=False)
    author_role = Column(String(50), nullable=False, default="TENDER_ANALYST")
    author_avatar = Column(String(10), nullable=False, default="TM")
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tender = relationship("Tender", back_populates="comments")
