from datetime import datetime, timezone
from typing import Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.setting import SystemSetting
from app.schemas.setting import SettingsPayload

router = APIRouter(prefix="/settings", tags=["System Settings"])


@router.get("", response_model=Dict[str, str])
def get_all_settings(db: Session = Depends(get_db)):
    rows = db.query(SystemSetting).all()
    return {row.key: row.value for row in rows}


@router.post("", response_model=Dict[str, str], status_code=status.HTTP_200_OK)
def update_settings(payload: Dict[str, str], db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    for key, val in payload.items():
        clean_key = key.strip()
        if not clean_key:
            continue
        category = "GENERAL"
        if "vault" in clean_key or "path" in clean_key:
            category = "STORAGE"
        elif "alert" in clean_key or "sla" in clean_key:
            category = "ALERTS"
        elif "smtp" in clean_key or "email" in clean_key or "notify" in clean_key:
            category = "SMTP"

        existing = db.query(SystemSetting).filter(SystemSetting.key == clean_key).first()
        if existing:
            existing.value = str(val)
            existing.category = category
            existing.updated_at = now
        else:
            db.add(
                SystemSetting(
                    key=clean_key,
                    value=str(val),
                    category=category,
                    updated_at=now,
                )
            )

    db.commit()
    rows = db.query(SystemSetting).all()
    return {row.key: row.value for row in rows}
