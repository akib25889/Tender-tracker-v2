import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.requirement import TenderRequirement
from app.models.tender import Tender
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
    RequirementOut,
)

router = APIRouter(prefix="/requirements", tags=["Tender Compliance Requirements"])


@router.get("", response_model=List[RequirementOut])
def get_requirements(
    tender_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TenderRequirement)
    if tender_id:
        query = query.filter(TenderRequirement.tender_id == tender_id)
    if status and status.upper() != "ALL":
        query = query.filter(TenderRequirement.status == status.upper())
    return query.all()


@router.post(
    "/tender/{tender_id}",
    response_model=RequirementOut,
    status_code=status.HTTP_201_CREATED,
)
def create_requirement(
    tender_id: str,
    req_in: RequirementCreate,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    req_id = req_in.id or f"REQ-{uuid.uuid4().hex[:6].upper()}"
    db_req = TenderRequirement(
        id=req_id,
        tender_id=tender_id,
        title=req_in.title,
        category=req_in.category,
        status=req_in.status,
        owner=req_in.owner,
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req


@router.patch("/{req_id}", response_model=RequirementOut)
def update_requirement(
    req_id: str,
    updates: RequirementUpdate,
    db: Session = Depends(get_db),
):
    req = db.query(TenderRequirement).filter(TenderRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)
    return req


@router.delete("/{req_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(req_id: str, db: Session = Depends(get_db)):
    req = db.query(TenderRequirement).filter(TenderRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    db.delete(req)
    db.commit()
    return None
