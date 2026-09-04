from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.models.permission import (
    Permission,
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
    AuthorizationAuditLog,
)
from app.services.authorization import AuthorizationService

router = APIRouter(prefix="/permissions", tags=["Permissions & Access Control"])


# --- Schemas ---
class RuleCreateSchema(BaseModel):
    subject_type: str
    subject_id: str
    permission_code: str
    effect: str = "ALLOW"
    scope_type: str = "ROLE"
    scope_id: Optional[str] = None
    expires_at: Optional[str] = None


class PartnerCreateSchema(BaseModel):
    id: str
    name: str
    partner_type: str = "JV_PARTNER"
    country: Optional[str] = "Bangladesh"
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    status: str = "ACTIVE"
    notes: Optional[str] = None


class PartnerAssignSchema(BaseModel):
    tender_id: str
    partner_type: str = "JV_PARTNER"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None


class CeilingUpdateSchema(BaseModel):
    ceilings: Dict[
        str, bool
    ]  # e.g. {"document.download": False, "financial.view": False}


class AccessBlockCreateSchema(BaseModel):
    subject_type: str
    subject_id: str
    block_type: str
    reason: str


class DiagnoseRequestSchema(BaseModel):
    user_id: Optional[str] = None
    partner_org_id: Optional[str] = None
    tender_id: Optional[str] = None
    resource_id: Optional[str] = None
    permission_code: str


# --- Endpoints ---


@router.get("/catalog")
def get_permission_catalog(db: Session = Depends(get_db)):
    """Returns all standard permissions grouped by module."""
    perms = db.query(Permission).order_by(Permission.module, Permission.code).all()
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for p in perms:
        if p.module not in grouped:
            grouped[p.module] = []
        grouped[p.module].append(
            {
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "description": p.description,
                "action": p.action,
            }
        )
    return {"catalog": grouped, "total": len(perms)}


@router.get("/rules")
def list_rules(
    scope_type: Optional[str] = None,
    subject_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List permission rules with optional filtering."""
    query = db.query(PermissionRule)
    if scope_type:
        query = query.filter(PermissionRule.scope_type == scope_type)
    if subject_type:
        query = query.filter(PermissionRule.subject_type == subject_type)
    rules = query.order_by(PermissionRule.id.desc()).all()
    return rules


@router.post("/rules")
def create_or_update_rule(payload: RuleCreateSchema, db: Session = Depends(get_db)):
    """Add or update an explicit permission rule."""
    existing = (
        db.query(PermissionRule)
        .filter(
            PermissionRule.subject_type == payload.subject_type,
            PermissionRule.subject_id == payload.subject_id,
            PermissionRule.permission_code == payload.permission_code,
            PermissionRule.scope_type == payload.scope_type,
            PermissionRule.scope_id == payload.scope_id,
        )
        .first()
    )

    if existing:
        existing.effect = payload.effect
        existing.expires_at = payload.expires_at
        db.commit()
        db.refresh(existing)
        return existing

    rule = PermissionRule(
        subject_type=payload.subject_type,
        subject_id=payload.subject_id,
        permission_code=payload.permission_code,
        effect=payload.effect,
        scope_type=payload.scope_type,
        scope_id=payload.scope_id,
        expires_at=payload.expires_at,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(PermissionRule).filter(PermissionRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Rule removed successfully", "id": rule_id}


@router.get("/partners")
def list_partners(db: Session = Depends(get_db)):
    """List all partner organizations and their active tender assignments."""
    partners = db.query(PartnerOrganization).all()
    result = []
    for p in partners:
        assignments = (
            db.query(TenderPartnerAssignment)
            .filter(TenderPartnerAssignment.organization_id == p.id)
            .all()
        )
        ceilings = (
            db.query(PartnerPermissionCeiling)
            .filter(PartnerPermissionCeiling.partner_organization_id == p.id)
            .all()
        )
        result.append(
            {
                "id": p.id,
                "name": p.name,
                "partner_type": p.partner_type,
                "country": p.country,
                "contact_email": p.contact_email,
                "status": p.status,
                "notes": p.notes,
                "assignments": [
                    {
                        "tender_id": a.tender_id,
                        "status": a.status,
                        "partner_type": a.partner_type,
                        "start_date": a.start_date,
                        "end_date": a.end_date,
                    }
                    for a in assignments
                ],
                "ceilings_count": len(ceilings),
            }
        )
    return result


@router.post("/partners")
def create_partner(payload: PartnerCreateSchema, db: Session = Depends(get_db)):
    existing = (
        db.query(PartnerOrganization)
        .filter(PartnerOrganization.id == payload.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Partner organization ID already exists"
        )

    partner = PartnerOrganization(
        id=payload.id,
        name=payload.name,
        partner_type=payload.partner_type,
        country=payload.country,
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/partners/{partner_id}")
def update_partner(
    partner_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)
):
    partner = (
        db.query(PartnerOrganization)
        .filter(PartnerOrganization.id == partner_id)
        .first()
    )
    if not partner:
        raise HTTPException(status_code=404, detail="Partner organization not found")

    for field in ["name", "partner_type", "status", "notes", "contact_email"]:
        if field in payload:
            setattr(partner, field, payload[field])

    db.commit()
    db.refresh(partner)
    return partner


@router.post("/partners/{partner_id}/assign")
def assign_partner_to_tender(
    partner_id: str,
    payload: PartnerAssignSchema,
    db: Session = Depends(get_db),
):
    partner = (
        db.query(PartnerOrganization)
        .filter(PartnerOrganization.id == partner_id)
        .first()
    )
    if not partner:
        raise HTTPException(status_code=404, detail="Partner organization not found")

    existing = (
        db.query(TenderPartnerAssignment)
        .filter(
            TenderPartnerAssignment.organization_id == partner_id,
            TenderPartnerAssignment.tender_id == payload.tender_id,
        )
        .first()
    )

    if existing:
        existing.status = "ACTIVE"
        existing.partner_type = payload.partner_type
        existing.start_date = payload.start_date
        existing.end_date = payload.end_date
        existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        return existing

    assignment = TenderPartnerAssignment(
        organization_id=partner_id,
        tender_id=payload.tender_id,
        partner_type=payload.partner_type,
        status="ACTIVE",
        start_date=payload.start_date,
        end_date=payload.end_date,
        notes=payload.notes,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/tenders/{tender_id}/partners")
def get_tender_partners(tender_id: str, db: Session = Depends(get_db)):
    assignments = (
        db.query(TenderPartnerAssignment)
        .filter(TenderPartnerAssignment.tender_id == tender_id)
        .all()
    )
    results = []
    for a in assignments:
        org = (
            db.query(PartnerOrganization)
            .filter(PartnerOrganization.id == a.organization_id)
            .first()
        )
        ceilings = (
            db.query(PartnerPermissionCeiling)
            .filter(
                PartnerPermissionCeiling.partner_organization_id == a.organization_id
            )
            .all()
        )
        results.append(
            {
                "assignment_id": a.id,
                "organization_id": a.organization_id,
                "organization_name": org.name if org else a.organization_id,
                "country": org.country if org else "Bangladesh",
                "contact_email": org.contact_email if org else None,
                "contact_phone": org.contact_phone if org else None,
                "partner_type": a.partner_type,
                "status": a.status,
                "start_date": a.start_date,
                "end_date": a.end_date,
                "notes": a.notes,
                "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
                "ceilings": {c.permission_code: c.allowed for c in ceilings},
            }
        )
    return results


@router.delete("/tenders/{tender_id}/partners/{partner_id}")
def unassign_partner_from_tender(
    tender_id: str, partner_id: str, db: Session = Depends(get_db)
):
    assignment = (
        db.query(TenderPartnerAssignment)
        .filter(
            TenderPartnerAssignment.tender_id == tender_id,
            TenderPartnerAssignment.organization_id == partner_id,
        )
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Partner assignment not found")
    db.delete(assignment)
    db.commit()
    return {
        "message": "Partner successfully unassigned from tender",
        "partner_id": partner_id,
        "tender_id": tender_id,
    }



@router.get("/partners/{partner_id}/ceilings")
def get_partner_ceilings(partner_id: str, db: Session = Depends(get_db)):
    ceilings = (
        db.query(PartnerPermissionCeiling)
        .filter(PartnerPermissionCeiling.partner_organization_id == partner_id)
        .all()
    )
    return {c.permission_code: c.allowed for c in ceilings}


@router.post("/partners/{partner_id}/ceilings")
def set_partner_ceilings(
    partner_id: str,
    payload: CeilingUpdateSchema,
    db: Session = Depends(get_db),
):
    partner = (
        db.query(PartnerOrganization)
        .filter(PartnerOrganization.id == partner_id)
        .first()
    )
    if not partner:
        raise HTTPException(status_code=404, detail="Partner organization not found")

    for perm_code, allowed in payload.ceilings.items():
        existing = (
            db.query(PartnerPermissionCeiling)
            .filter(
                PartnerPermissionCeiling.partner_organization_id == partner_id,
                PartnerPermissionCeiling.permission_code == perm_code,
            )
            .first()
        )
        if existing:
            existing.allowed = allowed
        else:
            new_ceiling = PartnerPermissionCeiling(
                partner_organization_id=partner_id,
                permission_code=perm_code,
                allowed=allowed,
            )
            db.add(new_ceiling)

    db.commit()
    return {"message": "Ceilings updated successfully", "count": len(payload.ceilings)}


@router.get("/blocks")
def list_blocks(db: Session = Depends(get_db)):
    return db.query(AccessBlock).filter(AccessBlock.is_active == True).all()


@router.post("/blocks")
def create_block(payload: AccessBlockCreateSchema, db: Session = Depends(get_db)):
    block = AccessBlock(
        subject_type=payload.subject_type,
        subject_id=payload.subject_id,
        block_type=payload.block_type,
        reason=payload.reason,
        is_active=True,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.delete("/blocks/{block_id}")
def delete_block(block_id: int, db: Session = Depends(get_db)):
    block = db.query(AccessBlock).filter(AccessBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    block.is_active = False
    db.commit()
    return {"message": "Access block deactivated", "id": block_id}


@router.post("/diagnose")
def diagnose_permission(payload: DiagnoseRequestSchema, db: Session = Depends(get_db)):
    """Executes live 4-layer diagnostic simulation."""
    return AuthorizationService.simulate_authorization(
        db=db,
        user_id=payload.user_id,
        permission_code=payload.permission_code,
        tender_id=payload.tender_id,
        resource_id=payload.resource_id,
        partner_org_id=payload.partner_org_id,
    )


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(50, le=200),
    decision: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(AuthorizationAuditLog)
    if decision:
        query = query.filter(AuthorizationAuditLog.decision == decision.upper())
    logs = query.order_by(AuthorizationAuditLog.created_at.desc()).limit(limit).all()
    return logs
