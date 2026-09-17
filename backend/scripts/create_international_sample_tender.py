import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, Base, engine, run_migrations
from app.models.tender import Tender, TenderDecisionMatrix
from app.models.requirement import TenderRequirement
from app.models.task import TenderTask
from app.models.comment import TenderComment

TENDER_ID = "TDR-2026-UNPD-USA-002"


def create_international_dummy_tender():
    print("=" * 70)
    print("  Creating International Sample Tender: " + TENDER_ID)
    print("  Timezone: US Eastern Time (EDT, UTC-4)")
    print("=" * 70)

    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        run_migrations()

        # Check if already exists; if so, purge to allow clean re-population
        existing = db.query(Tender).filter(Tender.id == TENDER_ID).first()
        if existing:
            print("Purging existing instance of " + TENDER_ID)
            db.delete(existing)
            db.commit()

        # 1. Executive brief & summary JSON
        summary_payload = {
            "executive_brief": (
                "Turnkey modernization and multi-cloud migration of United Nations Secretariat global enterprise "
                "workloads, implementing zero-trust cyber security, FedRAMP High / SOC2 Type II compliance, and "
                "an AI-driven document intelligence and multilingual knowledge pipeline for worldwide field missions."
            ),
            "scope_of_work": [
                "Migration of 450+ on-premise VMs and microservices to hybrid Azure Government / AWS GovCloud architecture",
                "Deployment of FedRAMP High zero-trust IAM and continuous security event logging (SIEM/SOAR)",
                "Development of GenAI semantic search and automated multilingual document translation for 6 official UN languages",
                "36-month 24/7/365 follow-the-sun Site Reliability Engineering (SRE) and 99.99% multi-region uptime SLA",
            ],
            "key_qualifications": [
                "Minimum 10 years corporate existence providing enterprise cloud infrastructure to global NGOs or sovereign entities",
                "Successful delivery of at least 3 federal or multilateral enterprise cloud transformation contracts valued at $5M+ each",
                "Certified ISO 27001, ISO 27017, ISO 27018, SOC 2 Type II, and CMMI Level 5 accreditations",
                "Audited average annual revenue exceeding $20,000,000 USD across the preceding 3 fiscal years",
            ],
            "commercial_terms": (
                "Quality and Cost Based Selection (QCBS) 80:20 technical/commercial ratio. "
                "Governed under UN General Conditions of Contract (UNGCC). Milestone payments net 30 days upon formal delivery acceptance."
            ),
        }

        # 2. Key Clauses
        important_clauses = [
            {
                "id": "CLS-US-01",
                "clause_title": "Privileges and Immunities of the United Nations",
                "category": "LEGAL",
                "criticality": "CRITICAL",
                "doc_reference": "UNGCC Section 19 (Privileges and Immunities)",
                "doc_file_name": "UNPD_General_Conditions_Contracts_Services.pdf",
                "page_number": "14",
                "clause_text": (
                    "Nothing in or relating to the Contract shall be deemed a waiver, express or implied, of any of the "
                    "privileges and immunities of the United Nations, including its subsidiary organs and specialized agencies."
                ),
                "implication": "All disputes are resolved exclusively through UNCITRAL binding international arbitration rather than domestic courts.",
            },
            {
                "id": "CLS-US-02",
                "clause_title": "Data Sovereignty, Privacy & FedRAMP Compliance",
                "category": "TECHNICAL",
                "criticality": "CRITICAL",
                "doc_reference": "RFP Section 4: Information Security Schedule (ISS 8.3)",
                "doc_file_name": "RFP_UNPD_NYC_2026_0442_Specs.pdf",
                "page_number": "39",
                "clause_text": (
                    "All UN mission data, cryptographic keys, and neural network indices must remain encrypted in transit (TLS 1.3) "
                    "and at rest (AES-256) within FedRAMP High or ISO 27001 certified tenant boundaries with zero vendor telemetry sharing."
                ),
                "implication": "Architecture must utilize customer-managed keys (CMK) and strictly segmented sovereign tenancy.",
            },
            {
                "id": "CLS-US-03",
                "clause_title": "Performance Security / Standby Letter of Credit",
                "category": "FINANCIAL",
                "criticality": "HIGH",
                "doc_reference": "Special Conditions of Contract (SCC 12.1)",
                "doc_file_name": "Special_Conditions_UNPD.pdf",
                "page_number": "22",
                "clause_text": (
                    "The awarded contractor shall furnish an Irrevocable Standby Letter of Credit (SBLC) in the amount of 10% "
                    "of the total contract value ($1,280,000 USD) issued by a prime US commercial bank within 30 days of contract execution."
                ),
                "implication": "Requires pre-arrangement of a $1.28M USD bank credit line with JP Morgan Chase, Citi, or equivalent correspondent bank.",
            },
        ]

        # 3. Post-award governance
        post_award_data = {
            "retention_money_percent": 5.0,
            "defect_liability_period_months": 24,
            "sla_penalty_hourly_usd": 500.0,
            "local_partner_share_percent": 0.0,
            "key_milestones": [
                {
                    "name": "Cloud Architecture & Security Blueprint Sign-off",
                    "target_month": 4,
                    "status": "PENDING",
                },
                {
                    "name": "Core Workload Migration & Hybrid Connectivity",
                    "target_month": 12,
                    "status": "PENDING",
                },
                {
                    "name": "AI Multilingual Document Pipeline Deployment",
                    "target_month": 20,
                    "status": "PENDING",
                },
                {
                    "name": "Global Field Mission Rollout & Full Cutover",
                    "target_month": 36,
                    "status": "PENDING",
                },
            ],
        }

        # 4. Financial Model & Cash Flow Breakdown
        financial_model = {
            "base_bid_usd": 12800000.0,
            "direct_costs_usd": 9200000.0,
            "contingency_reserve_usd": 640000.0,
            "gross_margin_percent": 23.1,
            "gross_profit_usd": 2960000.0,
            "tax_and_vat_deduction_percent": 0.0,  # UN tax-exempt status
            "cash_flow_milestones": [
                {
                    "milestone": "Mobilization & FedRAMP Cloud Setup",
                    "percentage": 15,
                    "amount_usd": 1920000.0,
                    "expected_month": 2,
                },
                {
                    "milestone": "Phase 1: Production Workloads Cutover",
                    "percentage": 35,
                    "amount_usd": 4480000.0,
                    "expected_month": 12,
                },
                {
                    "milestone": "Phase 2: AI Document Intelligence Launch",
                    "percentage": 25,
                    "amount_usd": 3200000.0,
                    "expected_month": 20,
                },
                {
                    "milestone": "Phase 3: Worldwide Field Mission Handover",
                    "percentage": 20,
                    "amount_usd": 2560000.0,
                    "expected_month": 36,
                },
                {
                    "milestone": "Final SLA Warranty Performance Release",
                    "percentage": 5,
                    "amount_usd": 640000.0,
                    "expected_month": 48,
                },
            ],
        }

        # Create Tender Record
        tender = Tender(
            id=TENDER_ID,
            reference_no="RFP/UNPD/NYC/2026/0442",
            title="Enterprise Hybrid Cloud Migration, AI Document Intelligence & Global Operations Infrastructure",
            organization="United Nations Procurement Division (UNPD) - New York HQ",
            country="United States",
            category="IT & Cloud Infrastructure",
            estimated_value=12800000.0,
            currency="USD",
            exchange_rate_to_bdt=122.50,
            exchange_rate_date="2026-09-15",
            estimated_value_bdt=1568000000.0,
            stage="PREPARATION",
            decision="GO",
            priority="CRITICAL",
            submission_deadline="2026-11-18T17:00:00-04:00",
            days_remaining=62,
            hours_remaining=1493,
            readiness_score=88,
            lead_owner_name="System Administrator",
            lead_owner_role="Global Bid Capture & Enterprise Solutions Director",
            summary_json=json.dumps(summary_payload),
            important_clauses=important_clauses,
            # Procurement Manager
            procurement_manager_name="Marcus Vance",
            procurement_manager_designation="Chief, IT & Communications Procurement Section, UNPD New York",
            procurement_manager_email="vance.m@un.org",
            procurement_manager_phone="+1 (212) 963-8890",
            # Helpline
            helpline_phone="+1 (212) 963-1234",
            helpline_email="ungm-procurement@un.org",
            helpline_hours="09:00 AM - 05:00 PM EDT (UTC-4), Monday through Friday",
            # Sourcing Governance
            tender_type="INTERNATIONAL_COMPETITIVE_BIDDING",
            budget_type="CAPITAL",
            source_of_fund="United Nations General Trust Fund (Assessed & Voluntary Contributions)",
            procurement_method="Two-Envelope RFP (Technical & Commercial, QCBS 80:20)",
            # Milestones
            opening_date="2026-11-18T17:30:00-04:00",
            contract_signing_date="2027-01-15",
            work_start_date="2027-02-01",
            possible_period="36 Months",
            product_handover_date="2030-01-31",
            maintenance_period="36 Months 99.99% High-Availability Multi-Region SLA",
            # Purchase & Security
            schedule_purchase_deadline="2026-11-04T17:00:00-04:00",
            schedule_purchase_method="UNGM Portal Electronic RFP Kit (Vendor Registration Level 2)",
            tender_security_amount=250000.0,
            tender_security_method="Irrevocable Standby Letter of Credit (SBLC) or Bid Bond from US Federal / Scheduled Bank",
            post_award_data=post_award_data,
            financial_model=financial_model,
            ai_chat_share_link="https://tendertracker-app.centralindia.cloudapp.azure.com/chat/tenders/TDR-2026-UNPD-USA-002",
        )
        db.add(tender)
        db.flush()

        # 5. Requirements Checklist
        requirements_data = [
            (
                f"{TENDER_ID}-REQ-01",
                "FedRAMP High & Zero-Trust Architecture Track Record",
                "Technical",
                "COMPLIANT",
                "Proven delivery of sovereign cloud migrations with FISMA/FedRAMP high compliance for international institutions.",
            ),
            (
                f"{TENDER_ID}-REQ-02",
                "Audited 3-Year Annual Turnover >= $20M USD",
                "Financial",
                "COMPLIANT",
                "Verified audited financial balance sheets demonstrating average revenues above the required threshold.",
            ),
            (
                f"{TENDER_ID}-REQ-03",
                "UN Global Marketplace (UNGM) Level 2 Active Registration",
                "Statutory",
                "COMPLIANT",
                "Vendor successfully registered and approved under UNGM Vendor Registration Level 2 (Vendor ID: UNGM-984420).",
            ),
            (
                f"{TENDER_ID}-REQ-04",
                "Key Personnel: Lead Cloud Architect & Security Officer (CISSP)",
                "Personnel",
                "COMPLIANT",
                "Nominated Enterprise Cloud Architect (AWS/Azure Certified) and Chief Information Security Officer (CISSP).",
            ),
        ]
        for req_id, title, category, status, desc in requirements_data:
            r = TenderRequirement(
                id=req_id,
                tender_id=TENDER_ID,
                title=title,
                category=category,
                status=status,
                owner="System Administrator",
            )
            db.add(r)

        # 6. Action Tasks
        tasks_data = [
            (
                f"{TENDER_ID}-TSK-01",
                "Submit Expression of Interest on UNGM & Download Level 2 RFP Dossier",
                "System Administrator",
                "2026-10-01",
                "DONE",
                "HIGH",
            ),
            (
                f"{TENDER_ID}-TSK-02",
                "Complete Cloud Workload Assessment & FedRAMP Architecture Blueprint",
                "System Administrator",
                "2026-10-25",
                "IN_PROGRESS",
                "CRITICAL",
            ),
            (
                f"{TENDER_ID}-TSK-03",
                "Issue $250,000 Standby Letter of Credit (SBLC) via US Correspondent Bank",
                "System Administrator",
                "2026-11-10",
                "TODO",
                "CRITICAL",
            ),
            (
                f"{TENDER_ID}-TSK-04",
                "Finalize Multi-Volume Technical & Commercial Proposal on UNGM Portal",
                "System Administrator",
                "2026-11-18",
                "TODO",
                "CRITICAL",
            ),
        ]
        for task_id, title, assignee, due_date, status, priority in tasks_data:
            t = TenderTask(
                id=task_id,
                tender_id=TENDER_ID,
                title=title,
                assignee=assignee,
                due_date=due_date,
                status=status,
                priority=priority,
            )
            db.add(t)

        # 7. Audit Discussion Logs
        comments_data = [
            (
                f"{TENDER_ID}-CMT-01",
                "Pre-proposal conference held with UNPD Headquarters via Microsoft Teams (10:00 AM EDT). "
                "Confirmed that cloud tenancy must support low-latency ingress across Geneva, Nairobi, and Bangkok mission hubs.",
            ),
            (
                f"{TENDER_ID}-CMT-02",
                "JP Morgan Chase New York confirmed issuance facility for $250,000 SBLC under standard UNGM MT760 template.",
            ),
        ]
        for cmt_id, content in comments_data:
            c = TenderComment(
                id=cmt_id,
                tender_id=TENDER_ID,
                channel_id="general-ops",
                author_name="System Administrator",
                author_role="SUPER_ADMIN",
                author_avatar="SA",
                content=content,
            )
            db.add(c)

        # 8. Decision Matrix
        matrix = TenderDecisionMatrix(
            tender_id=TENDER_ID,
            technical_score=95.0,
            financial_score=90.0,
            team_score=92.0,
            sla_score=93.0,
            composite_score=92.5,
            threshold=75.0,
            status="GO",
            rationale=(
                "Prestigious multilateral flagship opportunity with the United Nations Headquarters in New York. "
                "Exceptional portfolio alignment with our enterprise cloud and AI engineering capabilities. "
                "Exempt from domestic corporate tax withholding under UN diplomatic status, generating strong net operating margins."
            ),
        )
        db.add(matrix)

        db.commit()
        print(f"Successfully created international sample tender: {TENDER_ID}")
        print(f"Title: {tender.title}")
        print(f"Organization: {tender.organization} ({tender.country})")
        print(f"Timezone: US Eastern Time (EDT, UTC-4)")
        print(f"Deadline: {tender.submission_deadline}")
        print(
            f"Value: ${tender.estimated_value:,.2f} ({tender.estimated_value_bdt:,.2f} BDT)"
        )
        print(
            f"Stage: {tender.stage} | Decision: {tender.decision} | Priority: {tender.priority}"
        )
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"Error creating international sample tender: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    create_international_dummy_tender()
