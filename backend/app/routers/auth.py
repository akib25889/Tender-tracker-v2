from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserLogin, Token, UserProfile, UserCreate

router = APIRouter(prefix="/auth", tags=["Authentication & Team"])


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    clean_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user and clean_email.endswith("@tendertracker.io"):
        alt_email = clean_email.replace("@tendertracker.io", "@tendertracker.org")
        user = db.query(User).filter(User.email.ilike(alt_email)).first()
    elif not user and clean_email.endswith("@tendertracker.org"):
        alt_email = clean_email.replace("@tendertracker.org", "@tendertracker.io")
        user = db.query(User).filter(User.email.ilike(alt_email)).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/team", response_model=List[UserProfile])
def get_team_members(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post("/team", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def create_team_member(member: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == member.email).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    count = db.query(User).count()
    user_id = f"USR-0{count + 1}"

    db_user = User(
        id=user_id,
        name=member.name,
        email=member.email,
        hashed_password=get_password_hash(member.password),
        role=member.role,
        title=member.title,
        department=member.department,
        max_capacity=member.max_capacity,
        avatar=member.avatar or member.name[:2].upper(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
