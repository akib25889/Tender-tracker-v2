from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, JSON
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
    currency = Column(String(10), nullable=False, default="USD")
    exchange_rate_to_bdt = Column(Float, nullable=True, default=122.0)
    exchange_rate_date = Column(String(50), nullable=True)
    estimated_value_bdt = Column(Float, nullable=True)
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
    important_clauses = Column(JSON, nullable=True, default=list)
    procurement_manager_name = Column(String(150), nullable=True)
    procurement_manager_designation = Column(String(150), nullable=True)
    procurement_manager_email = Column(String(150), nullable=True)
    procurement_manager_phone = Column(String(100), nullable=True)
    helpline_phone = Column(String(100), nullable=True)
    helpline_email = Column(String(150), nullable=True)
    helpline_hours = Column(String(150), nullable=True)
    # Procurement Governance & Sourcing Attributes (Req #21)
    tender_type = Column(String(100), nullable=True)
    budget_type = Column(String(100), nullable=True)
    source_of_fund = Column(String(150), nullable=True)
    procurement_method = Column(String(100), nullable=True)
    # 2-Stage Procurement Lineage (EOI -> RFP) & Shortlisting
    parent_eoi_id = Column(String(50), nullable=True, index=True)
    spawned_rfp_id = Column(String(50), nullable=True)
    eoi_shortlist_status = Column(String(50), nullable=True)
    # Milestone Schedule Dates (Req #20)
    opening_date = Column(String(50), nullable=True)
    contract_signing_date = Column(String(50), nullable=True)
    work_start_date = Column(String(50), nullable=True)
    possible_period = Column(String(100), nullable=True)
    product_handover_date = Column(String(50), nullable=True)
    maintenance_period = Column(String(100), nullable=True)
    # Schedule / Form Purchase & Tender Security (EMD)
    schedule_purchase_deadline = Column(String(50), nullable=True)
    schedule_purchase_method = Column(String(50), nullable=True)
    tender_security_amount = Column(Float, nullable=True)
    tender_security_method = Column(String(50), nullable=True)
    # Post-Award Execution & Contract Delivery Data (Req #17)
    post_award_data = Column(JSON, nullable=True, default=dict)
    # Financial Scenarios & Cash Flow Rules Model (Unified JSON)
    financial_model = Column(JSON, nullable=True, default=dict)
    # External AI Context & Chat Session Link
    ai_chat_share_link = Column(Text, nullable=True)
    archived_from_stage = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    financial_rules = relationship(
        "TenderFinancialRule", back_populates="tender", cascade="all, delete-orphan"
    )
    tasks = relationship(
        "TenderTask", back_populates="tender", cascade="all, delete-orphan"
    )
    documents = relationship(
        "TenderDocument", back_populates="tender", cascade="all, delete-orphan"
    )
    folders = relationship(
        "TenderFolder", back_populates="tender", cascade="all, delete-orphan"
    )
    requirements = relationship(
        "TenderRequirement", back_populates="tender", cascade="all, delete-orphan"
    )
    comments = relationship(
        "TenderComment", back_populates="tender", cascade="all, delete-orphan"
    )
    decision_matrix = relationship(
        "TenderDecisionMatrix",
        back_populates="tender",
        uselist=False,
        cascade="all, delete-orphan",
    )
    partner_assignments = relationship(
        "TenderPartnerAssignment", cascade="all, delete-orphan"
    )
    submission = relationship(
        "TenderSubmission",
        back_populates="tender",
        uselist=False,
        cascade="all, delete-orphan",
    )


class TenderDecisionMatrix(Base):
    __tablename__ = "tender_decision_matrices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(
        String(50),
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    technical_score = Column(Float, default=0.0)
    financial_score = Column(Float, default=0.0)
    team_score = Column(Float, default=0.0)
    sla_score = Column(Float, default=0.0)
    composite_score = Column(Float, default=0.0)
    threshold = Column(Float, default=70.0)
    status = Column(String(20), default="PENDING")
    rationale = Column(Text, nullable=True)

    tender = relationship("Tender", back_populates="decision_matrix")


class TenderCategory(Base):
    __tablename__ = "tender_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    color_badge = Column(String(50), nullable=True, default="blue")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class TenderSubmission(Base):
    __tablename__ = "tender_submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(
        String(50),
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    portal_reference = Column(String(100), nullable=False)
    submitted_by = Column(String(100), nullable=False, default="Sarah Jenkins")
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    receipt_sha256 = Column(String(64), nullable=True)
    receipt_path = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="SUBMITTED_LOCKED")

    tender = relationship("Tender", back_populates="submission")
