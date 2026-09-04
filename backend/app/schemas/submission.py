from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SubmissionCreate(BaseModel):
    portal_reference: str
    submitted_by: Optional[str] = "Sarah Jenkins"
    receipt_sha256: Optional[str] = None
    receipt_path: Optional[str] = None


class SubmissionOut(BaseModel):
    id: int
    tender_id: str
    portal_reference: str
    submitted_by: str
    submitted_at: datetime
    receipt_sha256: Optional[str] = None
    receipt_path: Optional[str] = None
    status: str = "SUBMITTED_LOCKED"

    model_config = ConfigDict(from_attributes=True)
