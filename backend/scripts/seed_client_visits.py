"""
Seed script for Client Visitors & Meeting Hub.
Seeds realistic client visits across major public sector, multilateral, and private organizations.
"""

import sys
import os
from datetime import datetime, timezone

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.models.client_visit import ClientVisit

DEMO_VISITS = [
    {
        "id": "VISIT-2026-101",
        "title": "Pre-Bid Clarification & Technical Scope Alignment",
        "client_organization": "Roads and Highways Department (RHD)",
        "tender_id": "TDR-2026-001",
        "visitor_name": "Engr. Rafiqul Islam",
        "visitor_designation": "Superintending Engineer (Procurement)",
        "visitor_phone": "+880 1711 234567",
        "visitor_email": "rafiqul.islam@rhd.gov.bd",
        "accompanying_persons": ["Md. Zahirul Haque (Executive Engineer)", "Farhana Ahmed (Sub-Divisional Engineer)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "IN_PERSON_OFFICE",
        "status": "COMPLETED",
        "scheduled_start": "2026-09-15T10:00:00",
        "scheduled_end": "2026-09-15T12:00:00",
        "actual_check_in": "2026-09-15T09:55:00",
        "actual_check_out": "2026-09-15T12:15:00",
        "location_or_room": "Boardroom Alpha (Level 6)",
        "meeting_link": None,
        "agenda": "1. Review ITS subsystem specs\n2. Clarify CCTV installation milestones\n3. Advance guarantee timeline",
        "discussion_notes": "Client requested detailed fiber backbone deployment breakdown in SOW response. Satisfied with our team's local presence.",
        "action_items": [
            {"task": "Update Annexure C with revised fiber diagram", "owner": "Tariqul", "done": True},
            {"task": "Prepare formal addendum clarification query", "owner": "Sarah", "done": True}
        ],
        "sentiment_outcome": "POSITIVE",
    },
    {
        "id": "VISIT-2026-102",
        "title": "Global Infrastructure Security & Multi-Cloud Migration Review",
        "client_organization": "United Nations Development Programme (UNDP)",
        "tender_id": "TDR-2026-002",
        "visitor_name": "Marcus Lindqvist",
        "visitor_designation": "Regional IT Procurement Lead",
        "visitor_phone": "+46 70 123 4567",
        "visitor_email": "marcus.lindqvist@undp.org",
        "accompanying_persons": ["Tanvir Hossain (National Procurement Specialist)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "VIRTUAL_CONFERENCE",
        "status": "COMPLETED",
        "scheduled_start": "2026-09-22T14:30:00",
        "scheduled_end": "2026-09-22T16:00:00",
        "actual_check_in": "2026-09-22T14:30:00",
        "actual_check_out": "2026-09-22T15:50:00",
        "location_or_room": "Virtual Bridge 2",
        "meeting_link": "https://teams.microsoft.com/l/meetup-join/undp-procurement-session",
        "agenda": "Data residency, ISO 27001 compliance, and disaster recovery SLA validation.",
        "discussion_notes": "UNDP validated SOC-2 Type II attestation. Requested dual-region active-passive replication architecture in tech proposal.",
        "action_items": [
            {"task": "Attach ISO 27001 & SOC-2 compliance certificates to vault", "owner": "Tanvir", "done": True}
        ],
        "sentiment_outcome": "POSITIVE",
    },
    {
        "id": "VISIT-2026-103",
        "title": "Commercial Terms & Mobilization Advance Guarantee Negotiation",
        "client_organization": "Dhaka Mass Transit Company Limited (DMTCL)",
        "tender_id": "TDR-2026-003",
        "visitor_name": "Md. Kamrul Hassan",
        "visitor_designation": "General Manager (Finance & Accounts)",
        "visitor_phone": "+880 1819 876543",
        "visitor_email": "kamrul.hassan@dmtcl.gov.bd",
        "accompanying_persons": ["Sultana Razia (Senior Accounts Officer)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "IN_PERSON_OFFICE",
        "status": "COMPLETED",
        "scheduled_start": "2026-10-02T11:00:00",
        "scheduled_end": "2026-10-02T12:30:00",
        "actual_check_in": "2026-10-02T11:05:00",
        "actual_check_out": "2026-10-02T12:45:00",
        "location_or_room": "Executive Briefing Center",
        "meeting_link": None,
        "agenda": "Mobilization advance payment schedule, bank guarantee verification, foreign exchange fluctuation hedge mechanism.",
        "discussion_notes": "Agreed on 15% mobilization against unconditional bank guarantee from scheduled tier-1 bank.",
        "action_items": [
            {"task": "Request bank guarantee draft from Prime Bank Treasury", "owner": "Sarah", "done": True}
        ],
        "sentiment_outcome": "POSITIVE",
    },
    {
        "id": "VISIT-2026-104",
        "title": "On-Site Technical Demonstration: AI Automated Document Ingestion",
        "client_organization": "UNDP Bangladesh",
        "tender_id": "TDR-2026-004",
        "visitor_name": "Syeda Nusrat Jahan",
        "visitor_designation": "Senior Programme Officer (Digital Governance)",
        "visitor_phone": "+880 1713 998877",
        "visitor_email": "nusrat.jahan@undp.org",
        "accompanying_persons": ["Arifur Rahman (Digital Solutions Consultant)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "IN_PERSON_OFFICE",
        "status": "CONFIRMED",
        "scheduled_start": "2026-11-05T10:00:00",
        "scheduled_end": "2026-11-05T12:00:00",
        "actual_check_in": None,
        "actual_check_out": None,
        "location_or_room": "Innovation Lab (Room 304)",
        "meeting_link": None,
        "agenda": "Live demonstration of OCR accuracy on historical Bengali documents and tender record parsing.",
        "discussion_notes": "Live test with 50 sample scanned files scheduled.",
        "action_items": [
            {"task": "Prepare demo environment with sample Bengali gazettes", "owner": "Tanvir", "done": False}
        ],
        "sentiment_outcome": "POSITIVE",
    },
    {
        "id": "VISIT-2026-105",
        "title": "Pre-Bid Site Survey & Command Center Facility Inspection",
        "client_organization": "Bangladesh Railway (BR)",
        "tender_id": "TDR-2026-005",
        "visitor_name": "Engr. Manzurul Karim",
        "visitor_designation": "Chief Signal & Telecommunication Engineer",
        "visitor_phone": "+880 1712 345678",
        "visitor_email": "cste.telecom@railway.gov.bd",
        "accompanying_persons": ["Zillur Rahman (Deputy Director, Signalling)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "CLIENT_SITE_VISIT",
        "status": "CONFIRMED",
        "scheduled_start": "2026-11-08T09:30:00",
        "scheduled_end": "2026-11-08T13:00:00",
        "actual_check_in": None,
        "actual_check_out": None,
        "location_or_room": "Kamalapur Central Signaling Office",
        "meeting_link": None,
        "agenda": "Physical survey of trackside cabling conduits and control center server racks.",
        "discussion_notes": "Safety clearances and PPE required for trackside inspection.",
        "action_items": [
            {"task": "Arrange safety gear and vehicle logistics", "owner": "Sarah", "done": False}
        ],
        "sentiment_outcome": "POSITIVE",
    },
    {
        "id": "VISIT-2026-106",
        "title": "Courtesy Call & Bilateral Procurement Pipeline Briefing",
        "client_organization": "Asian Development Bank (ADB)",
        "tender_id": None,
        "visitor_name": "Hiroshi Tanaka",
        "visitor_designation": "Principal Procurement Specialist (South Asia)",
        "visitor_phone": "+63 2 8632 4444",
        "visitor_email": "htanaka@adb.org",
        "accompanying_persons": ["Rezwanul Karim (Senior Country Officer)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "COURTESY_CALL",
        "status": "SCHEDULED",
        "scheduled_start": "2026-11-12T15:00:00",
        "scheduled_end": "2026-11-12T16:00:00",
        "actual_check_in": None,
        "actual_check_out": None,
        "location_or_room": "Boardroom Alpha (Level 6)",
        "meeting_link": None,
        "agenda": "High-level overview of our consortium credentials for upcoming Q1 2027 regional transport modernization bids.",
        "discussion_notes": "ADB standard bidding document alignment discussion.",
        "action_items": [
            {"task": "Prepare ADB-tailored credentials booklet", "owner": "Sarah", "done": False}
        ],
        "sentiment_outcome": "POSITIVE",
    },
    {
        "id": "VISIT-2026-107",
        "title": "Pre-Proposal Clarification on CMS Core Architecture",
        "client_organization": "Dhaka Customs Agents Association (DACAB)",
        "tender_id": "TDR-2026-006",
        "visitor_name": "Alhaj Md. Mofizur Rahman",
        "visitor_designation": "General Secretary",
        "visitor_phone": "+880 1711 556677",
        "visitor_email": "mofizur.rahman@dacab.com.bd",
        "accompanying_persons": ["Sheikh Farid (Vice President, IT Affairs)"],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Head of Strategic Bids",
        "visit_type": "COMMERCIAL_NEGOTIATION",
        "status": "SCHEDULED",
        "scheduled_start": "2026-11-15T11:30:00",
        "scheduled_end": "2026-11-15T13:00:00",
        "actual_check_in": None,
        "actual_check_out": None,
        "location_or_room": "Conference Room Gamma",
        "meeting_link": None,
        "agenda": "ASIC-compatible clearing house integration and member subscription licensing terms.",
        "discussion_notes": "Negotiation on annual maintenance contract (AMC) fee ceiling.",
        "action_items": [
            {"task": "Draft SLA tier matrix with 99.9% uptime commitment", "owner": "Tariqul", "done": False}
        ],
        "sentiment_outcome": "POSITIVE",
    }
]


def seed_visits():
    db = SessionLocal()
    try:
        count = 0
        for data in DEMO_VISITS:
            existing = db.query(ClientVisit).filter(ClientVisit.id == data["id"]).first()
            if not existing:
                visit = ClientVisit(**data)
                db.add(visit)
                count += 1
            else:
                for k, v in data.items():
                    setattr(existing, k, v)
        db.commit()
        print(f"Successfully processed {len(DEMO_VISITS)} client visits ({count} newly inserted).")
    except Exception as e:
        db.rollback()
        print(f"Error seeding visits: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_visits()
