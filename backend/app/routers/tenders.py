from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender, TenderDecisionMatrix
from app.models.review import TenderReviewTier
from app.schemas.tender import TenderCreate, TenderUpdate, TenderOut
from app.services.storage import ensure_tender_directories

router = APIRouter(prefix="/tenders", tags=["Tenders"])

@router.get("", response_model=List[TenderOut])
def get_tenders(
    stage: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    include_archived: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Tender)
    
    if not include_archived:
        query = query.filter(Tender.stage != "ARCHIVED")
        
    if stage and stage.upper() != "ALL":
        query = query.filter(Tender.stage == stage.upper())
        
    if category and category.upper() != "ALL":
        query = query.filter(Tender.category == category)
        
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (Tender.title.ilike(s)) |
            (Tender.id.ilike(s)) |
            (Tender.organization.ilike(s)) |
            (Tender.reference_no.ilike(s))
        )
        
    return query.order_by(Tender.created_at.desc()).all()

@router.get("/{tender_id}", response_model=TenderOut)
def get_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@router.post("", response_model=TenderOut, status_code=status.HTTP_201_CREATED)
def create_tender(tender_in: TenderCreate, db: Session = Depends(get_db)):
    tender_id = tender_in.id or f"TDR-2026-{db.query(Tender).count() + 100}"
    
    existing = db.query(Tender).filter(Tender.id == tender_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Tender {tender_id} already exists")
        
    db_tender = Tender(
        id=tender_id,
        reference_no=tender_in.reference_no or "",
        title=tender_in.title,
        organization=tender_in.organization,
        country=tender_in.country,
        category=tender_in.category,
        estimated_value=tender_in.estimated_value,
        stage=tender_in.stage,
        decision=tender_in.decision,
        priority=tender_in.priority,
        submission_deadline=tender_in.submission_deadline,
        days_remaining=tender_in.days_remaining,
        hours_remaining=tender_in.hours_remaining,
        readiness_score=tender_in.readiness_score,
        lead_owner_name=tender_in.lead_owner_name,
        lead_owner_role=tender_in.lead_owner_role,
        summary_json=tender_in.summary_json,
    )
    db.add(db_tender)
    db.flush()
    
    # Auto-provision local SSD storage vault folders
    ensure_tender_directories(db_tender.id)
    
    # Auto-provision default 4-tier reviews
    tiers = [
        (1, "Technical Architecture", "EXECUTIVE_MANAGER"),
        (2, "Financial Feasibility", "SENIOR_MANAGER"),
        (3, "Legal & Governance", "TENDER_ANALYST"),
        (4, "Executive Sign-Off", "BUSINESS_HEAD"),
    ]
    for num, name, role in tiers:
        db.add(TenderReviewTier(tender_id=db_tender.id, tier_number=num, tier_name=name, role_required=role, sign_off_status="PENDING"))
        
    db.commit()
    db.refresh(db_tender)
    return db_tender

@router.put("/{tender_id}", response_model=TenderOut)
def update_tender(tender_id: str, updates: TenderUpdate, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tender, field, value)
        
    db.commit()
    db.refresh(tender)
    return tender

@router.delete("/{tender_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    db.delete(tender)
    db.commit()
    return None

@router.post("/{tender_id}/archive", response_model=TenderOut)
def archive_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    tender.archived_from_stage = tender.stage
    tender.stage = "ARCHIVED"
    db.commit()
    db.refresh(tender)
    return tender

@router.post("/{tender_id}/restore", response_model=TenderOut)
def restore_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    tender.stage = tender.archived_from_stage or "DISCOVERED"
    tender.archived_from_stage = None
    db.commit()
    db.refresh(tender)
    return tender
