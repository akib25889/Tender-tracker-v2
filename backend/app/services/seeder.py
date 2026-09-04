from sqlalchemy.orm import Session
from app.models.user import User
from app.models.tender import Tender, TenderDecisionMatrix, TenderCategory
from app.models.task import TenderTask
from app.models.document import TenderDocument, ReusableDocument
from app.models.requirement import TenderRequirement
from app.models.review import TenderReviewTier
from app.models.comment import TenderComment
from app.models.permission import (
    Permission,
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
)
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

INITIAL_CATEGORIES = [
    {
        "name": "Software Development",
        "description": "Enterprise application development, modernization, web/mobile engineering, and custom software delivery.",
        "color_badge": "blue",
    },
    {
        "name": "Cloud & Cyber Security",
        "description": "Cloud migration, FedRAMP/ISO 27001 architectures, perimeter security, and SOC operations.",
        "color_badge": "purple",
    },
    {
        "name": "Healthcare & Medical Systems",
        "description": "Hospital management systems, medical device interfaces, PACS, and biomedical software solutions.",
        "color_badge": "emerald",
    },
    {
        "name": "Infrastructure & Public Works",
        "description": "Civil infrastructure, datacenter physical deployments, fiber backbones, and municipal utilities.",
        "color_badge": "amber",
    },
    {
        "name": "Defense & Strategic Technology",
        "description": "Mission-critical C4ISR defense solutions, encrypted tactical links, and aerospace integration.",
        "color_badge": "rose",
    },
    {
        "name": "Energy & Utilities",
        "description": "Smart grid metering, renewable SCADA, power distribution automation, and ESG monitoring.",
        "color_badge": "teal",
    },
    {
        "name": "Smart City & Transportation",
        "description": "Intelligent traffic management, automated fare collection, and IoT sensor telemetry.",
        "color_badge": "indigo",
    },
    {
        "name": "Consulting & Advisory Services",
        "description": "Strategic advisory, regulatory compliance audits, and digital transformation roadmapping.",
        "color_badge": "cyan",
    },
]


def seed_database(db: Session):
    # 0. Seed Tender Categories
    for cat in INITIAL_CATEGORIES:
        existing = (
            db.query(TenderCategory)
            .filter(TenderCategory.name.ilike(cat["name"]))
            .first()
        )
        if not existing:
            db.add(
                TenderCategory(
                    name=cat["name"],
                    description=cat.get("description"),
                    color_badge=cat.get("color_badge", "blue"),
                )
            )
    db.commit()

    # Sync any custom categories that may already exist in tenders
    existing_tenders = db.query(Tender.category).distinct().all()
    for (t_cat,) in existing_tenders:
        if t_cat and t_cat.strip():
            existing = (
                db.query(TenderCategory)
                .filter(TenderCategory.name.ilike(t_cat.strip()))
                .first()
            )
            if not existing:
                db.add(
                    TenderCategory(
                        name=t_cat.strip(),
                        description="Imported from active tenders.",
                        color_badge="blue",
                    )
                )
    db.commit()

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
        db.add(
            TenderTask(
                id="TSK-101",
                tender_id=t1.id,
                title="Finalize System Architecture Diagram",
                assignee="Dr. Marcus Vance",
                status="DONE",
                priority="HIGH",
            )
        )
        db.add(
            TenderTask(
                id="TSK-102",
                tender_id=t1.id,
                title="Compile Audited Financial Balance Sheets",
                assignee="Tariq Al-Mansoor",
                status="IN_PROGRESS",
                priority="HIGH",
            )
        )
        db.add(
            TenderTask(
                id="TSK-103",
                tender_id=t1.id,
                title="Validate GDPR & Security Compliance",
                assignee="Elena Rostova",
                status="REVIEW",
                priority="MEDIUM",
            )
        )

        # Review tiers for T1
        db.add(
            TenderReviewTier(
                tender_id=t1.id,
                tier_number=1,
                tier_name="Technical Architecture",
                role_required="EXECUTIVE_MANAGER",
                sign_off_status="APPROVED",
                signed_off_by="Dr. Marcus Vance",
                signed_off_at="2026-09-02",
            )
        )
        db.add(
            TenderReviewTier(
                tender_id=t1.id,
                tier_number=2,
                tier_name="Financial Feasibility",
                role_required="SENIOR_MANAGER",
                sign_off_status="APPROVED",
                signed_off_by="Tariq Al-Mansoor",
                signed_off_at="2026-09-03",
            )
        )
        db.add(
            TenderReviewTier(
                tender_id=t1.id,
                tier_number=3,
                tier_name="Legal & Governance",
                role_required="TENDER_ANALYST",
                sign_off_status="PENDING",
            )
        )
        db.add(
            TenderReviewTier(
                tender_id=t1.id,
                tier_number=4,
                tier_name="Executive Sign-Off",
                role_required="BUSINESS_HEAD",
                sign_off_status="PENDING",
            )
        )

        # Documents for T1
        db.add(
            TenderDocument(
                id="DOC-01",
                tender_id=t1.id,
                name="Official_RFP_Specifications_DIGIT_2026.pdf",
                folder="01_original_tender_documents",
                size="4.2 MB",
                revision="v1.0",
                sha256="b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0b9a8c7",
                uploaded_at="2026-08-25",
                access_level="ALL_TEAM",
            )
        )

        # Decision Matrix for T1
        db.add(
            TenderDecisionMatrix(
                tender_id=t1.id,
                technical_score=90.0,
                financial_score=85.0,
                team_score=88.0,
                sla_score=92.0,
                composite_score=88.5,
                threshold=70.0,
                status="GO",
                rationale="High strategic alignment with corporate multi-cloud delivery capabilities.",
            )
        )

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

        db.add(
            TenderTask(
                id="TSK-201",
                tender_id=t2.id,
                title="Review UNDP Quantum Portal Guidelines",
                assignee="Elena Rostova",
                status="TODO",
                priority="HIGH",
            )
        )
        db.add(
            TenderTask(
                id="TSK-202",
                tender_id=t2.id,
                title="Evaluate Local Consortium / JV Partner in Abidjan",
                assignee="Tariq Al-Mansoor",
                status="IN_PROGRESS",
                priority="HIGH",
            )
        )

        # T3: WHO Health Information Exchange
        t3 = Tender(
            id="TDR-2026-WHO-044",
            reference_no="WPRO-2026-RFP-091",
            title="Integrated Health Information Exchange & Disease Surveillance Cloud System",
            organization="World Health Organization (WHO WPRO)",
            country="Fiji & South Pacific Regional",
            category="Healthcare & Cloud Data",
            estimated_value=6900000.0,
            stage="PREPARATION",
            decision="GO",
            priority="HIGH",
            submission_deadline="2026-09-22T15:00:00Z",
            days_remaining=18,
            hours_remaining=432,
            readiness_score=68,
            lead_owner_name="Dr. Marcus Vance",
            lead_owner_role="Head of Technical Architecture",
        )
        db.add(t3)
        db.flush()
        ensure_tender_directories(t3.id)

        # T4: JICA Smart Water SCADA
        t4 = Tender(
            id="TDR-2026-JICA-118",
            reference_no="JICA-BD-P108-2026",
            title="Dhaka Smart Water Supply Network SCADA Automation & IoT Metering",
            organization="Japan International Cooperation Agency (JICA / DWASA)",
            country="Bangladesh",
            category="Industrial IoT & SCADA",
            estimated_value=18500000.0,
            stage="UNDER_ANALYSIS",
            decision="GO",
            priority="CRITICAL",
            submission_deadline="2026-09-08T11:00:00Z",
            days_remaining=4,
            hours_remaining=96,
            readiness_score=82,
            lead_owner_name="Tariq Al-Mansoor",
            lead_owner_role="Commercial Pricing Director",
        )
        db.add(t4)
        db.flush()
        ensure_tender_directories(t4.id)

        db.commit()

    # 4. Seed Standard Permissions Catalog
    STANDARD_PERMISSIONS = [
        ("tender.view", "View Tender Overview", "tender", "view"),
        ("tender.create", "Create New Opportunity", "tender", "create"),
        ("tender.edit", "Modify Tender Details", "tender", "edit"),
        ("tender.delete", "Delete Tender Record", "tender", "delete"),
        ("task.view", "View Operational Tasks", "task", "view"),
        ("task.create", "Create Task Deliverables", "task", "create"),
        ("task.edit", "Edit Task Status & Assignee", "task", "edit"),
        ("task.delete", "Delete Task", "task", "delete"),
        ("document.view", "View Document Metadata", "document", "view"),
        ("document.preview", "In-Browser Watermarked Preview", "document", "preview"),
        ("document.upload", "Upload Files to Vault", "document", "upload"),
        ("document.download", "Download Original Files", "document", "download"),
        ("document.edit", "Modify / Move Documents", "document", "edit"),
        ("document.delete", "Delete Document", "document", "delete"),
        ("document.share", "Share Document Link", "document", "share"),
        ("financial.view", "View Financial & BOQ Rates", "financial", "view"),
        ("financial.edit", "Edit Commercial Pricing Model", "financial", "edit"),
        (
            "submission.submit",
            "Execute Final Portal Bid Submission",
            "submission",
            "submit",
        ),
        ("partner.manage", "Manage JV & Consortium Partners", "partner", "manage"),
        (
            "permission.manage",
            "Master Access Control & Ceilings",
            "permission",
            "manage",
        ),
    ]

    for code, name, module, action in STANDARD_PERMISSIONS:
        if not db.query(Permission).filter(Permission.code == code).first():
            db.add(Permission(code=code, name=name, module=module, action=action))
    db.commit()

    # 5. Seed Sample Partner Organization
    partner_apex = (
        db.query(PartnerOrganization)
        .filter(PartnerOrganization.id == "ORG-APEX-01")
        .first()
    )
    if not partner_apex:
        partner_apex = PartnerOrganization(
            id="ORG-APEX-01",
            name="Apex Engineering & Infrastructure JV",
            partner_type="JV_PARTNER",
            country="Bangladesh",
            contact_email="bids@apex-engineering.com",
            status="ACTIVE",
            notes="Primary civil works & hardware integration consortium partner.",
        )
        db.add(partner_apex)
        db.commit()

        # Assign to T1 and T2 if tenders exist
        t1 = db.query(Tender).first()
        if t1:
            db.add(
                TenderPartnerAssignment(
                    tender_id=t1.id,
                    organization_id="ORG-APEX-01",
                    partner_type="JV_PARTNER",
                    status="ACTIVE",
                    start_date="2026-08-01",
                    end_date="2027-08-01",
                )
            )

        # Ceilings for APEX
        apex_ceilings = [
            ("tender.view", True),
            ("task.view", True),
            ("task.edit", True),
            ("document.view", True),
            ("document.preview", True),
            ("document.upload", True),
            ("document.download", True),
            ("document.delete", False),
            ("financial.view", False),
            ("financial.edit", False),
            ("submission.submit", False),
            ("permission.manage", False),
        ]
        for pcode, allowed in apex_ceilings:
            db.add(
                PartnerPermissionCeiling(
                    partner_organization_id="ORG-APEX-01",
                    permission_code=pcode,
                    allowed=allowed,
                )
            )
        db.commit()

    # 6. Seed Baseline Role Rules for BUSINESS_HEAD and TENDER_ANALYST
    if (
        not db.query(PermissionRule)
        .filter(PermissionRule.subject_id == "BUSINESS_HEAD")
        .first()
    ):
        for code, _, _, _ in STANDARD_PERMISSIONS:
            db.add(
                PermissionRule(
                    subject_type="ROLE",
                    subject_id="BUSINESS_HEAD",
                    permission_code=code,
                    effect="ALLOW",
                    scope_type="ROLE",
                    scope_id="BUSINESS_HEAD",
                )
            )

    if (
        not db.query(PermissionRule)
        .filter(PermissionRule.subject_id == "TENDER_ANALYST")
        .first()
    ):
        analyst_allowed = [
            "tender.view",
            "document.view",
            "document.preview",
            "document.download",
            "document.upload",
            "task.view",
            "task.edit",
        ]
        for pcode in analyst_allowed:
            db.add(
                PermissionRule(
                    subject_type="ROLE",
                    subject_id="TENDER_ANALYST",
                    permission_code=pcode,
                    effect="ALLOW",
                    scope_type="ROLE",
                    scope_id="TENDER_ANALYST",
                )
            )

    db.commit()
