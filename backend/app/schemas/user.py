from typing import Optional
from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "TENDER_ANALYST"
    title: str = "Procurement Specialist"
    department: Optional[str] = "Bid Operations"
    max_capacity: int = 5
    avatar: str = "TM"

class UserCreate(UserBase):
    password: str

class UserProfile(UserBase):
    id: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
