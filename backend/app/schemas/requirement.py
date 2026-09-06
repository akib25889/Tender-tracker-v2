from typing import Optional
from pydantic import BaseModel


class RequirementBase(BaseModel):
    title: str
    category: str = "Statutory"
    status: str = "PENDING"  # VERIFIED, PENDING, BLOCKER
    owner: str = "Tariq Al-Mansoor"


class RequirementCreate(RequirementBase):
    id: Optional[str] = None


class RequirementUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None


class RequirementOut(RequirementBase):
    id: str
    tender_id: str

    class Config:
        from_attributes = True
