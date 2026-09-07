import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender
from app.models.financial_rule import TenderFinancialRule
from app.schemas.financial_rule import (
    TenderFinancialRuleCreate,
    TenderFinancialRuleUpdate,
    TenderFinancialRuleOut,
)

router = APIRouter(tags=["Tender Financial Scenarios & Rules"])


@router.get(
    "/api/tenders/{tender_id}/financial-rules",
    response_model=List[TenderFinancialRuleOut],
)
def list_financial_rules(
    tender_id: str,
    rule_category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    q = db.query(TenderFinancialRule).filter(TenderFinancialRule.tender_id == tender_id)
    if rule_category:
        q = q.filter(TenderFinancialRule.rule_category == rule_category)
    return q.order_by(TenderFinancialRule.created_at.asc()).all()


@router.post(
    "/api/tenders/{tender_id}/financial-rules",
    response_model=TenderFinancialRuleOut,
    status_code=status.HTTP_201_CREATED,
)
def create_financial_rule(
    tender_id: str,
    rule_in: TenderFinancialRuleCreate,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    rule_id = rule_in.id or f"FIN-{uuid.uuid4().hex[:8].upper()}"
    rule_data = rule_in.model_dump(exclude={"id"})
    rule_data["tender_id"] = tender_id

    db_rule = TenderFinancialRule(id=rule_id, **rule_data)
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.get(
    "/api/financial-rules/{rule_id}",
    response_model=TenderFinancialRuleOut,
)
def get_financial_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = (
        db.query(TenderFinancialRule)
        .filter(TenderFinancialRule.id == rule_id)
        .first()
    )
    if not rule:
        raise HTTPException(status_code=404, detail="Financial rule not found")
    return rule


@router.put(
    "/api/financial-rules/{rule_id}",
    response_model=TenderFinancialRuleOut,
)
def update_financial_rule(
    rule_id: str,
    updates: TenderFinancialRuleUpdate,
    db: Session = Depends(get_db),
):
    rule = (
        db.query(TenderFinancialRule)
        .filter(TenderFinancialRule.id == rule_id)
        .first()
    )
    if not rule:
        raise HTTPException(status_code=404, detail="Financial rule not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rule, field, value)

    db.commit()
    db.refresh(rule)
    return rule


@router.delete(
    "/api/financial-rules/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_financial_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = (
        db.query(TenderFinancialRule)
        .filter(TenderFinancialRule.id == rule_id)
        .first()
    )
    if not rule:
        raise HTTPException(status_code=404, detail="Financial rule not found")

    db.delete(rule)
    db.commit()
    return None


@router.put("/api/tenders/{tender_id}/financial-model")
def update_tender_financial_model(
    tender_id: str,
    model_data: Dict[str, Any],
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    if "financial_model" in model_data and isinstance(model_data["financial_model"], dict):
        tender.financial_model = model_data["financial_model"]
    else:
        tender.financial_model = model_data
    db.commit()
    db.refresh(tender)
    return {"status": "success", "financial_model": tender.financial_model}


@router.get("/api/tenders/{tender_id}/financial-model")
def get_tender_financial_model(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender.financial_model or {}
