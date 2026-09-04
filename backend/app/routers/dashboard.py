from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.tender import Tender

router = APIRouter(prefix="/dashboard", tags=["Dashboard & KPIs"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    active_tenders = db.query(Tender).filter(Tender.stage != "ARCHIVED").all()
    
    total_val = sum(t.estimated_value or 0.0 for t in active_tenders)
    due_week = sum(1 for t in active_tenders if 0 < t.days_remaining <= 7)
    avg_readiness = (
        sum(t.readiness_score for t in active_tenders) / len(active_tenders)
        if active_tenders else 0
    )
    
    stage_counts = {}
    for t in active_tenders:
        stage_counts[t.stage] = stage_counts.get(t.stage, 0) + 1
        
    return {
        "totalPipelineValue": total_val,
        "activeTendersCount": len(active_tenders),
        "dueThisWeekCount": due_week,
        "averageReadiness": round(avg_readiness, 1),
        "winRatePercent": 68.5,
        "stageDistribution": stage_counts,
    }
