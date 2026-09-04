from sqlalchemy.orm import Session
from app.models.user import User
from app.models.tender import Tender, TenderDecisionMatrix
from app.models.task import TenderTask
from app.models.document import TenderDocument, ReusableDocument
from app.models.requirement import TenderRequirement
from app.models.review import TenderReviewTier
from app.models.comment import TenderComment
from app.core.security import get_password_hash
from app.services.storage import ensure_tender_directories

INITIAL_USERS = [
    {
        "id": "USR-01",
        "name": "Sarah Jenkins",
        "email": "sarah.jenkins@tendertracker.org",
        "password": "Password123!",
        "role": "BUSINESS_HEAD",
        "title": "Director of Procurement & Bid Capture",
        "department": "Executive Leadership",
        "max_capacity": 6,
        "avatar": "SJ",
    },
    {
        "id": "USR-02",
        "name": "Dr. Marcus Vance",
        "email": "marcus.vance@tendertracker.org",
        "password": "Password123!",
        "role": "EXECUTIVE_MANAGER",
        "title": "Head of Technical Architecture & Delivery",
        "department": "Technical Solutions",
        "max_capacity": 5,
        "avatar": "MV",
    },
    {
        "id": "USR-03",
        "name": "Tariq Al-Mansoor",
        "email": "tariq.mansoor@tendertracker.org",
        "password": "Password123!",
        "role": "SENIOR_MANAGER",
        "title": "Commercial Pricing & Contracts Director",
        "department": "Commercial Finance",
        "max_capacity": 5,
        "avatar": "TA",
    },
    {
        "id": "USR-04",
        "name": "Elena Rostova",
        "email": "elena.rostova@tendertracker.org",
        "password": "Password123!",
        "role": "TENDER_ANALYST",
        "title": "Senior Bid Analyst & Compliance Lead",
        "department": "Bid Operations",
        "max_capacity": 4,
        "avatar": "ER",
    },
]

INITIAL_REUSABLE_DOCS = [
    {
        "id": "RUD-101",
        "name": "Global_Trade_License_Incorporation_Certificate_2026.pdf",
        "category": "Company Statutory",
        "uploaded_at": "2026-01-10",
        "expiry_date": "2027-01-10",
        "size": "3.4 MB",
        "revision": "v2.0",
        "access_level": "ALL_TEAM",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "description": "Certified trade license and corporate certificate of incorporation valid worldwide.",
    },
    {
        "id": "RUD-102",
        "name": "Audited_Financial_Statements_BalanceSheet_FY2024_2025.pdf",
        "category": "Financial & Tax",
        "uploaded_at": "2026-02-15",
        "expiry_date": "2026-12-31",
        "size": "5.1 MB",
        "revision": "v1.2",
        "access_level": "RESTRICTED_FINANCE",
        "sha256": "4a5c3d2e1f0b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c",
        "description": "Three years of certified audited balance sheets, profit & loss, and liquidity ratios.",
    },
    {
        "id": "RUD-103",
        "name": "ISO_9001_Quality_and_27001_Information_Security_Accreditation.pdf",
        "category": "Certifications & ISO",
        "uploaded_at": "2025-11-20",
        "expiry_date": "2028-11-20",
        "size": "2.8 MB",
        "revision": "v3.0",
        "access_level": "ALL_TEAM",
        "sha256": "1f2e3d4c5b6a708990a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
        "description": "Joint ISO 9001:2015 and ISO 27001:2022 security accreditation certificates.",
    },
    {
        "id": "RUD-104",
        "name": "Bank_Solvency_Letter_and_Liquid_Asset_Confirmation_2026.pdf",
        "category": "Financial & Tax",
        "uploaded_at": "2026-03-01",
        "expiry_date": "2026-09-01",
        "size": "1.2 MB",
        "revision": "v1.0",
        "access_level": "RESTRICTED_FINANCE",
        "sha256": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        "description": "Standard bank solvency letter certifying unconditional credit line facility.",
    },
]

def seed_database(db: Session):
    # 1. Seed Users if empty
    if db.query(User).count() == 0:
        for u in INITIAL_USERS:
            db.add(
                User(
                    id=u["id"],
                    name=u["name"],
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    title=u["title"],
                    department=u["department"],
                    max_capacity=u["max_capacity"],
                    avatar=u["avatar"],
                )
            )
        db.commit()

    # 2. Seed Reusable Master Documents if empty
    if db.query(ReusableDocument).count() == 0:
        for doc in INITIAL_REUSABLE_DOCS:
            db.add(
                ReusableDocument(
                    id=doc["id"],
                    name=doc["name"],
                    category=doc["category"],
                    uploaded_at=doc["uploaded_at"],
                    expiry_date=doc["expiry_date"],
                    size=doc["size"],
                    revision=doc["revision"],
                    access_level=doc["access_level"],
                    sha256=doc["sha256"],
                    description=doc["description"],
                )
            )
        db.commit()

    # 3. Seed Primary Tenders if empty
    if db.query(Tender).count() == 0:
        t1 = Tender(
            id="TDR-2026-EU-089",
            reference_no="EU-DG-IT-2026-8891",
            title="Next-Generation Enterprise ERP Modernization",
            organization="European Directorate-General for Informatics (DIGIT)",
            country="Belgium",
            category="Software Development",
            estimated_value=12500000.0,
            stage="PREPARATION",
            decision="GO",
            priority="HIGH",
            submission_deadline="2026-09-15T12:00:00Z",
            days_remaining=11,
            hours_remaining=264,
            readiness_score=85,
            lead_owner_name="Sarah Jenkins",
            lead_owner_role="Business Head",
        )
        db.add(t1)
        db.flush()

        ensure_tender_directories(t1.id)

        # Tasks for T1
        db.add(TenderTask(id="TSK-101", tender_id=t1.id, title="Finalize System Architecture Diagram", assignee="Dr. Marcus Vance", status="DONE", priority="HIGH"))
        db.add(TenderTask(id="TSK-102", tender_id=t1.id, title="Compile Audited Financial Balance Sheets", assignee="Tariq Al-Mansoor", status="IN_PROGRESS", priority="HIGH"))
        db.add(TenderTask(id="TSK-103", tender_id=t1.id, title="Validate GDPR & Security Compliance", assignee="Elena Rostova", status="REVIEW", priority="MEDIUM"))

        # Review tiers for T1
        db.add(TenderReviewTier(tender_id=t1.id, tier_number=1, tier_name="Technical Architecture", role_required="EXECUTIVE_MANAGER", sign_off_status="APPROVED", signed_off_by="Dr. Marcus Vance", signed_off_at="2026-09-02"))
        db.add(TenderReviewTier(tender_id=t1.id, tier_number=2, tier_name="Financial Feasibility", role_required="SENIOR_MANAGER", sign_off_status="APPROVED", signed_off_by="Tariq Al-Mansoor", signed_off_at="2026-09-03"))
        db.add(TenderReviewTier(tender_id=t1.id, tier_number=3, tier_name="Legal & Governance", role_required="TENDER_ANALYST", sign_off_status="PENDING"))
        db.add(TenderReviewTier(tender_id=t1.id, tier_number=4, tier_name="Executive Sign-Off", role_required="BUSINESS_HEAD", sign_off_status="PENDING"))

        # Documents for T1
        db.add(TenderDocument(
            id="DOC-01",
            tender_id=t1.id,
            name="Official_RFP_Specifications_DIGIT_2026.pdf",
            folder="01_original_tender_documents",
            size="4.2 MB",
            revision="v1.0",
            sha256="b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0b9a8c7",
            uploaded_at="2026-08-25",
            access_level="ALL_TEAM"
        ))

        # Decision Matrix for T1
        db.add(TenderDecisionMatrix(
            tender_id=t1.id,
            technical_score=90.0,
            financial_score=85.0,
            team_score=88.0,
            sla_score=92.0,
            composite_score=88.5,
            threshold=70.0,
            status="GO",
            rationale="High strategic alignment with corporate multi-cloud delivery capabilities."
        ))

        # T2: ACRI Digital Ratings Platform
        t2 = Tender(
            id="TDR-PRC0190428",
            reference_no="PRC0190428",
            title="Development of the African Credit and Investment Risk (ACRI) Digital Ratings Platform",
            organization="United Nations Development Programme (UNDP)",
            country="Ghana & Côte d'Ivoire",
            category="Fintech / Web Platform",
            estimated_value=None,
            stage="DISCOVERED",
            decision="PENDING",
            priority="HIGH",
            submission_deadline="2026-09-15T23:59:59Z",
            days_remaining=11,
            hours_remaining=275,
            readiness_score=45,
            lead_owner_name="Sarah Jenkins",
            lead_owner_role="Business Head",
        )
        db.add(t2)
        db.flush()
        ensure_tender_directories(t2.id)

        db.add(TenderTask(id="TSK-201", tender_id=t2.id, title="Review UNDP Quantum Portal Guidelines", assignee="Elena Rostova", status="TODO", priority="HIGH"))
        db.add(TenderTask(id="TSK-202", tender_id=t2.id, title="Evaluate Local Consortium / JV Partner in Abidjan", assignee="Tariq Al-Mansoor", status="IN_PROGRESS", priority="HIGH"))

        db.commit()
