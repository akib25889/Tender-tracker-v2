import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserProfile, UserProfileUpdate, PastAssignmentSchema

router = APIRouter(prefix="/users", tags=["Users & Personal Profiles"])


@router.get("", response_model=List[UserProfile])
def get_all_users(db: Session = Depends(get_db)):
    """List all team members and their profiles."""
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """Retrieve full personal profile and CV dossier for a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")
    return user


@router.put("/{user_id}", response_model=UserProfile)
def update_user_profile(
    user_id: str,
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
):
    """Update personal profile, contact info, employment relationship, or tender proposed role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/assignments", response_model=UserProfile)
def add_past_assignment(
    user_id: str,
    assignment: PastAssignmentSchema,
    db: Session = Depends(get_db),
):
    """Add a past project assignment to the user's technical track record for CV generation."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")

    assignments = list(user.past_assignments or [])
    new_asg = assignment.model_dump()
    if not new_asg.get("id"):
        new_asg["id"] = f"asg-{uuid.uuid4().hex[:8]}"

    assignments.append(new_asg)
    user.past_assignments = assignments

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}/assignments/{assignment_id}", response_model=UserProfile)
def delete_past_assignment(
    user_id: str,
    assignment_id: str,
    db: Session = Depends(get_db),
):
    """Remove a past project assignment from the user's CV track record."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")

    assignments = [
        asg for asg in (user.past_assignments or []) if asg.get("id") != assignment_id
    ]
    user.past_assignments = assignments

    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}/activities")
def get_user_activities(user_id: str, db: Session = Depends(get_db)):
    """Retrieve full chronological activity trail of all actions performed by this user."""
    from app.models.permission import AuthorizationAuditLog
    from app.models.task import TenderTask
    from app.models.comment import TenderComment
    from app.models.tender import Tender, TenderSubmission

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")

    activities = []

    # 1. Authorization & Permission audit logs
    audit_logs = (
        db.query(AuthorizationAuditLog)
        .filter(
            (AuthorizationAuditLog.user_id == user.id)
            | (AuthorizationAuditLog.user_email == user.email)
        )
        .order_by(AuthorizationAuditLog.created_at.desc())
        .limit(40)
        .all()
    )
    for log in audit_logs:
        activities.append({
            "id": f"act-audit-{log.id}",
            "type": "PERMISSION",
            "action": f"{log.action} on {log.resource_type}",
            "tenderId": log.tender_id,
            "tenderTitle": f"Tender {log.tender_id}" if log.tender_id else None,
            "timestamp": log.created_at.isoformat() if log.created_at else "",
            "details": f"Status: {log.decision} | Reason: {log.reason or 'Access policy verified'}",
            "status": log.decision,
        })

    # 2. Tasks assigned to or worked by user
    tasks = (
        db.query(TenderTask)
        .filter(TenderTask.assignee.ilike(f"%{user.name}%"))
        .limit(30)
        .all()
    )
    for tsk in tasks:
        tender = db.query(Tender).filter(Tender.id == tsk.tender_id).first()
        activities.append({
            "id": f"act-tsk-{tsk.id}",
            "type": "TASK",
            "action": f"Task '{tsk.title}' ({tsk.status})",
            "tenderId": tsk.tender_id,
            "tenderTitle": tender.title if tender else tsk.tender_id,
            "timestamp": tender.updated_at.isoformat() if tender and tender.updated_at else "",
            "details": f"Priority: {tsk.priority} • Status: {tsk.status} • Due: {tsk.due_date or 'TBD'}",
            "status": tsk.status,
        })

    # 3. Submissions by this user
    submissions = (
        db.query(TenderSubmission)
        .filter(TenderSubmission.submitted_by.ilike(f"%{user.name}%"))
        .all()
    )
    for sub in submissions:
        tender = db.query(Tender).filter(Tender.id == sub.tender_id).first()
        activities.append({
            "id": f"act-sub-{sub.id}",
            "type": "SUBMISSION",
            "action": f"Tender Proposal Submission Proof Uploaded",
            "tenderId": sub.tender_id,
            "tenderTitle": tender.title if tender else sub.tender_id,
            "timestamp": sub.submitted_at.isoformat() if sub.submitted_at else "",
            "details": f"Portal Ref: {sub.portal_reference} • Status: {sub.status}",
            "status": sub.status,
        })

    # 4. Comments posted by this user
    comments = (
        db.query(TenderComment)
        .filter(TenderComment.author_name.ilike(f"%{user.name}%"))
        .order_by(TenderComment.created_at.desc())
        .limit(30)
        .all()
    )
    for c in comments:
        tender = db.query(Tender).filter(Tender.id == c.tender_id).first()
        activities.append({
            "id": f"act-cmt-{c.id}",
            "type": "COMMENT",
            "action": f"Posted comment on proposal",
            "tenderId": c.tender_id,
            "tenderTitle": tender.title if tender else c.tender_id,
            "timestamp": c.created_at.isoformat() if c.created_at else "",
            "details": c.content[:120] + ("..." if len(c.content) > 120 else ""),
            "status": "POSTED",
        })

    # 5. Lead projects
    lead_tenders = (
        db.query(Tender)
        .filter(Tender.lead_owner_name.ilike(f"%{user.name}%"))
        .limit(20)
        .all()
    )
    for lt in lead_tenders:
        activities.append({
            "id": f"act-tnd-{lt.id}",
            "type": "TENDER",
            "action": f"Assigned Lead Bid Manager on {lt.reference_no or lt.id}",
            "tenderId": lt.id,
            "tenderTitle": lt.title,
            "timestamp": lt.updated_at.isoformat() if lt.updated_at else (lt.created_at.isoformat() if lt.created_at else ""),
            "details": f"Stage: {lt.stage} • Value: {lt.currency} {lt.estimated_value or 0:,.0f} • Authority: {lt.organization}",
            "status": lt.stage,
        })

    # Sort all activities by timestamp descending
    activities.sort(key=lambda a: a.get("timestamp") or "", reverse=True)
    return activities

