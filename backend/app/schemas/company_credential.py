from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class CustomFieldSchema(BaseModel):
    id: str
    name: str
    value: str

    model_config = ConfigDict(from_attributes=True)


class CompanyProjectCreate(BaseModel):
    company_name: str = "PrimeTech Ltd"
    company_role: str = "LEAD_BIDDER"
    project_title: str
    client_name: str
    contract_value: float = 0.0
    currency: str = "BDT"
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    role_in_project: str = "Prime Contractor"
    custom_fields: Optional[List[CustomFieldSchema]] = []


class CompanyProjectUpdate(BaseModel):
    project_title: Optional[str] = None
    client_name: Optional[str] = None
    contract_value: Optional[float] = None
    currency: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    role_in_project: Optional[str] = None
    company_role: Optional[str] = None
    custom_fields: Optional[List[CustomFieldSchema]] = None


class CompanyProjectOut(BaseModel):
    id: str
    company_name: str
    company_role: str
    project_title: str
    client_name: str
    contract_value: float
    currency: str
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    role_in_project: str
    work_order_filename: Optional[str] = None
    work_order_path: Optional[str] = None
    work_order_sha256: Optional[str] = None
    work_order_size: Optional[str] = None
    completion_cert_filename: Optional[str] = None
    completion_cert_path: Optional[str] = None
    completion_cert_sha256: Optional[str] = None
    completion_cert_size: Optional[str] = None
    custom_fields: Optional[List[Dict[str, Any]]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LinkProjectToTenderRequest(BaseModel):
    tender_id: str
    target_folder: str = "02_company_statutory_documents"
