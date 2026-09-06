import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.organization import Organization
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationOut,
)

router = APIRouter(prefix="/organizations", tags=["Procuring Organizations"])


@router.get("", response_model=List[OrganizationOut])
def get_organizations(
    search: Optional[str] = None,
    parent_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Organization)
    if parent_id is not None:
        if parent_id == "null" or parent_id == "":
            query = query.filter(Organization.parent_id == None)
        else:
            query = query.filter(Organization.parent_id == parent_id)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (Organization.name.ilike(s))
            | (Organization.short_name.ilike(s))
            | (Organization.country.ilike(s))
            | (Organization.aliases_json.ilike(s))
        )
    orgs = query.order_by(Organization.name.asc()).all()
    return [OrganizationOut.from_orm_model(o) for o in orgs]


@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return OrganizationOut.from_orm_model(org)


@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
):
    org_id = payload.id or f"ORG-BD-{uuid.uuid4().hex[:6].upper()}"
    existing = db.query(Organization).filter(Organization.id == org_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization ID already exists")

    aliases_str = json.dumps(payload.aliases) if payload.aliases else None

    db_org = Organization(
        id=org_id,
        name=payload.name,
        short_name=payload.short_name,
        type=payload.type,
        parent_id=payload.parent_id,
        country=payload.country,
        website=payload.website,
        priority=payload.priority,
        aliases_json=aliases_str,
        description=payload.description,
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return OrganizationOut.from_orm_model(db_org)


@router.put("/{org_id}", response_model=OrganizationOut)
def update_organization(
    org_id: str,
    payload: OrganizationUpdate,
    db: Session = Depends(get_db),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if payload.name is not None:
        org.name = payload.name
    if payload.short_name is not None:
        org.short_name = payload.short_name
    if payload.type is not None:
        org.type = payload.type
    if payload.parent_id is not None:
        org.parent_id = payload.parent_id if payload.parent_id != "" else None
    if payload.country is not None:
        org.country = payload.country
    if payload.website is not None:
        org.website = payload.website
    if payload.priority is not None:
        org.priority = payload.priority
    if payload.description is not None:
        org.description = payload.description
    if payload.aliases is not None:
        org.aliases_json = json.dumps(payload.aliases)

    db.commit()
    db.refresh(org)
    return OrganizationOut.from_orm_model(org)


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    db.delete(org)
    db.commit()
    return None
