from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class FolderCreate(BaseModel):
    name: str
    label: str


class FolderOut(BaseModel):
    id: int
    tender_id: str
    name: str
    label: str

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: str
    tender_id: str
    name: str
    folder: str
    company_name: Optional[str] = "PrimeTech Ltd"
    company_role: Optional[str] = "LEAD_BIDDER"
    is_jv_partner: bool = False
    size: str
    revision: str
    sha256: str
    uploaded_at: str
    is_reusable_link: bool = False
    reusable_source_id: Optional[str] = None
    access_level: str = "ALL_TEAM"
    status: Optional[str] = "CLEARED"
    action_comment: Optional[str] = None
    requested_by: Optional[str] = None
    action_due_date: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentUpdate(BaseModel):
    folder: Optional[str] = None
    access_level: Optional[str] = None
    company_name: Optional[str] = None
    company_role: Optional[str] = None
    is_jv_partner: Optional[bool] = None
    status: Optional[str] = None
    action_comment: Optional[str] = None
    requested_by: Optional[str] = None
    action_due_date: Optional[str] = None


class DocumentReuploadRequest(BaseModel):
    reason: str
    comment: str
    due_date: Optional[str] = "T-48h"
    requested_by: Optional[str] = "Prime Compliance Lead"


class DocumentNewUploadRequest(BaseModel):
    tender_id: str
    title: str
    folder: str = "02_company_statutory_documents"
    company_name: str
    company_role: Optional[str] = "JV_PARTNER"
    instructions: str
    due_date: Optional[str] = "T-48h"
    requested_by: Optional[str] = "Prime Lead Estimator"
    is_jv_partner: Optional[bool] = None


class ReusableDocUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    access_level: Optional[str] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None


class ReusableDocCreate(BaseModel):
    name: str
    category: str = "Company Statutory"
    company_name: Optional[str] = "PrimeTech Ltd"
    company_role: Optional[str] = "LEAD_BIDDER"
    is_jv_partner: bool = False
    size: str = "2.5 MB"
    expiry_date: Optional[str] = None
    access_level: str = "ALL_TEAM"
    description: Optional[str] = None


class ReusableDocOut(BaseModel):
    id: str
    name: str
    category: str
    company_name: Optional[str] = "PrimeTech Ltd"
    company_role: Optional[str] = "LEAD_BIDDER"
    is_jv_partner: bool = False
    uploaded_at: str
    expiry_date: Optional[str] = None
    size: str
    revision: str
    access_level: str
    sha256: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class LinkReusableRequest(BaseModel):
    reusable_doc_id: str
    target_folder: str = "02_company_statutory_documents"
    company_name: Optional[str] = None
    company_role: Optional[str] = None
    is_jv_partner: Optional[bool] = None


class ResourceShareCreate(BaseModel):
    shared_with_type: str = "PARTNER_ORGANIZATION"  # PARTNER_ORGANIZATION, USER, PUBLIC
    shared_with_id: Optional[str] = None
    recipient_email: Optional[str] = None
    can_view: bool = True
    can_preview: bool = True
    can_download: bool = False
    can_reshare: bool = False
    expires_in_days: Optional[int] = 7


class ResourceShareOut(BaseModel):
    id: int
    uuid: str
    resource_type: str
    resource_id: str
    tender_id: str
    shared_by_user_id: str
    shared_with_type: str
    shared_with_id: Optional[str] = None
    recipient_email: Optional[str] = None
    can_view: bool
    can_preview: bool
    can_download: bool
    can_share: bool
    token: str
    expires_at: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PublicShareValidationOut(BaseModel):
    token: str
    document_id: str
    document_name: str
    tender_id: str
    tender_title: Optional[str] = None
    folder: str
    size: str
    sha256: str
    can_view: bool
    can_download: bool
    expires_at: Optional[datetime] = None
    status: str
    shared_by: str
