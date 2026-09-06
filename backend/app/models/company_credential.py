import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.core.database import Base


class CompanyProjectCredential(Base):
    __tablename__ = "company_project_credentials"

    id = Column(String(50), primary_key=True, default=lambda: f"PROJ-{uuid.uuid4().hex[:8].upper()}")
    company_name = Column(String(150), nullable=False, index=True, default="PrimeTech Ltd")
    company_role = Column(String(50), nullable=False, default="LEAD_BIDDER")  # LEAD_BIDDER, JV_PARTNER, SUBCONTRACTOR
    project_title = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=False)
    contract_value = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="BDT")
    start_date = Column(String(50), nullable=True)
    completion_date = Column(String(50), nullable=True)
    role_in_project = Column(String(100), nullable=False, default="Prime Contractor")
    
    # Work Order Document Details
    work_order_filename = Column(String(255), nullable=True)
    work_order_path = Column(String(500), nullable=True)
    work_order_sha256 = Column(String(64), nullable=True)
    work_order_size = Column(String(50), nullable=True)

    # Completion Certificate Document Details
    completion_cert_filename = Column(String(255), nullable=True)
    completion_cert_path = Column(String(500), nullable=True)
    completion_cert_sha256 = Column(String(64), nullable=True)
    completion_cert_size = Column(String(50), nullable=True)

    # Dynamic / Custom fields stored as JSON array: [{"id": "...", "name": "...", "value": "..."}]
    custom_fields = Column(JSON, nullable=True, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
