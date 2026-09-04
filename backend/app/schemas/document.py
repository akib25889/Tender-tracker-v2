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
