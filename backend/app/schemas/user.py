from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class PastAssignmentSchema(BaseModel):
    id: str
    projectName: str
    client: str
    role: str
    duration: str
    deploymentMonths: Optional[int] = None
    keyDeliverables: List[str] = []
    technologiesUsed: List[str] = []
    coreResponsibilities: str


class UserBase(BaseModel):
    name: str
    email: str
    role: str = "TENDER_ANALYST"
    title: str = "Procurement Specialist"
    department: Optional[str] = "Bid Operations"
    max_capacity: int = 5
    avatar: str = "TM"
    phone: Optional[str] = None
    location: Optional[str] = "Dhaka, Bangladesh"
    employment_type: str = "PERMANENT"
    proposed_designation: Optional[str] = None
    past_assignments: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    active_tender_roles: Optional[Dict[str, str]] = None


class UserCreate(UserBase):
    password: str


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    max_capacity: Optional[int] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    proposed_designation: Optional[str] = None
    past_assignments: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    active_tender_roles: Optional[Dict[str, str]] = None


class UserProfile(UserBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

