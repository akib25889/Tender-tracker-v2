import sys
import json
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.core.database import engine

ARCHIVED_DEMO_TENDERS = [
    {
        "id": "TDR-2026-ARC-01",
        "reference_no": "DWASA/eGP/2026/918234",
        "title": "Smart Ultrasonic Water Metering & Automated Billing Infrastructure",
        "organization": "Dhaka Water Supply and Sewerage Authority (DWASA)",
        "country": "Bangladesh",
        "category": "Smart Infrastructure & IoT",
        "estimated_value": 42000000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 42000000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "UNDER_ANALYSIS",
        "decision": "NO_GO",
        "priority": "HIGH",
        "submission_deadline": "2026-05-18T14:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 42,
        "lead_owner_name": "Farhan Ahmed",
        "lead_owner_role": "Bid Manager",
        "tender_type": "OTM",
        "budget_type": "Revenue",
        "source_of_fund": "GOB Development Fund",
        "procurement_method": "Open Tendering Method (OTM)",
        "created_at": "2026-03-10T10:00:00+06:00",
        "updated_at": "2026-04-12T16:30:00+06:00",
        "summary": {
            "tenderIdDisplay": "DWASA-SM-2026-01",
            "portal": "e-GP (eprocure.gov.bd)",
            "tenderType": "OTM",
            "nonParticipationReason": "Turnover threshold (150M BDT over 3 years) exceeded balance sheet limits; negotiations with shortlisted hardware vendor failed over warranty bank guarantee.",
            "qualificationStatus": "Disqualified on turnover clause",
            "biddingCostPreserved": 630000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "DataCore Systems Ltd",
                "proposedShare": "60% / 40%"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-02",
        "reference_no": "CPA/IT/AI-OCR/2026/894102",
        "title": "AI-Powered Automated Container Inspection & Terminal Optical Character Recognition (OCR)",
        "organization": "Chattogram Port Authority (CPA)",
        "country": "Bangladesh",
        "category": "Software & Artificial Intelligence",
        "estimated_value": 65000000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 65000000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "SCREENING",
        "decision": "NO_GO",
        "priority": "CRITICAL",
        "submission_deadline": "2026-06-05T12:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 38,
        "lead_owner_name": "Tahmid Rahman",
        "lead_owner_role": "Principal Solutions Architect",
        "tender_type": "RFP",
        "budget_type": "Capital Project",
        "source_of_fund": "CPA Port Modernization Fund",
        "procurement_method": "Request for Proposals (RFP)",
        "created_at": "2026-03-20T11:30:00+06:00",
        "updated_at": "2026-04-18T14:00:00+06:00",
        "summary": {
            "tenderIdDisplay": "CPA-AI-OCR-2026",
            "portal": "e-GP (eprocure.gov.bd)",
            "tenderType": "RFP",
            "nonParticipationReason": "Proprietary gantry crane interface SDK restricted to incumbent foreign provider; uncapped 0.5% daily delay penalty created excessive commercial risk.",
            "qualificationStatus": "Rejected at Gate 2 (Commercial Risk Filter)",
            "biddingCostPreserved": 975000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "NYK Advance Ltd"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-03",
        "reference_no": "BTRC/ENG-SM/2026/044",
        "title": "National Spectrum Monitoring System (SMS) High-Altitude RF Sensors & Analytics",
        "organization": "Bangladesh Telecommunication Regulatory Commission (BTRC)",
        "country": "Bangladesh",
        "category": "Telecommunications & Network Infrastructure",
        "estimated_value": 88000000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 88000000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "PREPARATION",
        "decision": "NO_GO",
        "priority": "HIGH",
        "submission_deadline": "2026-04-22T15:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 55,
        "lead_owner_name": "Farhan Ahmed",
        "lead_owner_role": "Bid Director",
        "tender_type": "EOI",
        "budget_type": "Development",
        "source_of_fund": "BTRC Spectrum Management Fund",
        "procurement_method": "Expression of Interest (EOI)",
        "created_at": "2026-02-15T09:00:00+06:00",
        "updated_at": "2026-04-20T17:00:00+06:00",
        "summary": {
            "tenderIdDisplay": "BTRC-SMS-2026",
            "portal": "Direct / Agency Portal",
            "tenderType": "EOI",
            "nonParticipationReason": "Foreign sensor OEM signed exclusivity with competing consortium 48 hours prior to bid submission; unable to source compliant alternative hardware.",
            "qualificationStatus": "Withdrawn from Gate 4 (Preparation)",
            "biddingCostPreserved": 1320000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "CyberShield Defense Solutions Ltd"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-04",
        "reference_no": "BRAC-HQ/IT-PROC/2026-119",
        "title": "Disaster-Resilient Cloud ERP for Nationwide Field Operations & Microfinance",
        "organization": "BRAC",
        "country": "Bangladesh",
        "category": "Enterprise ERP & Business Automation",
        "estimated_value": 35000000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 35000000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "DISCOVERED",
        "decision": "NO_GO",
        "priority": "MEDIUM",
        "submission_deadline": "2026-03-30T17:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 30,
        "lead_owner_name": "Sadia Islam",
        "lead_owner_role": "Enterprise Solutions Lead",
        "tender_type": "RFP",
        "budget_type": "Corporate",
        "source_of_fund": "BRAC Social Development Fund",
        "procurement_method": "Request for Proposals (RFP)",
        "created_at": "2026-02-01T10:00:00+06:00",
        "updated_at": "2026-03-25T11:00:00+06:00",
        "summary": {
            "tenderIdDisplay": "BRAC-ERP-2026-119",
            "portal": "BRAC / Corporate",
            "tenderType": "RFP",
            "nonParticipationReason": "Mandatory requirement for 100% on-premise Tier-IV redundant hosting in northern districts; incompatible with client hybrid multi-tenant cloud roadmap.",
            "qualificationStatus": "Disqualified during Gate 1 Discovery triage",
            "biddingCostPreserved": 525000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-05",
        "reference_no": "UNHCR-BGD-2026-RFP-0082",
        "title": "Biometric Registration & Camp Management Mobile Telemetry System (Cox's Bazar)",
        "organization": "United Nations High Commissioner for Refugees (UNHCR)",
        "country": "Bangladesh",
        "category": "Health Informatics & Telemedicine",
        "estimated_value": 280000.0,
        "currency": "USD",
        "exchange_rate_to_bdt": 121.5,
        "estimated_value_bdt": 34020000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "UNDER_ANALYSIS",
        "decision": "NO_GO",
        "priority": "HIGH",
        "submission_deadline": "2026-05-12T16:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 46,
        "lead_owner_name": "Tahmid Rahman",
        "lead_owner_role": "Humanitarian Tech Lead",
        "tender_type": "RFP",
        "budget_type": "Donor Grant",
        "source_of_fund": "UNHCR Emergency Response Fund",
        "procurement_method": "International Competitive Bidding",
        "created_at": "2026-03-25T14:00:00+06:00",
        "updated_at": "2026-04-28T15:30:00+06:00",
        "summary": {
            "tenderIdDisplay": "UNHCR-BIO-2026",
            "portal": "UNGM / UN Agencies",
            "tenderType": "RFP",
            "nonParticipationReason": "Mandatory security and counter-terror clearance protocol for international software deployments could not be issued within the 14-day window.",
            "qualificationStatus": "No-Go on SLA & Compliance Timelines",
            "biddingCostPreserved": 510000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "Meghna Data Infrastructure"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-06",
        "reference_no": "BPDB/SCADA-SYS/2026/782109",
        "title": "Supervisory Control and Data Acquisition (SCADA) Gateway Modernization Phase-II",
        "organization": "Bangladesh Power Development Board (BPDB)",
        "country": "Bangladesh",
        "category": "Electrical & Power Distribution Systems",
        "estimated_value": 52500000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 52500000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "PREPARATION",
        "decision": "NO_GO",
        "priority": "HIGH",
        "submission_deadline": "2026-06-20T11:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 50,
        "lead_owner_name": "Farhan Ahmed",
        "lead_owner_role": "Industrial Automation Lead",
        "tender_type": "OTM",
        "budget_type": "Capital Project",
        "source_of_fund": "JICA Power Sector Loan",
        "procurement_method": "Open Tendering Method (OTM)",
        "created_at": "2026-04-05T09:30:00+06:00",
        "updated_at": "2026-05-15T18:00:00+06:00",
        "summary": {
            "tenderIdDisplay": "BPDB-SCADA-02",
            "portal": "e-GP (eprocure.gov.bd)",
            "tenderType": "OTM",
            "nonParticipationReason": "Sub-station automation hardware manufacturer Manufacturer Authorization Form (MAF) denied due to pre-existing exclusive channel partnership.",
            "qualificationStatus": "Withdrawn during Gate 4 Preparation",
            "biddingCostPreserved": 787500,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "DataCore Systems Ltd"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-07",
        "reference_no": "MOFA/ICT/AFIS/2026-03",
        "title": "Supply and Deployment of Automated Fingerprint Identification Systems (AFIS)",
        "organization": "Ministry of Foreign Affairs (MOFA)",
        "country": "Bangladesh",
        "category": "Cybersecurity & Digital Forensics",
        "estimated_value": 24000000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 24000000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "SCREENING",
        "decision": "NO_GO",
        "priority": "MEDIUM",
        "submission_deadline": "2026-02-15T14:30:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 35,
        "lead_owner_name": "Tahmid Rahman",
        "lead_owner_role": "Security Bid Lead",
        "tender_type": "OTM",
        "budget_type": "Revenue",
        "source_of_fund": "GOB Consular Modernization",
        "procurement_method": "Open Tendering Method (OTM)",
        "created_at": "2026-01-10T11:00:00+06:00",
        "updated_at": "2026-02-02T13:45:00+06:00",
        "summary": {
            "tenderIdDisplay": "MOFA-AFIS-2026",
            "portal": "Direct / Agency Portal",
            "tenderType": "OTM",
            "nonParticipationReason": "Severe liquidated damages liability combined with FBI CJIS-compliant hardware chip shortages under international export constraints.",
            "qualificationStatus": "Rejected at Gate 2 Screening",
            "biddingCostPreserved": 360000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "CyberShield Defense Solutions Ltd"
            }
        }
    },
    {
        "id": "TDR-2026-ARC-08",
        "reference_no": "BIWTA/VTM-RADAR/2026/665431",
        "title": "Vessel Traffic Management and Riverine Spatial Telemetry Network",
        "organization": "Bangladesh Inland Water Transport Authority (BIWTA)",
        "country": "Bangladesh",
        "category": "GIS & Spatial Telemetry",
        "estimated_value": 78000000.0,
        "currency": "BDT",
        "exchange_rate_to_bdt": 1.0,
        "estimated_value_bdt": 78000000.0,
        "stage": "ARCHIVED",
        "archived_from_stage": "DISCOVERED",
        "decision": "NO_GO",
        "priority": "HIGH",
        "submission_deadline": "2026-07-10T12:00:00+06:00",
        "days_remaining": 0,
        "hours_remaining": 0,
        "readiness_score": 28,
        "lead_owner_name": "Sadia Islam",
        "lead_owner_role": "Solutions Consultant",
        "tender_type": "Framework Agreement",
        "budget_type": "Capital Project",
        "source_of_fund": "World Bank Regional Waterway Project",
        "procurement_method": "Framework Agreement",
        "created_at": "2026-04-12T15:00:00+06:00",
        "updated_at": "2026-05-02T16:00:00+06:00",
        "summary": {
            "tenderIdDisplay": "BIWTA-RADAR-2026",
            "portal": "e-GP (eprocure.gov.bd)",
            "tenderType": "Framework Agreement",
            "nonParticipationReason": "Specialized dual-frequency sonar bathymetry survey vessel charter cost exceeded commercial profitability threshold.",
            "qualificationStatus": "No-Go at Gate 1 Discovery (Negative ROI)",
            "biddingCostPreserved": 1170000,
            "jv": {
                "leadMember": "PrimeTech Solutions Ltd",
                "localPartner": "NYK Advance Ltd"
            }
        }
    }
]

def seed_archived_tenders():
    STANDARD_FOLDERS = [
        ("tender-docs", "Tender Documents (ITB, BOQ, Specs)"),
        ("technical", "Technical Proposal & Architectures"),
        ("financial", "Financial Offer & Price Schedules"),
        ("credentials", "Company Experience & Audit Reports"),
        ("legal", "Tender Security & Bank Guarantees"),
        ("correspondence", "Addenda, Clarifications & Pre-Bid Notes"),
    ]

    with engine.begin() as conn:
        inserted_count = 0
        updated_count = 0

        for t in ARCHIVED_DEMO_TENDERS:
            tid = t["id"]
            summary_json = json.dumps(t["summary"])

            res = conn.execute(text("SELECT id FROM tenders WHERE id = :id"), {"id": tid}).fetchone()
            params = {
                "id": tid,
                "reference_no": t["reference_no"],
                "title": t["title"],
                "organization": t["organization"],
                "country": t["country"],
                "category": t["category"],
                "estimated_value": t["estimated_value"],
                "currency": t["currency"],
                "exchange_rate_to_bdt": t["exchange_rate_to_bdt"],
                "estimated_value_bdt": t["estimated_value_bdt"],
                "stage": t["stage"],
                "archived_from_stage": t["archived_from_stage"],
                "decision": t["decision"],
                "priority": t["priority"],
                "submission_deadline": t["submission_deadline"],
                "days_remaining": t["days_remaining"],
                "hours_remaining": t["hours_remaining"],
                "readiness_score": t["readiness_score"],
                "lead_owner_name": t["lead_owner_name"],
                "lead_owner_role": t["lead_owner_role"],
                "tender_type": t["tender_type"],
                "budget_type": t["budget_type"],
                "source_of_fund": t["source_of_fund"],
                "procurement_method": t["procurement_method"],
                "summary_json": summary_json,
                "created_at": t["created_at"],
                "updated_at": t["updated_at"],
            }

            if res:
                conn.execute(text("""
                    UPDATE tenders SET
                        reference_no = :reference_no,
                        title = :title,
                        organization = :organization,
                        country = :country,
                        category = :category,
                        estimated_value = :estimated_value,
                        currency = :currency,
                        exchange_rate_to_bdt = :exchange_rate_to_bdt,
                        estimated_value_bdt = :estimated_value_bdt,
                        stage = :stage,
                        archived_from_stage = :archived_from_stage,
                        decision = :decision,
                        priority = :priority,
                        submission_deadline = :submission_deadline,
                        days_remaining = :days_remaining,
                        hours_remaining = :hours_remaining,
                        readiness_score = :readiness_score,
                        lead_owner_name = :lead_owner_name,
                        lead_owner_role = :lead_owner_role,
                        tender_type = :tender_type,
                        budget_type = :budget_type,
                        source_of_fund = :source_of_fund,
                        procurement_method = :procurement_method,
                        summary_json = :summary_json,
                        updated_at = :updated_at
                    WHERE id = :id
                """), params)
                updated_count += 1
            else:
                conn.execute(text("""
                    INSERT INTO tenders (
                        id, reference_no, title, organization, country, category,
                        estimated_value, currency, exchange_rate_to_bdt, estimated_value_bdt,
                        stage, archived_from_stage, decision, priority,
                        submission_deadline, days_remaining, hours_remaining,
                        readiness_score, lead_owner_name, lead_owner_role,
                        tender_type, budget_type, source_of_fund, procurement_method,
                        summary_json, created_at, updated_at
                    ) VALUES (
                        :id, :reference_no, :title, :organization, :country, :category,
                        :estimated_value, :currency, :exchange_rate_to_bdt, :estimated_value_bdt,
                        :stage, :archived_from_stage, :decision, :priority,
                        :submission_deadline, :days_remaining, :hours_remaining,
                        :readiness_score, :lead_owner_name, :lead_owner_role,
                        :tender_type, :budget_type, :source_of_fund, :procurement_method,
                        :summary_json, :created_at, :updated_at
                    )
                """), params)
                inserted_count += 1

            # Seed standard vault folders
            for folder_name, folder_label in STANDARD_FOLDERS:
                f_check = conn.execute(
                    text("SELECT id FROM tender_folders WHERE tender_id = :tid AND name = :name"),
                    {"tid": tid, "name": folder_name}
                ).fetchone()
                if not f_check:
                    conn.execute(
                        text("INSERT INTO tender_folders (tender_id, name, label) VALUES (:tid, :name, :label)"),
                        {"tid": tid, "name": folder_name, "label": folder_label}
                    )

            # Create physical directory in storage
            storage_dir = Path("storage/tenders") / tid
            storage_dir.mkdir(parents=True, exist_ok=True)
            for folder_name, _ in STANDARD_FOLDERS:
                (storage_dir / folder_name).mkdir(parents=True, exist_ok=True)

        total_archived = conn.execute(text("SELECT COUNT(*) FROM tenders WHERE stage = 'ARCHIVED'")).scalar()
        total_val_bdt = conn.execute(text("SELECT SUM(estimated_value_bdt) FROM tenders WHERE stage = 'ARCHIVED'")).scalar() or 0.0

    print(f"[OK] Seeded {inserted_count} new + {updated_count} updated archived tenders.")
    print(f"     Total Archived Records in DB: {total_archived}")
    print(f"     Total Retained Benchmark Value: {total_val_bdt:,.2f} BDT")

if __name__ == "__main__":
    seed_archived_tenders()

