from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TenderTask(Base):
    __tablename__ = "tender_tasks"

    id = Column(String(50), primary_key=True, index=True)
    tender_id = Column(String(50), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    assignee = Column(String(100), nullable=False)
    due_date = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False, default="TODO", index=True)
    priority = Column(String(20), nullable=False, default="MEDIUM")

    tender = relationship("Tender", back_populates="tasks")
