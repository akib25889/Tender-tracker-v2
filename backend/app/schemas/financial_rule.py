from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TenderFinancialRuleBase(BaseModel):
    tender_id: str
    rule_category: str
    rule_type: Optional[str] = None
    financial_value: Optional[float] = None
    currency: Optional[str] = "BDT"
    percentage: Optional[float] = None
    frequency: Optional[str] = None
    payment_trigger: Optional[str] = None
    payment_due_days: Optional[int] = None
    penalty_rate: Optional[float] = None
    penalty_frequency: Optional[str] = None
    maximum_penalty: Optional[float] = None
    penalty_basis: Optional[str] = None
    retention_percentage: Optional[float] = None
    advance_percentage: Optional[float] = None
    advance_recovery_method: Optional[str] = None
    subscription_type: Optional[str] = None
    subscription_frequency: Optional[str] = None
    contract_duration: Optional[str] = None
    price_escalation: Optional[str] = None
    tax_rate: Optional[float] = None
    vat_rate: Optional[float] = None
    payment_currency: Optional[str] = None
    liability_limit: Optional[str] = None
    risk_level: Optional[str] = "LOW"
    original_clause: Optional[str] = None
    source_document: Optional[str] = None
    page_number: Optional[str] = None


class TenderFinancialRuleCreate(TenderFinancialRuleBase):
    id: Optional[str] = None


class TenderFinancialRuleUpdate(BaseModel):
    rule_category: Optional[str] = None
    rule_type: Optional[str] = None
    financial_value: Optional[float] = None
    currency: Optional[str] = None
    percentage: Optional[float] = None
    frequency: Optional[str] = None
    payment_trigger: Optional[str] = None
    payment_due_days: Optional[int] = None
    penalty_rate: Optional[float] = None
    penalty_frequency: Optional[str] = None
    maximum_penalty: Optional[float] = None
    penalty_basis: Optional[str] = None
    retention_percentage: Optional[float] = None
    advance_percentage: Optional[float] = None
    advance_recovery_method: Optional[str] = None
    subscription_type: Optional[str] = None
    subscription_frequency: Optional[str] = None
    contract_duration: Optional[str] = None
    price_escalation: Optional[str] = None
    tax_rate: Optional[float] = None
    vat_rate: Optional[float] = None
    payment_currency: Optional[str] = None
    liability_limit: Optional[str] = None
    risk_level: Optional[str] = None
    original_clause: Optional[str] = None
    source_document: Optional[str] = None
    page_number: Optional[str] = None


class TenderFinancialRuleOut(TenderFinancialRuleBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
