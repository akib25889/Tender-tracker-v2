import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender, TenderDecisionMatrix
from app.models.requirement import TenderRequirement
from app.models.permission import ResourceShare
from app.schemas.tender import (
    TenderCreate,
    TenderUpdate,
    TenderOut,
    DecisionMatrixIn,
    DecisionMatrixOut,
    AiChatLinkUpdate,
    TenderAmendmentIn,
)
from app.services.storage import ensure_tender_directories

router = APIRouter(prefix="/tenders", tags=["Tenders"])


def sync_submission_docs_to_requirements(
    tender: Tender, summary_json_str: Optional[str], db: Session
):
    """Automatically populate TenderRequirement entries from summary_json.submissionDocuments if missing."""
    if not summary_json_str:
        return
    try:
        data = (
            json.loads(summary_json_str)
            if isinstance(summary_json_str, str)
            else summary_json_str
        )
        sub_docs = data.get("submissionDocuments")
        if isinstance(sub_docs, list) and len(sub_docs) > 0:
            cleaned_docs = [str(d).strip() for d in sub_docs if str(d).strip()]
            if not cleaned_docs:
                return
            existing_reqs = (
                db.query(TenderRequirement)
                .filter(TenderRequirement.tender_id == tender.id)
                .all()
            )
            existing_map = {r.title.strip().lower(): r for r in existing_reqs}

            for idx, doc_title in enumerate(cleaned_docs):
                key = doc_title.lower()
                if key not in existing_map:
                    new_req = TenderRequirement(
                        id=f"REQ-{tender.id[:8]}-{idx + 1}-{uuid.uuid4().hex[:4]}",
                        tender_id=tender.id,
                        title=doc_title,
                        category="Statutory Document",
                        status="PENDING",
                        owner=tender.lead_owner_name or "Tender Lead",
                    )
                    db.add(new_req)
    except Exception:
        pass


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
        # Upsert: update existing tender with incoming data
        update_data = tender_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "id":
                continue
            if field == "important_clauses" and value is not None:
                existing.important_clauses = [
                    c.model_dump() if hasattr(c, "model_dump") else c for c in value
                ]
            elif field == "evaluation_method":
                existing.evaluation_method = value or tender_in.evaluationMethod
            elif hasattr(existing, field):
                setattr(existing, field, value)

        rate = (
            tender_in.exchange_rate_to_bdt
            if tender_in.exchange_rate_to_bdt is not None
            else (1.0 if existing.currency == "BDT" else (existing.exchange_rate_to_bdt or 122.0))
        )
        existing.exchange_rate_to_bdt = rate
        val = existing.estimated_value or 0.0
        existing.estimated_value_bdt = (
            tender_in.estimated_value_bdt
            if tender_in.estimated_value_bdt is not None
            else (val if existing.currency == "BDT" else round(val * rate, 2))
        )

        if existing.parent_eoi_id:
            parent_eoi = (
                db.query(Tender).filter(Tender.id == existing.parent_eoi_id).first()
            )
            if parent_eoi:
                parent_eoi.spawned_rfp_id = existing.id
                if not parent_eoi.eoi_shortlist_status:
                    parent_eoi.eoi_shortlist_status = "SHORTLISTED"

        sync_submission_docs_to_requirements(existing, existing.summary_json, db)
        ensure_tender_directories(existing.id)
        db.commit()
        db.refresh(existing)
        return existing

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
        evaluation_method=tender_in.evaluation_method or tender_in.evaluationMethod,
        parent_eoi_id=tender_in.parent_eoi_id,
        spawned_rfp_id=tender_in.spawned_rfp_id,
        eoi_shortlist_status=tender_in.eoi_shortlist_status,
        post_award_data=tender_in.post_award_data,
        financial_model=tender_in.financial_model or {},
        ai_chat_share_link=tender_in.ai_chat_share_link,
        languages=tender_in.languages or [],
        amendments=tender_in.amendments or [],
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

    sync_submission_docs_to_requirements(db_tender, db_tender.summary_json, db)

    # Auto-provision local SSD storage vault folders
    ensure_tender_directories(db_tender.id)

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
        if hasattr(tender, field):
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

    if "summary_json" in update_data:
        sync_submission_docs_to_requirements(tender, tender.summary_json, db)

    db.commit()
    db.refresh(tender)
    return tender


@router.patch("/{tender_id}/ai-chat-link")
def update_ai_chat_link(
    tender_id: str,
    payload: AiChatLinkUpdate,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    tender.ai_chat_share_link = payload.ai_chat_share_link
    db.commit()
    db.refresh(tender)
    return {"id": tender.id, "ai_chat_share_link": tender.ai_chat_share_link}


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


@router.post("/{tender_id}/amendments", response_model=TenderOut)
def add_tender_amendment(
    tender_id: str,
    amendment_in: TenderAmendmentIn,
    db: Session = Depends(get_db),
):
    """Register a client corrigendum / amendment, optionally extending deadline and adding new rules."""
    from datetime import timezone
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    amendments = list(tender.amendments or [])
    amd_num = amendment_in.amendment_number or (len(amendments) + 1)
    new_amd = {
        "id": f"AMD-{tender_id}-{len(amendments) + 1}",
        "amendmentNumber": amd_num,
        "title": amendment_in.title,
        "issuedDate": amendment_in.issued_date or datetime.now().strftime("%Y-%m-%d"),
        "isDeadlineExtended": amendment_in.is_deadline_extended,
        "previousDeadline": amendment_in.previous_deadline or tender.submission_deadline,
        "newDeadline": amendment_in.new_deadline,
        "newRules": amendment_in.new_rules or [],
        "ruleChangesDescription": amendment_in.rule_changes_description,
        "referenceNotice": amendment_in.reference_notice,
        "notes": amendment_in.notes,
        "createdAt": datetime.now().isoformat(),
    }

    # If client extended submission deadline, apply immediately to tender
    if amendment_in.is_deadline_extended and amendment_in.new_deadline:
        tender.submission_deadline = amendment_in.new_deadline
        try:
            target_dt = datetime.fromisoformat(amendment_in.new_deadline.replace("Z", "+00:00"))
            now_dt = datetime.now(target_dt.tzinfo or timezone.utc)
            diff = target_dt - now_dt
            tender.days_remaining = max(0, diff.days)
            tender.hours_remaining = max(0, int(diff.total_seconds() // 3600))
        except Exception:
            pass

    # If rule changes provided, also append to important_clauses for compliance audit
    if amendment_in.new_rules:
        existing_clauses = list(tender.important_clauses or [])
        for idx, rule in enumerate(amendment_in.new_rules):
            if rule.strip():
                existing_clauses.append({
                    "id": f"CLS-AMD-{len(existing_clauses) + 1}",
                    "clause_title": f"Corrigendum #{amd_num}: {rule[:45]}...",
                    "category": "TECHNICAL_MANDATORY",
                    "criticality": "HIGH",
                    "doc_reference": amendment_in.reference_notice or f"Corrigendum #{amd_num}",
                    "clause_text": rule,
                    "implication": "Introduced via client corrigendum / amendment.",
                })
        tender.important_clauses = existing_clauses

    amendments.append(new_amd)
    tender.amendments = amendments

    db.commit()
    db.refresh(tender)
    return tender

