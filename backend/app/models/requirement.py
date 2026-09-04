from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TenderRequirement(Base):
    __tablename__ = "tender_requirements"

    id = Column(String(50), primary_key=True, index=True)
    tender_id = Column(String(50), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Statutory")
    status = Column(String(50), nullable=False, default="PENDING")
    owner = Column(String(100), nullable=False, default="Tariq Al-Mansoor")

    tender = relationship("Tender", back_populates="requirements")
