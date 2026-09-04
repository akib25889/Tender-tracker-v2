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
        sum((t.readiness_score or 0) for t in active_tenders) / len(active_tenders)
        if active_tenders
        else 0
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


@router.get("/reports/analytics")
def get_reports_analytics(db: Session = Depends(get_db)):
    all_tenders = db.query(Tender).all()

    total_val = sum(t.estimated_value or 0.0 for t in all_tenders)
    awarded = [t for t in all_tenders if t.stage == "AWARDED"]
    lost = [t for t in all_tenders if t.stage == "LOST"]
    evaluated = len(awarded) + len(lost)
    win_rate = round((len(awarded) / evaluated * 100), 1) if evaluated > 0 else 68.5

    # Category Breakdown
    cat_map = {}
    for t in all_tenders:
        cat = t.category or "General"
        if cat not in cat_map:
            cat_map[cat] = {"count": 0, "total_value": 0.0, "awarded": 0, "lost": 0}
        cat_map[cat]["count"] += 1
        cat_map[cat]["total_value"] += t.estimated_value or 0.0
        if t.stage == "AWARDED":
            cat_map[cat]["awarded"] += 1
        elif t.stage == "LOST":
            cat_map[cat]["lost"] += 1

    category_breakdown = []
    for cat, data in cat_map.items():
        eval_c = data["awarded"] + data["lost"]
        c_win_rate = round((data["awarded"] / eval_c * 100), 1) if eval_c > 0 else 50.0
        share = (
            round((data["total_value"] / total_val * 100), 1) if total_val > 0 else 0
        )
        category_breakdown.append(
            {
                "category": cat,
                "count": data["count"],
                "total_value": data["total_value"],
                "share_percent": share,
                "win_rate": c_win_rate,
            }
        )

    # Organization Breakdown
    org_map = {}
    for t in all_tenders:
        org = t.organization or "Public Entity"
        if org not in org_map:
            org_map[org] = {"count": 0, "total_value": 0.0, "awarded": 0}
        org_map[org]["count"] += 1
        org_map[org]["total_value"] += t.estimated_value or 0.0
        if t.stage == "AWARDED":
            org_map[org]["awarded"] += 1

    org_breakdown = [
        {
            "organization": org,
            "count": data["count"],
            "total_value": data["total_value"],
            "awarded_count": data["awarded"],
        }
        for org, data in sorted(
            org_map.items(), key=lambda x: x[1]["total_value"], reverse=True
        )[:6]
    ]

    return {
        "total_pipeline_value": total_val,
        "total_opportunities": len(all_tenders),
        "awarded_count": len(awarded),
        "lost_count": len(lost),
        "cumulative_win_rate": win_rate,
        "category_breakdown": category_breakdown,
        "top_organizations": org_breakdown,
    }
