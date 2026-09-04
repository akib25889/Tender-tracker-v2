from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TenderReviewTier(Base):
    __tablename__ = "tender_review_tiers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(String(50), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    tier_number = Column(Integer, nullable=False)
    tier_name = Column(String(100), nullable=False)
    role_required = Column(String(50), nullable=False)
    sign_off_status = Column(String(50), nullable=False, default="PENDING")
    signed_off_by = Column(String(100), nullable=True)
    signed_off_at = Column(String(50), nullable=True)
    comments = Column(String(255), nullable=True)

    tender = relationship("Tender", back_populates="reviews")
