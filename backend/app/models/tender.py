from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tender(Base):
    __tablename__ = "tenders"

    id = Column(String(50), primary_key=True, index=True)
    reference_no = Column(String(100), nullable=True, default="")
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    estimated_value = Column(Float, nullable=True)
    stage = Column(String(50), nullable=False, default="DISCOVERED", index=True)
    decision = Column(String(50), nullable=False, default="PENDING", index=True)
    priority = Column(String(20), nullable=False, default="MEDIUM")
    submission_deadline = Column(String(100), nullable=True)
    days_remaining = Column(Integer, nullable=False, default=0)
    hours_remaining = Column(Integer, nullable=False, default=0)
    readiness_score = Column(Integer, nullable=False, default=0)
    lead_owner_name = Column(String(100), nullable=True, default="Sarah Jenkins")
    lead_owner_role = Column(String(100), nullable=True, default="Business Head")
    summary_json = Column(Text, nullable=True)
    archived_from_stage = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    tasks = relationship("TenderTask", back_populates="tender", cascade="all, delete-orphan")
    documents = relationship("TenderDocument", back_populates="tender", cascade="all, delete-orphan")
    folders = relationship("TenderFolder", back_populates="tender", cascade="all, delete-orphan")
    requirements = relationship("TenderRequirement", back_populates="tender", cascade="all, delete-orphan")
    reviews = relationship("TenderReviewTier", back_populates="tender", cascade="all, delete-orphan")
    comments = relationship("TenderComment", back_populates="tender", cascade="all, delete-orphan")
    decision_matrix = relationship("TenderDecisionMatrix", back_populates="tender", uselist=False, cascade="all, delete-orphan")

class TenderDecisionMatrix(Base):
    __tablename__ = "tender_decision_matrices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(String(50), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, unique=True)
    technical_score = Column(Float, default=0.0)
    financial_score = Column(Float, default=0.0)
    team_score = Column(Float, default=0.0)
    sla_score = Column(Float, default=0.0)
    composite_score = Column(Float, default=0.0)
    threshold = Column(Float, default=70.0)
    status = Column(String(20), default="PENDING")
    rationale = Column(Text, nullable=True)

    tender = relationship("Tender", back_populates="decision_matrix")
