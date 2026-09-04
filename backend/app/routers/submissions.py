from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender, TenderSubmission
from app.schemas.submission import SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/tenders", tags=["Tender Submissions"])


@router.get("/{tender_id}/submission", response_model=SubmissionOut)
def get_submission_proof(tender_id: str, db: Session = Depends(get_db)):
    sub = (
        db.query(TenderSubmission)
        .filter(TenderSubmission.tender_id == tender_id)
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No submission proof found for tender '{tender_id}'.",
        )
    return sub


@router.post(
    "/{tender_id}/submission",
    response_model=SubmissionOut,
    status_code=status.HTTP_201_CREATED,
)
def record_submission_proof(
    tender_id: str,
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender '{tender_id}' not found.",
        )

    now = datetime.now(timezone.utc)
    submission = (
        db.query(TenderSubmission)
        .filter(TenderSubmission.tender_id == tender_id)
        .first()
    )

    if submission:
        submission.portal_reference = payload.portal_reference
        submission.submitted_by = payload.submitted_by or "Sarah Jenkins"
        submission.submitted_at = now
        submission.receipt_sha256 = payload.receipt_sha256
        submission.receipt_path = payload.receipt_path
        submission.status = "SUBMITTED_LOCKED"
    else:
        submission = TenderSubmission(
            tender_id=tender_id,
            portal_reference=payload.portal_reference,
            submitted_by=payload.submitted_by or "Sarah Jenkins",
            submitted_at=now,
            receipt_sha256=payload.receipt_sha256,
            receipt_path=payload.receipt_path,
            status="SUBMITTED_LOCKED",
        )
        db.add(submission)

    # Automatically transition tender stage to SUBMITTED and readiness to 100%
    tender.stage = "SUBMITTED"
    tender.readiness_score = 100
    tender.updated_at = now

    db.commit()
    db.refresh(submission)
    return submission
