from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    short_name = Column(String(100), nullable=True)
    type = Column(String(50), nullable=False, default="GOVERNMENT")
    parent_id = Column(String(50), nullable=True, index=True)
    country = Column(String(100), nullable=False, default="Bangladesh")
    website = Column(String(255), nullable=True)
    priority = Column(String(20), nullable=False, default="MEDIUM")
    aliases_json = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
