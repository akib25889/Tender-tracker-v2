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
        asg for asg in (user.past_assignments or [])
        if asg.get("id") != assignment_id
    ]
    user.past_assignments = assignments

    db.commit()
    db.refresh(user)
    return user
