"""
Real-Time Operational Alert Center
Synthesizes live alerts from the database:
  - Critical deadlines (≤48h)
  - Requirement blockers (status=BLOCKER)
  - Pending Tier 3/4 executive sign-offs
  - Expired resource share links
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender
from app.models.requirement import TenderRequirement
from app.models.permission import ResourceShare

router = APIRouter(prefix="/alerts", tags=["Operational Alerts"])


@router.get("")
def get_alerts(db: Session = Depends(get_db)):
    alerts = []
    now = datetime.now(timezone.utc)

    # ── 1. Critical Deadlines (≤48 hours remaining, active tenders) ──────────
    active_tenders = (
        db.query(Tender)
        .filter(Tender.stage.notin_(["ARCHIVED", "SUBMITTED", "AWARDED", "LOST"]))
        .all()
    )

    for t in active_tenders:
        hours = t.hours_remaining or 0
        if 0 < hours <= 48:
            severity = "CRITICAL" if hours <= 24 else "WARNING"
            alerts.append(
                {
                    "id": f"ALERT-DL-{t.id}",
                    "category": "DEADLINE",
                    "severity": severity,
                    "title": f"{'CRITICAL: ' if severity == 'CRITICAL' else ''}Deadline in {hours}h — {t.id}",
                    "description": (
                        f"Submission window for '{t.title}' closes in {hours} hours. "
                        f"Authority: {t.organization}."
                    ),
                    "tender_id": t.id,
                    "tender_title": t.title,
                    "hours_remaining": hours,
                    "read": False,
                }
            )

    # ── 2. Active Requirement Blockers ────────────────────────────────────────
    blockers = (
        db.query(TenderRequirement).filter(TenderRequirement.status == "BLOCKER").all()
    )
    for req in blockers:
        tender = db.query(Tender).filter(Tender.id == req.tender_id).first()
        if tender and tender.stage not in ("ARCHIVED", "SUBMITTED", "AWARDED", "LOST"):
            alerts.append(
                {
                    "id": f"ALERT-BLK-{req.id}",
                    "category": "BLOCKER",
                    "severity": "WARNING",
                    "title": f"Blocker Flagged: {req.title}",
                    "description": (
                        f"Requirement '{req.title}' is blocking {tender.id} — {tender.title}. "
                        f"Owner: {req.owner or 'Unassigned'}."
                    ),
                    "tender_id": tender.id,
                    "tender_title": tender.title,
                    "hours_remaining": None,
                    "read": False,
                }
            )

    # ── 3. Expired Resource Share Links (not yet revoked) ────────────────────
    expired_shares = (
        db.query(ResourceShare)
        .filter(
            ResourceShare.revoked_at.is_(None),
            ResourceShare.expires_at.isnot(None),
        )
        .all()
    )
    for share in expired_shares:
        exp = share.expires_at
        if exp and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp and exp < now:
            alerts.append(
                {
                    "id": f"ALERT-SHARE-{share.id}",
                    "category": "VAULT",
                    "severity": "INFO",
                    "title": "Expired Share Link Detected",
                    "description": (
                        f"Partner share token '{share.token}' for resource "
                        f"'{share.resource_id}' expired on "
                        f"{share.expires_at.strftime('%d %b %Y, %H:%M')} UTC and "
                        f"has not been revoked."
                    ),
                    "tender_id": share.tender_id or "",
                    "tender_title": "",
                    "hours_remaining": None,
                    "read": False,
                }
            )

    # ── 5. Tender Document Opening & Schedule Purchase Reminders (Req #17 & #20) ─
    def _parse_date(d_str):
        if not d_str:
            return None
        clean = d_str.strip().split("T")[0]
        for fmt in ("%Y-%m-%d", "%d %B %Y", "%d-%m-%Y", "%d/%m/%Y", "%B %d, %Y"):
            try:
                return datetime.strptime(clean, fmt).date()
            except Exception:
                continue
        return None

    all_active_tenders = (
        db.query(Tender).filter(Tender.stage.notin_(["ARCHIVED", "LOST"])).all()
    )
    today = datetime.now().date()

    for t in all_active_tenders:
        # Opening Day reminders (1 day before & on that day)
        op_date = _parse_date(t.opening_date)
        if op_date:
            diff_days = (op_date - today).days
            if diff_days == 0:
                alerts.append(
                    {
                        "id": f"ALERT-OPN-TODAY-{t.id}",
                        "category": "OPENING_REMINDER",
                        "severity": "CRITICAL",
                        "title": f"Tender Document Opening TODAY — {t.id}",
                        "description": (
                            f"Official tender opening session for '{t.title}' is taking place TODAY ({op_date.strftime('%d %b %Y')}). "
                            f"Authority: {t.organization}."
                        ),
                        "tender_id": t.id,
                        "tender_title": t.title,
                        "hours_remaining": 0,
                        "read": False,
                    }
                )
            elif diff_days == 1:
                alerts.append(
                    {
                        "id": f"ALERT-OPN-TOMORROW-{t.id}",
                        "category": "OPENING_REMINDER",
                        "severity": "WARNING",
                        "title": f"Tender Opening Tomorrow (T-1) — {t.id}",
                        "description": (
                            f"Official tender document opening for '{t.title}' is scheduled for tomorrow ({op_date.strftime('%d %b %Y')}). "
                            f"Verify final bid envelope submission before opening cutoff."
                        ),
                        "tender_id": t.id,
                        "tender_title": t.title,
                        "hours_remaining": 24,
                        "read": False,
                    }
                )

        # Schedule Purchase Deadline reminder (1 day before & day of)
        sch_date = _parse_date(t.schedule_purchase_deadline)
        if sch_date and t.stage not in ("SUBMITTED", "AWARDED"):
            diff_sch = (sch_date - today).days
            if diff_sch == 0:
                alerts.append(
                    {
                        "id": f"ALERT-SCH-TODAY-{t.id}",
                        "category": "DEADLINE",
                        "severity": "CRITICAL",
                        "title": f"Schedule Purchase Closes TODAY — {t.id}",
                        "description": (
                            f"Tender schedule / form purchase window for '{t.title}' closes TODAY. "
                            f"Method: {t.schedule_purchase_method or 'Online e-GP'}."
                        ),
                        "tender_id": t.id,
                        "tender_title": t.title,
                        "hours_remaining": 0,
                        "read": False,
                    }
                )
            elif diff_sch == 1:
                alerts.append(
                    {
                        "id": f"ALERT-SCH-TOMORROW-{t.id}",
                        "category": "DEADLINE",
                        "severity": "WARNING",
                        "title": f"Schedule Purchase Closes Tomorrow — {t.id}",
                        "description": (
                            f"Last day to buy tender schedule / RFP document for '{t.title}'. Deadline: tomorrow."
                        ),
                        "tender_id": t.id,
                        "tender_title": t.title,
                        "hours_remaining": 24,
                        "read": False,
                    }
                )

    # Sort: CRITICAL first, then WARNING, then INFO; within same severity by hours_remaining asc
    severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
    alerts.sort(
        key=lambda a: (
            severity_order.get(a["severity"], 9),
            a["hours_remaining"] if a["hours_remaining"] is not None else 9999,
        )
    )

    return {
        "count": len(alerts),
        "unread": sum(1 for a in alerts if not a["read"]),
        "alerts": alerts,
    }
