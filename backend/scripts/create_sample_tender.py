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

TENDER_ID = "TDR-2026-RHD-001"


def create_comprehensive_dummy_tender():
    print("=" * 70)
    print("  Creating Fully-Populated Sample Tender: " + TENDER_ID)
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
                "Turnkey engineering, supply, installation, testing, commissioning, and 3-year operations of an "
                "AI-powered Intelligent Transportation System (ITS), Highway Surveillance Video Wall, Automatic "
                "Number Plate Recognition (ANPR), and Fastag/RFID Electronic Toll Collection (ETC) for the "
                "Dhaka-Chattogram National Highway (N1) corridor."
            ),
            "scope_of_work": [
                "Deployment of 180 ANPR & PTZ optical surveillance cameras across 192 km",
                "Installation of 24 Dedicated Fastag Electronic Toll Collection (ETC) lanes with automatic vehicle weight classifiers",
                "Central Traffic Management Center (TMC) software with real-time AI incident detection and emergency dispatch",
                "36-month comprehensive 24/7 SLA, warranty, and field engineer maintenance"
            ],
            "key_qualifications": [
                "Minimum 10 years corporate existence in turnkey ITS or smart infrastructure",
                "Successful completion of at least 2 highway tolling or traffic management projects valued at $3M+ each within past 5 years",
                "Average annual systems integration turnover of at least $6M over last 3 fiscal years",
                "Active ISO 9001, ISO 27001, and CMMI Level 3 corporate quality certifications"
            ],
            "commercial_terms": (
                "Quality and Cost Based Selection (QCBS) 80:20 technical/financial weightage. "
                "Liquidated damages capped at 10% of contract price. Mobilization advance 10% against bank guarantee."
            )
        }

        # 2. Key contract clauses
        important_clauses = [
            {
                "id": "CLS-01",
                "clause_title": "Performance Security Guarantee",
                "category": "FINANCIAL",
                "criticality": "CRITICAL",
                "doc_reference": "Section 7: General Conditions of Contract (GCC 14.2)",
                "doc_file_name": "Standard_Tender_Document_PW3.pdf",
                "page_number": "48",
                "clause_text": (
                    "The successful contractor shall furnish a Performance Security in the form of an Unconditional "
                    "Bank Guarantee equal to 10% of the Contract Price within 28 days of Letter of Acceptance, "
                    "valid until 28 days beyond the Defects Liability Period."
                ),
                "implication": "Mandates establishing a $450,000 credit line / bank guarantee facility with a scheduled tier-1 commercial bank."
            },
            {
                "id": "CLS-02",
                "clause_title": "Liquidated Damages for Delay",
                "category": "LEGAL",
                "criticality": "HIGH",
                "doc_reference": "Section 7: General Conditions of Contract (GCC 27.1)",
                "doc_file_name": "Standard_Tender_Document_PW3.pdf",
                "page_number": "56",
                "clause_text": (
                    "If the Contractor fails to achieve milestone handover by the Intended Completion Date, "
                    "liquidated damages shall be 0.1% per day of delayed work up to a maximum ceiling of 10% of the Contract Price."
                ),
                "implication": "Delivery timeline requires rigorous risk tracking and buffer allocation in the baseline master schedule."
            },
            {
                "id": "CLS-03",
                "clause_title": "Advance Payment Guarantee",
                "category": "FINANCIAL",
                "criticality": "MEDIUM",
                "doc_reference": "Section 8: Particular Conditions of Contract (PCC 44.1)",
                "doc_file_name": "Standard_Tender_Document_PW3.pdf",
                "page_number": "62",
                "clause_text": (
                    "A 10% mobilization advance payment shall be made against submission of an irrevocable bank guarantee "
                    "of equal amount valid until full recovery through progressive interim billing."
                ),
                "implication": "Provides early cashflow funding of $450,000 (BDT 5.51 Crore) for initial sensor and server procurement."
            }
        ]

        # 3. Post-award governance
        post_award_data = {
            "retention_money_percent": 5.0,
            "defect_liability_period_months": 12,
            "sla_penalty_hourly_usd": 250.0,
            "local_partner_share_percent": 30.0,
            "key_milestones": [
                {"name": "Detailed Design Review", "target_month": 3, "status": "PENDING"},
                {"name": "Factory Acceptance Testing (FAT)", "target_month": 6, "status": "PENDING"},
                {"name": "Site Acceptance Testing (SAT)", "target_month": 18, "status": "PENDING"},
                {"name": "Final Handover & Trial Operations", "target_month": 24, "status": "PENDING"}
            ]
        }

        # 4. Financial Model & Cash Flow Breakdown
        financial_model = {
            "base_bid_usd": 4500000.0,
            "direct_costs_usd": 3375000.0,
            "contingency_reserve_usd": 225000.0,
            "gross_margin_percent": 20.0,
            "gross_profit_usd": 900000.0,
            "tax_and_vat_deduction_percent": 7.5,
            "cash_flow_milestones": [
                {"milestone": "Mobilization Advance", "percentage": 10, "amount_usd": 450000.0, "expected_month": 1},
                {"milestone": "Equipment Delivery & Factory Inspection", "percentage": 40, "amount_usd": 1800000.0, "expected_month": 6},
                {"milestone": "Installation & Field Testing", "percentage": 30, "amount_usd": 1350000.0, "expected_month": 18},
                {"milestone": "Final Commissioning & Handover", "percentage": 15, "amount_usd": 675000.0, "expected_month": 24},
                {"milestone": "Defects Liability Release", "percentage": 5, "amount_usd": 225000.0, "expected_month": 36}
            ]
        }

        # Create Tender Record
        tender = Tender(
            id=TENDER_ID,
            reference_no="e-GP/RHD/ITS/2026/PKG-01",
            title="Intelligent Transportation System (ITS), Highway Surveillance & Electronic Toll Collection (ETC) for Dhaka-Chattogram Expressway",
            organization="Roads and Highways Department (RHD)",
            country="Bangladesh",
            category="Smart City & Transportation",
            estimated_value=4500000.0,
            currency="USD",
            exchange_rate_to_bdt=122.50,
            exchange_rate_date="2026-09-14",
            estimated_value_bdt=551250000.0,
            stage="PREPARATION",
            decision="GO",
            priority="CRITICAL",
            submission_deadline="2026-10-25T14:00:00Z",
            days_remaining=41,
            hours_remaining=984,
            readiness_score=85,
            lead_owner_name="System Administrator",
            lead_owner_role="Director of Procurement & Bid Capture",
            summary_json=json.dumps(summary_payload),
            important_clauses=important_clauses,
            # Procurement Manager
            procurement_manager_name="Engr. Md. Rafiqul Islam",
            procurement_manager_designation="Superintending Engineer & Additional Project Director",
            procurement_manager_email="pd.its@rhd.gov.bd",
            procurement_manager_phone="+880 1711-543210",
            # Helpline
            helpline_phone="+880 2-8878055",
            helpline_email="support.its@rhd.gov.bd",
            helpline_hours="09:00 AM - 05:00 PM BST (Sunday through Thursday)",
            # Sourcing Governance
            tender_type="OPEN_TENDERING_METHOD",
            budget_type="DEVELOPMENT",
            source_of_fund="Government of Bangladesh (GoB) & World Bank Co-Financing (IDA Credit No. 6890-BD)",
            procurement_method="Single Stage Two Envelope (QCBS 80:20)",
            # Milestones
            opening_date="2026-10-25T15:00:00Z",
            contract_signing_date="2026-12-01",
            work_start_date="2026-12-15",
            possible_period="24 Months",
            product_handover_date="2028-12-14",
            maintenance_period="36 Months Comprehensive Warranty & Operations SLA",
            # Purchase & Security
            schedule_purchase_deadline="2026-10-24T17:00:00Z",
            schedule_purchase_method="Online Payment through e-GP Portal (Sonali e-Sheba / VISA / Mastercard)",
            tender_security_amount=90000.0,
            tender_security_method="Unconditional Bank Guarantee from Scheduled Bank in Bangladesh (valid 180 days)",
            post_award_data=post_award_data,
            financial_model=financial_model,
            ai_chat_share_link="https://tendertracker-app.centralindia.cloudapp.azure.com/chat/tenders/TDR-2026-RHD-001"
        )
        db.add(tender)
        db.commit()

        # 5. Add Decision Matrix
        matrix = TenderDecisionMatrix(
            tender_id=TENDER_ID,
            technical_score=94.0,
            financial_score=88.0,
            team_score=90.0,
            sla_score=85.0,
            composite_score=89.25,
            threshold=70.0,
            status="GO",
            rationale=(
                "High-priority national corridor project. Clear alignment with our intelligent transportation portfolio, "
                "strong cashflow support via 10% mobilization advance, and our corporate credentials directly fulfill all qualifying criteria."
            )
        )
        db.add(matrix)

        # 6. Add Requirements
        requirements = [
            TenderRequirement(
                id=f"{TENDER_ID}-REQ-01",
                tender_id=TENDER_ID,
                title="Turnkey ITS & Toll Deployment Track Record",
                category="Technical",
                status="COMPLIANT",
                owner="System Administrator"
            ),
            TenderRequirement(
                id=f"{TENDER_ID}-REQ-02",
                tender_id=TENDER_ID,
                title="Average Annual Systems Integration Turnover >= $6M",
                category="Financial",
                status="COMPLIANT",
                owner="System Administrator"
            ),
            TenderRequirement(
                id=f"{TENDER_ID}-REQ-03",
                tender_id=TENDER_ID,
                title="ISO 9001 (Quality) & ISO 27001 (Security) Certifications",
                category="Statutory",
                status="COMPLIANT",
                owner="System Administrator"
            ),
            TenderRequirement(
                id=f"{TENDER_ID}-REQ-04",
                tender_id=TENDER_ID,
                title="Nominated Project Director (PMP Certified, 15+ Yrs Exp)",
                category="Personnel",
                status="COMPLIANT",
                owner="System Administrator"
            )
        ]
        for req in requirements:
            db.add(req)

        # 7. Add Tasks
        tasks = [
            TenderTask(
                id=f"{TENDER_ID}-TSK-01",
                tender_id=TENDER_ID,
                title="Procure e-GP Tender Schedule & Attend Pre-Bid Clarification Meeting",
                assignee="System Administrator",
                due_date="2026-10-05",
                status="DONE",
                priority="HIGH"
            ),
            TenderTask(
                id=f"{TENDER_ID}-TSK-02",
                tender_id=TENDER_ID,
                title="Draft Technical Architecture, Bill of Quantities & Vendor Compliance Matrix",
                assignee="System Administrator",
                due_date="2026-10-18",
                status="IN_PROGRESS",
                priority="CRITICAL"
            ),
            TenderTask(
                id=f"{TENDER_ID}-TSK-03",
                tender_id=TENDER_ID,
                title="Secure $90,000 Unconditional Bank Guarantee for Tender Security (EMD)",
                assignee="System Administrator",
                due_date="2026-10-22",
                status="TODO",
                priority="CRITICAL"
            ),
            TenderTask(
                id=f"{TENDER_ID}-TSK-04",
                tender_id=TENDER_ID,
                title="Final Proposal Sign-Off & e-GP Portal Two-Envelope Digital Submission",
                assignee="System Administrator",
                due_date="2026-10-25",
                status="TODO",
                priority="CRITICAL"
            )
        ]
        for task in tasks:
            db.add(task)

        # 8. Add Comments
        comments = [
            TenderComment(
                id=f"{TENDER_ID}-CMT-01",
                tender_id=TENDER_ID,
                channel_id="general-ops",
                author_name="System Administrator",
                author_role="SUPER_ADMIN",
                author_avatar="SA",
                content=(
                    "Pre-bid meeting completed with RHD project director. Clarified that optical fiber redundancy across both "
                    "northbound and southbound carriageways is required. Adding corresponding active switches to BoQ."
                )
            ),
            TenderComment(
                id=f"{TENDER_ID}-CMT-02",
                tender_id=TENDER_ID,
                channel_id="general-ops",
                author_name="System Administrator",
                author_role="SUPER_ADMIN",
                author_avatar="SA",
                content=(
                    "Bank guarantee facility confirmed with Sonali Bank Principal Office. Margin requirement is 10% cash collateral. "
                    "Draft BG wording reviewed and fully compliant with e-GP Form PW3-4."
                )
            )
        ]
        for cmt in comments:
            db.add(cmt)

        db.commit()
        print(f"Successfully created comprehensive sample tender: {TENDER_ID}")
        print(f"Title: {tender.title}")
        print(f"Organization: {tender.organization}")
        print(f"Value: ${tender.estimated_value:,.2f} ({tender.estimated_value_bdt:,.2f} BDT)")
        print(f"Stage: {tender.stage} | Decision: {tender.decision} | Priority: {tender.priority}")
        print("Requirements: 4 | Tasks: 4 | Comments: 2 | Clauses: 3")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"Error creating tender: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    create_comprehensive_dummy_tender()
