from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender, TenderDecisionMatrix
from app.models.review import TenderReviewTier
from app.models.permission import ResourceShare
from app.schemas.tender import (
    TenderCreate,
    TenderUpdate,
    TenderOut,
    ReviewTierOut,
    SignOffRequest,
    DecisionMatrixIn,
    DecisionMatrixOut,
)
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
            (Tender.title.ilike(s))
            | (Tender.id.ilike(s))
            | (Tender.organization.ilike(s))
            | (Tender.reference_no.ilike(s))
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
        raise HTTPException(
            status_code=400, detail=f"Tender {tender_id} already exists"
        )

    rate = (
        tender_in.exchange_rate_to_bdt
        if tender_in.exchange_rate_to_bdt is not None
        else (1.0 if tender_in.currency == "BDT" else 122.0)
    )
    val = tender_in.estimated_value or 0.0
    val_bdt = (
        tender_in.estimated_value_bdt
        if tender_in.estimated_value_bdt is not None
        else (val if tender_in.currency == "BDT" else round(val * rate, 2))
    )

    db_tender = Tender(
        id=tender_id,
        reference_no=tender_in.reference_no or "",
        title=tender_in.title,
        organization=tender_in.organization,
        country=tender_in.country,
        category=tender_in.category,
        estimated_value=tender_in.estimated_value,
        currency=tender_in.currency or "USD",
        exchange_rate_to_bdt=rate,
        exchange_rate_date=tender_in.exchange_rate_date,
        estimated_value_bdt=val_bdt,
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
        important_clauses=[c.model_dump() for c in (tender_in.important_clauses or [])],
        procurement_manager_name=tender_in.procurement_manager_name,
        procurement_manager_designation=tender_in.procurement_manager_designation,
        procurement_manager_email=tender_in.procurement_manager_email,
        procurement_manager_phone=tender_in.procurement_manager_phone,
        helpline_phone=tender_in.helpline_phone,
        helpline_email=tender_in.helpline_email,
        helpline_hours=tender_in.helpline_hours,
        opening_date=tender_in.opening_date,
        contract_signing_date=tender_in.contract_signing_date,
        work_start_date=tender_in.work_start_date,
        possible_period=tender_in.possible_period,
        product_handover_date=tender_in.product_handover_date,
        maintenance_period=tender_in.maintenance_period,
        schedule_purchase_deadline=tender_in.schedule_purchase_deadline,
        schedule_purchase_method=tender_in.schedule_purchase_method,
        tender_security_amount=tender_in.tender_security_amount,
        tender_security_method=tender_in.tender_security_method,
        tender_type=tender_in.tender_type,
        budget_type=tender_in.budget_type,
        source_of_fund=tender_in.source_of_fund,
        procurement_method=tender_in.procurement_method,
        parent_eoi_id=tender_in.parent_eoi_id,
        spawned_rfp_id=tender_in.spawned_rfp_id,
        eoi_shortlist_status=tender_in.eoi_shortlist_status,
        post_award_data=tender_in.post_award_data,
        financial_model=tender_in.financial_model or {},
    )
    db.add(db_tender)
    db.flush()

    # If this RFP was spawned from a parent EOI, link them bidirectionally
    if db_tender.parent_eoi_id:
        parent_eoi = (
            db.query(Tender).filter(Tender.id == db_tender.parent_eoi_id).first()
        )
        if parent_eoi:
            parent_eoi.spawned_rfp_id = db_tender.id
            if not parent_eoi.eoi_shortlist_status:
                parent_eoi.eoi_shortlist_status = "SHORTLISTED"

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
        db.add(
            TenderReviewTier(
                tender_id=db_tender.id,
                tier_number=num,
                tier_name=name,
                role_required=role,
                sign_off_status="PENDING",
            )
        )

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

    # Auto-calculate estimated_value_bdt if estimated_value, currency, or rate is updated
    if (
        "estimated_value" in update_data
        or "exchange_rate_to_bdt" in update_data
        or "currency" in update_data
    ):
        if "estimated_value_bdt" not in update_data:
            val = tender.estimated_value or 0.0
            cur = tender.currency or "USD"
            rate = (
                tender.exchange_rate_to_bdt
                if tender.exchange_rate_to_bdt is not None
                else (1.0 if cur == "BDT" else 122.0)
            )
            tender.estimated_value_bdt = val if cur == "BDT" else round(val * rate, 2)

    db.commit()
    db.refresh(tender)
    return tender


@router.post("/{tender_id}/decision", response_model=DecisionMatrixOut)
def set_tender_decision(
    tender_id: str,
    matrix_in: DecisionMatrixIn,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # Update decision on tender
    decision_val = matrix_in.decision or matrix_in.status or "GO"
    tender.decision = decision_val.upper()

    matrix = (
        db.query(TenderDecisionMatrix)
        .filter(TenderDecisionMatrix.tender_id == tender_id)
        .first()
    )
    tech = (
        matrix_in.technical_score
        if matrix_in.technical_score is not None
        else (matrix_in.technical or 0.0)
    )
    fin = (
        matrix_in.financial_score
        if matrix_in.financial_score is not None
        else (matrix_in.financial or 0.0)
    )
    team = (
        matrix_in.team_score
        if matrix_in.team_score is not None
        else (matrix_in.team or 0.0)
    )
    sla = (
        matrix_in.sla_score
        if matrix_in.sla_score is not None
        else (matrix_in.sla or 0.0)
    )
    composite = (
        matrix_in.composite_score
        if matrix_in.composite_score is not None
        else (matrix_in.aggregateScore or round((tech + fin + team + sla) / 4.0, 1))
    )

    if not matrix:
        matrix = TenderDecisionMatrix(
            tender_id=tender_id,
            technical_score=tech,
            financial_score=fin,
            team_score=team,
            sla_score=sla,
            composite_score=composite,
            threshold=matrix_in.threshold,
            status=decision_val.upper(),
            rationale=matrix_in.rationale,
        )
        db.add(matrix)
    else:
        matrix.technical_score = tech
        matrix.financial_score = fin
        matrix.team_score = team
        matrix.sla_score = sla
        matrix.composite_score = composite
        matrix.threshold = matrix_in.threshold
        matrix.status = decision_val.upper()
        if matrix_in.rationale:
            matrix.rationale = matrix_in.rationale

    db.commit()
    db.refresh(matrix)
    return matrix


@router.delete("/{tender_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    db.query(ResourceShare).filter(ResourceShare.tender_id == tender_id).delete()
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


@router.get("/{tender_id}/reviews", response_model=List[ReviewTierOut])
def get_tender_reviews(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    reviews = (
        db.query(TenderReviewTier)
        .filter(TenderReviewTier.tender_id == tender_id)
        .order_by(TenderReviewTier.tier_number.asc())
        .all()
    )
    if not reviews:
        # Auto-provision 4 tiers if none exist
        tiers = [
            (1, "Technical Architecture", "EXECUTIVE_MANAGER"),
            (2, "Financial Feasibility", "SENIOR_MANAGER"),
            (3, "Legal & Governance", "TENDER_ANALYST"),
            (4, "Executive Sign-Off", "BUSINESS_HEAD"),
        ]
        created = []
        for num, name, role in tiers:
            tier = TenderReviewTier(
                tender_id=tender_id,
                tier_number=num,
                tier_name=name,
                role_required=role,
                sign_off_status="ACTION_REQUIRED" if num == 1 else "WAITING",
            )
            db.add(tier)
            created.append(tier)
        db.commit()
        return created
    return reviews


@router.put(
    "/{tender_id}/reviews/{tier_number}/sign-off",
    response_model=List[ReviewTierOut],
)
def sign_off_tender_tier(
    tender_id: str,
    tier_number: int,
    payload: SignOffRequest,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    tier = (
        db.query(TenderReviewTier)
        .filter(
            TenderReviewTier.tender_id == tender_id,
            TenderReviewTier.tier_number == tier_number,
        )
        .first()
    )
    if not tier:
        raise HTTPException(status_code=404, detail="Review tier not found")

    tier.sign_off_status = payload.status
    tier.signed_off_by = payload.signer_name
    tier.signed_off_at = datetime.now().strftime("%d %b %Y, %H:%M")
    tier.comments = payload.comments

    # Advance next tier to ACTION_REQUIRED if this one is APPROVED
    if payload.status == "APPROVED":
        next_tier = (
            db.query(TenderReviewTier)
            .filter(
                TenderReviewTier.tender_id == tender_id,
                TenderReviewTier.tier_number == tier_number + 1,
            )
            .first()
        )
        if next_tier and next_tier.sign_off_status in ["WAITING", "PENDING"]:
            next_tier.sign_off_status = "ACTION_REQUIRED"

    # Check if all tiers approved
    all_tiers = (
        db.query(TenderReviewTier).filter(TenderReviewTier.tender_id == tender_id).all()
    )
    if all(t.sign_off_status == "APPROVED" for t in all_tiers):
        tender.stage = "SUBMITTED"
        tender.readiness_score = 100

    db.commit()
    return (
        db.query(TenderReviewTier)
        .filter(TenderReviewTier.tender_id == tender_id)
        .order_by(TenderReviewTier.tier_number.asc())
        .all()
    )
