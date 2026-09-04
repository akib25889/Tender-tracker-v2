from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.comment import TenderComment
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(prefix="/comments", tags=["Chat & Discussions"])

@router.get("", response_model=List[CommentOut])
def get_comments(
    channel_id: Optional[str] = None,
    tender_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TenderComment)
    if tender_id:
        query = query.filter(TenderComment.tender_id == tender_id)
    elif channel_id:
        query = query.filter(TenderComment.channel_id == channel_id)
    return query.order_by(TenderComment.created_at.asc()).all()

@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def post_comment(comment_in: CommentCreate, db: Session = Depends(get_db)):
    comment_id = f"CMT-{db.query(TenderComment).count() + 101}"
    db_comment = TenderComment(
        id=comment_id,
        tender_id=comment_in.tender_id,
        channel_id=comment_in.channel_id or "general-ops",
        author_name=comment_in.author_name,
        author_role=comment_in.author_role,
        author_avatar=comment_in.author_avatar,
        content=comment_in.content,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    comment = db.query(TenderComment).filter(TenderComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return None
