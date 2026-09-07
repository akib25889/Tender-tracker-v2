from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TenderFinancialRule(Base):
    __tablename__ = "tender_financial_rules"

    id = Column(String(50), primary_key=True, index=True)
    tender_id = Column(
        String(50),
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # 10 Core Financial Rule Categories (Section 6.2)
    rule_category = Column(String(100), nullable=False, index=True)
    rule_type = Column(String(100), nullable=True)
    financial_value = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True, default="BDT")
    percentage = Column(Float, nullable=True)
    frequency = Column(String(50), nullable=True)
    payment_trigger = Column(String(255), nullable=True)
    payment_due_days = Column(Integer, nullable=True)
    penalty_rate = Column(Float, nullable=True)
    penalty_frequency = Column(String(50), nullable=True)
    maximum_penalty = Column(Float, nullable=True)
    penalty_basis = Column(String(100), nullable=True)
    retention_percentage = Column(Float, nullable=True)
    advance_percentage = Column(Float, nullable=True)
    advance_recovery_method = Column(String(255), nullable=True)
    subscription_type = Column(String(50), nullable=True)
    subscription_frequency = Column(String(50), nullable=True)
    contract_duration = Column(String(100), nullable=True)
    price_escalation = Column(String(255), nullable=True)
    tax_rate = Column(Float, nullable=True)
    vat_rate = Column(Float, nullable=True)
    payment_currency = Column(String(10), nullable=True)
    liability_limit = Column(String(100), nullable=True)
    risk_level = Column(String(20), nullable=True, default="LOW")
    original_clause = Column(Text, nullable=True)
    source_document = Column(String(255), nullable=True)
    page_number = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    tender = relationship("Tender", back_populates="financial_rules")
