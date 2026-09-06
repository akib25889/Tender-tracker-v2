import json
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class OrganizationBase(BaseModel):
    name: str
    short_name: Optional[str] = Field(default=None, alias="shortName")
    type: str = "GOVERNMENT"
    parent_id: Optional[str] = Field(default=None, alias="parentId")
    country: str = "Bangladesh"
    website: Optional[str] = None
    priority: str = "MEDIUM"
    aliases: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class OrganizationCreate(OrganizationBase):
    id: Optional[str] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = Field(default=None, alias="shortName")
    type: Optional[str] = None
    parent_id: Optional[str] = Field(default=None, alias="parentId")
    country: Optional[str] = None
    website: Optional[str] = None
    priority: Optional[str] = None
    aliases: Optional[List[str]] = None
    description: Optional[str] = None

    class Config:
        populate_by_name = True


class OrganizationOut(BaseModel):
    id: str
    name: str
    shortName: Optional[str] = None
    type: str
    parentId: Optional[str] = None
    country: str
    website: Optional[str] = None
    priority: str
    aliases: List[str] = []
    description: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, org):
        alias_list = []
        if org.aliases_json:
            try:
                alias_list = json.loads(org.aliases_json)
            except Exception:
                alias_list = [org.aliases_json]
        return cls(
            id=org.id,
            name=org.name,
            shortName=org.short_name,
            type=org.type,
            parentId=org.parent_id,
            country=org.country,
            website=org.website,
            priority=org.priority,
            aliases=alias_list,
            description=org.description,
            createdAt=org.created_at.isoformat() if org.created_at else None,
        )
