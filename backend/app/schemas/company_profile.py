from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class CustomCompanyFieldSchema(BaseModel):
    id: str
    name: str
    value: str

    model_config = ConfigDict(from_attributes=True)


class CompanyProfileBase(BaseModel):
    legal_name: str
    trade_name: str
    company_role: str = "LEAD_BIDDER"  # LEAD_BIDDER, JV_PARTNER, SUBCONTRACTOR
    entity_type: str = "Private Limited Company"
    registration_no: Optional[str] = None
    incorporation_date: Optional[str] = None
    country: str = "Bangladesh"
    status: str = "ACTIVE"
    business_nature: Optional[str] = None
    logo_url: Optional[str] = None

    # Statutory & Tax
    tin_number: Optional[str] = None
    bin_vat_number: Optional[str] = None
    trade_license_no: Optional[str] = None
    trade_license_expiry: Optional[str] = None
    trade_license_issuer: Optional[str] = None
    tax_circle_zone: Optional[str] = None
    rjsc_return_year: Optional[str] = None
    irc_erc_no: Optional[str] = None

    # Registered Office & Communication
    registered_address: Optional[str] = None
    operational_address: Optional[str] = None
    official_email: Optional[str] = None
    billing_email: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    website: Optional[str] = None

    # Focal Person & Authorized Signatory
    contact_person_name: Optional[str] = None
    contact_person_title: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None
    signatory_name: Optional[str] = None
    signatory_title: Optional[str] = None
    signatory_nid: Optional[str] = None
    power_of_attorney_ref: Optional[str] = None

    # Banking & Financials
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    routing_no: Optional[str] = None
    swift_code: Optional[str] = None
    audited_turnover_bdt: float = 0.0
    audited_turnover_usd: float = 0.0
    bank_solvency_limit_bdt: float = 0.0
    paid_up_capital_bdt: float = 0.0
    authorized_capital_bdt: float = 0.0
    credit_rating: Optional[str] = None
    credit_rating_validity: Optional[str] = None

    # Certifications & Workforce
    certifications: Optional[List[str]] = []
    core_competencies: Optional[List[str]] = []
    total_employees: int = 0
    certified_engineers: int = 0

    # Dynamic Custom Fields
    custom_fields: Optional[List[CustomCompanyFieldSchema]] = []


class CompanyProfileCreate(CompanyProfileBase):
    id: Optional[str] = None


class CompanyProfileUpdate(BaseModel):
    legal_name: Optional[str] = None
    trade_name: Optional[str] = None
    company_role: Optional[str] = None
    entity_type: Optional[str] = None
    registration_no: Optional[str] = None
    incorporation_date: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None
    business_nature: Optional[str] = None
    logo_url: Optional[str] = None

    tin_number: Optional[str] = None
    bin_vat_number: Optional[str] = None
    trade_license_no: Optional[str] = None
    trade_license_expiry: Optional[str] = None
    trade_license_issuer: Optional[str] = None
    tax_circle_zone: Optional[str] = None
    rjsc_return_year: Optional[str] = None
    irc_erc_no: Optional[str] = None

    registered_address: Optional[str] = None
    operational_address: Optional[str] = None
    official_email: Optional[str] = None
    billing_email: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    website: Optional[str] = None

    contact_person_name: Optional[str] = None
    contact_person_title: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None
    signatory_name: Optional[str] = None
    signatory_title: Optional[str] = None
    signatory_nid: Optional[str] = None
    power_of_attorney_ref: Optional[str] = None

    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    routing_no: Optional[str] = None
    swift_code: Optional[str] = None
    audited_turnover_bdt: Optional[float] = None
    audited_turnover_usd: Optional[float] = None
    bank_solvency_limit_bdt: Optional[float] = None
    paid_up_capital_bdt: Optional[float] = None
    authorized_capital_bdt: Optional[float] = None
    credit_rating: Optional[str] = None
    credit_rating_validity: Optional[str] = None

    certifications: Optional[List[str]] = None
    core_competencies: Optional[List[str]] = None
    total_employees: Optional[int] = None
    certified_engineers: Optional[int] = None

    custom_fields: Optional[List[CustomCompanyFieldSchema]] = None


class CompanyProfileOut(CompanyProfileBase):
    id: str
    custom_fields: Optional[List[Dict[str, Any]]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
