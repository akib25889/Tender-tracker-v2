from typing import Optional
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
    size: str
    revision: str
    sha256: str
    uploaded_at: str
    is_reusable_link: bool = False
    reusable_source_id: Optional[str] = None
    access_level: str = "ALL_TEAM"

    class Config:
        from_attributes = True

class ReusableDocCreate(BaseModel):
    name: str
    category: str = "Company Statutory"
    size: str = "2.5 MB"
    expiry_date: Optional[str] = None
    access_level: str = "ALL_TEAM"
    description: Optional[str] = None

class ReusableDocOut(BaseModel):
    id: str
    name: str
    category: str
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

