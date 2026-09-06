import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON
from app.core.database import Base


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(
        String(50),
        primary_key=True,
        default=lambda: f"COMP-{uuid.uuid4().hex[:8].upper()}",
    )

    # 1. Corporate Identity
    legal_name = Column(String(255), nullable=False, index=True)
    trade_name = Column(String(100), nullable=False)
    company_role = Column(
        String(50), nullable=False, default="LEAD_BIDDER"
    )  # LEAD_BIDDER, JV_PARTNER, SUBCONTRACTOR
    entity_type = Column(String(100), nullable=False, default="Private Limited Company")
    registration_no = Column(String(100), nullable=True)
    incorporation_date = Column(String(50), nullable=True)
    country = Column(String(100), nullable=False, default="Bangladesh")
    status = Column(
        String(50), nullable=False, default="ACTIVE"
    )  # ACTIVE, VERIFIED, INACTIVE
    business_nature = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)

    # 2. Statutory & Tax Credentials
    tin_number = Column(String(100), nullable=True)
    bin_vat_number = Column(String(100), nullable=True)
    trade_license_no = Column(String(100), nullable=True)
    trade_license_expiry = Column(String(50), nullable=True)
    trade_license_issuer = Column(String(150), nullable=True)
    tax_circle_zone = Column(String(150), nullable=True)
    rjsc_return_year = Column(String(20), nullable=True)
    irc_erc_no = Column(String(100), nullable=True)

    # 3. Registered Office & Communication Details
    registered_address = Column(Text, nullable=True)
    operational_address = Column(Text, nullable=True)
    official_email = Column(String(150), nullable=True)
    billing_email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    fax = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)

    # Focal & Signatory Details
    contact_person_name = Column(String(100), nullable=True)
    contact_person_title = Column(String(100), nullable=True)
    contact_person_phone = Column(String(50), nullable=True)
    contact_person_email = Column(String(100), nullable=True)
    signatory_name = Column(String(100), nullable=True)
    signatory_title = Column(String(100), nullable=True)
    signatory_nid = Column(String(100), nullable=True)
    power_of_attorney_ref = Column(String(200), nullable=True)

    # 4. Financial Standing & Banking Credentials
    bank_name = Column(String(150), nullable=True)
    bank_branch = Column(String(150), nullable=True)
    bank_account_name = Column(String(200), nullable=True)
    bank_account_no = Column(String(100), nullable=True)
    routing_no = Column(String(50), nullable=True)
    swift_code = Column(String(50), nullable=True)
    audited_turnover_bdt = Column(Float, nullable=False, default=0.0)
    audited_turnover_usd = Column(Float, nullable=False, default=0.0)
    bank_solvency_limit_bdt = Column(Float, nullable=False, default=0.0)
    paid_up_capital_bdt = Column(Float, nullable=False, default=0.0)
    authorized_capital_bdt = Column(Float, nullable=False, default=0.0)
    credit_rating = Column(String(50), nullable=True)
    credit_rating_validity = Column(String(50), nullable=True)

    # 5. Certifications & Workforce
    certifications = Column(
        JSON, nullable=True, default=list
    )  # ["ISO 9001:2015", "BASIS Member G-842"]
    core_competencies = Column(
        JSON, nullable=True, default=list
    )  # ["Cloud Engineering", "SCADA Integration"]
    total_employees = Column(Integer, nullable=False, default=0)
    certified_engineers = Column(Integer, nullable=False, default=0)

    # 6. Dynamic Custom Fields: [{"id": "cf-1", "name": "Custom Name", "value": "Custom Value"}]
    custom_fields = Column(JSON, nullable=True, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
