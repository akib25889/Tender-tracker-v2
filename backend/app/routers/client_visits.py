from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.core.database import get_db
from app.models.client_visit import ClientVisit
from app.schemas.client_visit import (
    ClientVisitCreate,
    ClientVisitUpdate,
    ClientVisitStatusPatch,
    ClientVisitOut,
)

router = APIRouter(prefix="/client-visits", tags=["Client Visits & Meetings"])


@router.get("", response_model=List[ClientVisitOut])
def get_client_visits(
    status_filter: Optional[str] = Query(None, alias="status"),
    visit_type: Optional[str] = Query(None, alias="visit_type"),
    organization: Optional[str] = Query(None),
    tender_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ClientVisit)

    if status_filter and status_filter != "ALL":
        query = query.filter(ClientVisit.status == status_filter.upper())

    if visit_type and visit_type != "ALL":
        query = query.filter(ClientVisit.visit_type == visit_type)

    if organization and organization != "ALL":
        query = query.filter(
            ClientVisit.client_organization.ilike(f"%{organization}%")
        )

    if tender_id:
        query = query.filter(ClientVisit.tender_id == tender_id)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                ClientVisit.title.ilike(s),
                ClientVisit.client_organization.ilike(s),
                ClientVisit.visitor_name.ilike(s),
                ClientVisit.visitor_email.ilike(s),
                ClientVisit.internal_host_name.ilike(s),
                ClientVisit.agenda.ilike(s),
            )
        )

    return query.order_by(desc(ClientVisit.scheduled_start)).all()


@router.get("/upcoming", response_model=List[ClientVisitOut])
def get_upcoming_meetings(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """Retrieve upcoming scheduled or confirmed meetings."""
    return (
        db.query(ClientVisit)
        .filter(ClientVisit.status.in_(["SCHEDULED", "CONFIRMED", "CHECKED_IN"]))
        .order_by(ClientVisit.scheduled_start.asc())
        .limit(limit)
        .all()
    )


@router.get("/{visit_id}", response_model=ClientVisitOut)
def get_client_visit(visit_id: str, db: Session = Depends(get_db)):
    visit = db.query(ClientVisit).filter(ClientVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client visit '{visit_id}' not found",
        )
    return visit


@router.post("", response_model=ClientVisitOut, status_code=status.HTTP_201_CREATED)
def create_client_visit(
    payload: ClientVisitCreate,
    db: Session = Depends(get_db),
):
    visit_id = (
        payload.id
        if payload.id
        else f"VISIT-{datetime.now().year}-{db.query(ClientVisit).count() + 101}"
    )

    existing = db.query(ClientVisit).filter(ClientVisit.id == visit_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Visit record '{visit_id}' already exists",
        )

    visit = ClientVisit(
        id=visit_id,
        title=payload.title,
        client_organization=payload.client_organization,
        organization_id=payload.organization_id,
        tender_id=payload.tender_id,
        visitor_name=payload.visitor_name,
        visitor_designation=payload.visitor_designation,
        visitor_phone=payload.visitor_phone,
        visitor_email=payload.visitor_email,
        accompanying_persons=payload.accompanying_persons or [],
        internal_host_name=payload.internal_host_name or "Sarah Jenkins",
        internal_host_role=payload.internal_host_role or "Business Head",
        visit_type=payload.visit_type or "IN_PERSON_OFFICE",
        status=(payload.status or "SCHEDULED").upper(),
        scheduled_start=payload.scheduled_start,
        scheduled_end=payload.scheduled_end,
        actual_check_in=payload.actual_check_in,
        actual_check_out=payload.actual_check_out,
        location_or_room=payload.location_or_room or "Main Conference Room",
        meeting_link=payload.meeting_link,
        agenda=payload.agenda,
        discussion_notes=payload.discussion_notes,
        action_items=payload.action_items or [],
        sentiment_outcome=payload.sentiment_outcome or "POSITIVE",
        attachments=payload.attachments or [],
    )

    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


@router.put("/{visit_id}", response_model=ClientVisitOut)
def update_client_visit(
    visit_id: str,
    payload: ClientVisitUpdate,
    db: Session = Depends(get_db),
):
    visit = db.query(ClientVisit).filter(ClientVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client visit '{visit_id}' not found",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if field == "status" and val:
            val = val.upper()
        setattr(visit, field, val)

    visit.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(visit)
    return visit


@router.patch("/{visit_id}/status", response_model=ClientVisitOut)
def patch_client_visit_status(
    visit_id: str,
    patch_in: ClientVisitStatusPatch,
    db: Session = Depends(get_db),
):
    visit = db.query(ClientVisit).filter(ClientVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client visit '{visit_id}' not found",
        )

    visit.status = patch_in.status.upper()
    if patch_in.actual_check_in:
        visit.actual_check_in = patch_in.actual_check_in
    if patch_in.actual_check_out:
        visit.actual_check_out = patch_in.actual_check_out
    if patch_in.discussion_notes:
        visit.discussion_notes = patch_in.discussion_notes
    if patch_in.sentiment_outcome:
        visit.sentiment_outcome = patch_in.sentiment_outcome

    visit.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(visit)
    return visit


@router.delete("/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client_visit(visit_id: str, db: Session = Depends(get_db)):
    visit = db.query(ClientVisit).filter(ClientVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client visit '{visit_id}' not found",
        )

    db.delete(visit)
    db.commit()
    return None
