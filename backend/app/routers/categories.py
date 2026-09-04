from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender, TenderCategory
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(TenderCategory).order_by(TenderCategory.name.asc()).all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    clean_name = payload.name.strip()
    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name cannot be empty.",
        )
    
    existing = db.query(TenderCategory).filter(TenderCategory.name.ilike(clean_name)).first()
    if existing:
        return existing

    category = TenderCategory(
        name=clean_name,
        description=payload.description,
        color_badge=payload.color_badge or "blue",
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    category = db.query(TenderCategory).filter(TenderCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found.",
        )

    old_name = category.name
    if payload.name is not None:
        clean_name = payload.name.strip()
        if not clean_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name cannot be empty.",
            )
        # Check uniqueness if name is changing
        if clean_name.lower() != old_name.lower():
            conflict = db.query(TenderCategory).filter(TenderCategory.name.ilike(clean_name)).first()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Category with name '{clean_name}' already exists.",
                )
        category.name = clean_name
        # Synchronize all tenders that reference the old name
        db.query(Tender).filter(Tender.category == old_name).update(
            {Tender.category: clean_name}, synchronize_session=False
        )

    if payload.description is not None:
        category.description = payload.description
    if payload.color_badge is not None:
        category.color_badge = payload.color_badge

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(TenderCategory).filter(TenderCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found.",
        )

    # Check if category is currently referenced by any tenders
    tenders_count = db.query(Tender).filter(Tender.category == category.name).count()
    if tenders_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{category.name}' because it is assigned to {tenders_count} tender(s). Reassign them first.",
        )

    db.delete(category)
    db.commit()
    return None
