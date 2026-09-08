import json
import os
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.tender import Tender, TenderDecisionMatrix, TenderCategory
from app.models.task import TenderTask
from app.models.document import TenderDocument, ReusableDocument
from app.models.company_credential import CompanyProjectCredential
from app.models.company_profile import CompanyProfile
from app.models.requirement import TenderRequirement
from app.models.review import TenderReviewTier
from app.models.comment import TenderComment
from app.models.organization import Organization
from app.models.permission import (
    Permission,
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
)
from app.models.setting import SystemSetting
from app.models.chat import ChatChannelMessage
from app.models.client_visit import ClientVisit
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

INITIAL_SETTINGS = [
    {
        "key": "vault_path",
        "value": "H:/Tender tracker v2/storage/tenders",
        "category": "STORAGE",
    },
    {"key": "alert_threshold_hours", "value": "48", "category": "ALERTS"},
    {"key": "gatekeeper_sla_hours", "value": "48", "category": "ALERTS"},
    {"key": "enable_sha_verification", "value": "true", "category": "SECURITY"},
    {"key": "smtp_server", "value": "smtp.tendertracker.internal", "category": "SMTP"},
    {"key": "smtp_port", "value": "587", "category": "SMTP"},
    {
        "key": "sender_email",
        "value": "notifications@tendertracker.enterprise",
        "category": "SMTP",
    },
    {"key": "notify_deadlines", "value": "true", "category": "SMTP"},
    {"key": "notify_sign_offs", "value": "true", "category": "SMTP"},
    {"key": "notify_blockers", "value": "true", "category": "SMTP"},
]

INITIAL_CHANNEL_MESSAGES = [
    {
        "id": "MSG-INIT-01",
        "channel_id": "general-ops",
        "sender_name": "Sarah Jenkins",
        "sender_role": "Director of Procurement & Bid Capture",
        "sender_avatar": "SJ",
        "content": "Good morning team. Please review the weekly bid pipeline targets. We have two critical submissions due in the next 10 days.",
    },
    {
        "id": "MSG-INIT-02",
        "channel_id": "general-ops",
        "sender_name": "Dr. Marcus Vance",
        "sender_role": "Head of Technical Architecture & Delivery",
        "sender_avatar": "MV",
        "content": "Technical architecture diagrams and bill-of-quantities for the European DG modernization tender have been uploaded to the vault.",
    },
    {
        "id": "MSG-INIT-03",
        "channel_id": "tender-radar",
        "sender_name": "Elena Rostova",
        "sender_role": "Senior Bid Analyst & Compliance Lead",
        "sender_avatar": "ER",
        "content": "New RFP spotted on UNGM portal: Renewable Solar Microgrid Monitoring System in East Africa. Intake specifications drafted.",
    },
    {
        "id": "MSG-INIT-04",
        "channel_id": "compliance-desk",
        "sender_name": "Elena Rostova",
        "sender_role": "Senior Bid Analyst & Compliance Lead",
        "sender_avatar": "ER",
        "content": "Reminder: All subcontractor tax clearance certificates must have at least 60 days validity remaining prior to submission lock.",
    },
    {
        "id": "MSG-INIT-05",
        "channel_id": "commercial-pricing",
        "sender_name": "Tariq Al-Mansoor",
        "sender_role": "Commercial Pricing & Contracts Director",
        "sender_avatar": "TA",
        "content": "Foreign exchange rate sensitivity modeling has been applied with a 3.5% buffer for multilateral USD contracts.",
    },
]


def seed_database(db: Session):
    # 0. Seed System Settings
    for s in INITIAL_SETTINGS:
        if not db.query(SystemSetting).filter(SystemSetting.key == s["key"]).first():
            db.add(
                SystemSetting(key=s["key"], value=s["value"], category=s["category"])
            )
    db.commit()

    # 0.1 Seed Channel Messages
    for msg in INITIAL_CHANNEL_MESSAGES:
        if (
            not db.query(ChatChannelMessage)
            .filter(ChatChannelMessage.id == msg["id"])
            .first()
        ):
            db.add(
                ChatChannelMessage(
                    id=msg["id"],
                    channel_id=msg["channel_id"],
                    sender_name=msg["sender_name"],
                    sender_role=msg["sender_role"],
                    sender_avatar=msg["sender_avatar"],
                    content=msg["content"],
                )
            )
    db.commit()

    # 0.2 Seed Tender Categories
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

    # 2.5 Seed Procuring Organizations
    orgs_file = Path(__file__).parent / "mock_organizations_seed.json"
    if orgs_file.exists():
        try:
            with open(orgs_file, "r", encoding="utf-8") as f:
                orgs_data = json.load(f)
                for org in orgs_data:
                    if (
                        not db.query(Organization)
                        .filter(Organization.id == org["id"])
                        .first()
                    ):
                        db.add(
                            Organization(
                                id=org["id"],
                                name=org["name"],
                                short_name=org.get("shortName"),
                                type=org.get("type", "GOVERNMENT"),
                                parent_id=org.get("parentId"),
                                country=org.get("country", "Bangladesh"),
                                website=org.get("website"),
                                priority=org.get("priority", "MEDIUM"),
                                aliases_json=json.dumps(org.get("aliases", [])),
                                description=org.get("description"),
                            )
                        )
                db.commit()
        except Exception as e:
            print(f"Error seeding organizations: {e}")

    # 3. Seed Primary Tenders (from mock_tenders_seed.json + fallback defaults)
    tenders_file = Path(__file__).parent / "mock_tenders_seed.json"
    if tenders_file.exists():
        try:
            with open(tenders_file, "r", encoding="utf-8") as f:
                mock_tenders_data = json.load(f)
                for t_data in mock_tenders_data:
                    t_id = t_data["id"]
                    existing_t = db.query(Tender).filter(Tender.id == t_id).first()
                    if existing_t:
                        if not existing_t.summary_json and t_data.get("summary"):
                            existing_t.summary_json = json.dumps(t_data.get("summary"))
                        dm = t_data.get("decisionMatrix")
                        if dm and not existing_t.decision_matrix:
                            db.add(
                                TenderDecisionMatrix(
                                    tender_id=t_id,
                                    technical_score=dm.get("technical", 0.0),
                                    financial_score=dm.get("financial", 0.0),
                                    team_score=dm.get("team", 0.0),
                                    sla_score=dm.get("sla", 0.0),
                                    composite_score=dm.get("aggregateScore", 0.0),
                                    threshold=70.0,
                                    status=t_data.get("decision", "PENDING"),
                                    rationale=dm.get("rationale"),
                                )
                            )
                        reqs = t_data.get("requirements", [])
                        for req in reqs:
                            if (
                                not db.query(TenderRequirement)
                                .filter(TenderRequirement.id == req["id"])
                                .first()
                            ):
                                db.add(
                                    TenderRequirement(
                                        id=req["id"],
                                        tender_id=t_id,
                                        title=req.get(
                                            "title", "Compliance Requirement"
                                        ),
                                        category=req.get("category", "Statutory"),
                                        status=req.get("status", "PENDING"),
                                        owner=req.get("owner", "Tariq Al-Mansoor"),
                                    )
                                )
                    else:
                        lead = t_data.get("leadOwner", {})
                        new_t = Tender(
                            id=t_id,
                            reference_no=t_data.get("referenceNo", ""),
                            title=t_data.get("title", "Untitled Tender Opportunity"),
                            organization=t_data.get(
                                "organization", "Procuring Authority"
                            ),
                            country=t_data.get("country", "Bangladesh"),
                            category=t_data.get("category", "General"),
                            estimated_value=(
                                t_data.get("estimatedValue")
                                if t_data.get("estimatedValue") is not None
                                else 0.0
                            ),
                            stage=t_data.get("stage", "DISCOVERED"),
                            decision=t_data.get("decision", "PENDING"),
                            priority=t_data.get("priority", "MEDIUM"),
                            submission_deadline=t_data.get("submissionDeadline"),
                            days_remaining=t_data.get("daysRemaining", 0),
                            hours_remaining=t_data.get("hoursRemaining", 0),
                            readiness_score=t_data.get("readinessScore", 0),
                            lead_owner_name=(
                                lead.get("name", "Sarah Jenkins")
                                if isinstance(lead, dict)
                                else "Sarah Jenkins"
                            ),
                            lead_owner_role=(
                                lead.get("role", "Business Head")
                                if isinstance(lead, dict)
                                else "Business Head"
                            ),
                            tender_type=t_data.get("tenderType")
                            or t_data.get("tender_type")
                            or "International Competitive Bidding (ICB)",
                            budget_type=t_data.get("budgetType")
                            or t_data.get("budget_type")
                            or "Development Budget (ADP / Capex)",
                            source_of_fund=t_data.get("sourceOfFund")
                            or t_data.get("source_of_fund")
                            or "Government Treasury (GoB)",
                            procurement_method=t_data.get("procurementMethod")
                            or t_data.get("procurement_method")
                            or "Quality & Cost Based Selection (QCBS)",
                            summary_json=(
                                json.dumps(t_data.get("summary"))
                                if t_data.get("summary")
                                else None
                            ),
                        )
                        db.add(new_t)
                        db.flush()
                        ensure_tender_directories(t_id)

                        # Decision Matrix
                        dm = t_data.get("decisionMatrix")
                        if dm:
                            db.add(
                                TenderDecisionMatrix(
                                    tender_id=t_id,
                                    technical_score=dm.get("technical", 0.0),
                                    financial_score=dm.get("financial", 0.0),
                                    team_score=dm.get("team", 0.0),
                                    sla_score=dm.get("sla", 0.0),
                                    composite_score=dm.get("aggregateScore", 0.0),
                                    threshold=70.0,
                                    status=t_data.get("decision", "PENDING"),
                                    rationale=dm.get("rationale"),
                                )
                            )

                        # Tasks
                        tasks = t_data.get("tasks", [])
                        for tsk in tasks:
                            db.add(
                                TenderTask(
                                    id=tsk["id"],
                                    tender_id=t_id,
                                    title=tsk.get("title", "Review Specifications"),
                                    assignee=tsk.get("assignee", "Sarah Jenkins"),
                                    status=tsk.get("status", "TODO"),
                                    priority=tsk.get("priority", "MEDIUM"),
                                    due_date=tsk.get("deadline"),
                                )
                            )

                        # Requirements
                        reqs = t_data.get("requirements", [])
                        for req in reqs:
                            db.add(
                                TenderRequirement(
                                    id=req["id"],
                                    tender_id=t_id,
                                    title=req.get("title", "Compliance Requirement"),
                                    category=req.get("category", "Statutory"),
                                    status=req.get("status", "PENDING"),
                                    owner=req.get("owner", "Tariq Al-Mansoor"),
                                )
                            )

                        # Documents
                        docs = t_data.get("documents", [])
                        for doc in docs:
                            db.add(
                                TenderDocument(
                                    id=doc["id"],
                                    tender_id=t_id,
                                    name=doc.get("name", "document.pdf"),
                                    folder=doc.get(
                                        "folder", "01_original_tender_documents"
                                    ),
                                    size=doc.get("size", "1.5 MB"),
                                    revision=doc.get("revision", "v1.0"),
                                    sha256=doc.get(
                                        "sha256",
                                        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                                    ),
                                    uploaded_at=doc.get("uploadedAt", "2026-09-01"),
                                    access_level=doc.get("accessLevel", "ALL_TEAM"),
                                )
                            )

                        # Reviews
                        revs = t_data.get("reviews", [])
                        if revs:
                            for rev in revs:
                                db.add(
                                    TenderReviewTier(
                                        tender_id=t_id,
                                        tier_number=rev.get("tierNumber", 1),
                                        tier_name=rev.get("name", "Review Tier"),
                                        role_required="EXECUTIVE_MANAGER",
                                        sign_off_status=rev.get("status", "PENDING"),
                                        signed_off_by=rev.get("reviewer"),
                                        signed_off_at=rev.get("date"),
                                        comments=rev.get("comments"),
                                    )
                                )
                        else:
                            tiers = [
                                (1, "Technical Architecture", "EXECUTIVE_MANAGER"),
                                (2, "Financial Feasibility", "SENIOR_MANAGER"),
                                (3, "Legal & Governance", "TENDER_ANALYST"),
                                (4, "Executive Sign-Off", "BUSINESS_HEAD"),
                            ]
                            for num, name, role in tiers:
                                db.add(
                                    TenderReviewTier(
                                        tender_id=t_id,
                                        tier_number=num,
                                        tier_name=name,
                                        role_required=role,
                                        sign_off_status=(
                                            "APPROVED"
                                            if t_data.get("stage") == "SUBMITTED"
                                            else (
                                                "ACTION_REQUIRED"
                                                if num == 1
                                                else "WAITING"
                                            )
                                        ),
                                    )
                                )
                db.commit()
        except Exception as e:
            print(f"Error seeding mock tenders: {e}")

    # Fallback seed if database still has no tenders
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
        ("document.preview", "In-Browser Document Preview", "document", "preview"),
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
            "Access Control & Ceilings",
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

    # 13. Company Project Experience Credentials (Work Order, Completion Cert, and Dynamic Fields)
    if not db.query(CompanyProjectCredential).first():
        initial_projects = [
            CompanyProjectCredential(
                id="PROJ-001",
                company_name="PrimeTech Ltd",
                company_role="LEAD_BIDDER",
                project_title="National Optical Fiber Transmission Backbone Network Phase-III",
                client_name="Bangladesh Telecommunications Company Limited (BTCL)",
                contract_value=48500000.0,
                currency="BDT",
                start_date="2023-01-15",
                completion_date="2025-06-30",
                role_in_project="Prime EPC Turnkey Contractor",
                work_order_filename="BTCL_WO_Optical_Fiber_Turnkey_2023.pdf",
                work_order_size="3.2 MB",
                work_order_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                completion_cert_filename="BTCL_Completion_Certificate_Phase_III.pdf",
                completion_cert_size="1.8 MB",
                completion_cert_sha256="ca978112ca1bbdcafac231b39a23dc4da786081cd1e14eed647f431a39e5047a",
                custom_fields=[
                    {
                        "id": "cf-1",
                        "name": "Supervising Consultant",
                        "value": "SMEC International Pty Ltd",
                    },
                    {
                        "id": "cf-2",
                        "name": "Key Technology Stack",
                        "value": "DWDM 100G, Cisco ASR 9000, Corning SMF-28e",
                    },
                    {
                        "id": "cf-3",
                        "name": "Client Focal Contact",
                        "value": "Engr. M. Rahman (Project Director), +880-1711-XXXXXX",
                    },
                ],
            ),
            CompanyProjectCredential(
                id="PROJ-002",
                company_name="PrimeTech Ltd",
                company_role="LEAD_BIDDER",
                project_title="Tier-IV Data Center Cloud Migration & Security Operations Center",
                client_name="Information and Communication Technology (ICT) Division",
                contract_value=32000000.0,
                currency="BDT",
                start_date="2024-02-01",
                completion_date="2025-11-20",
                role_in_project="Lead Contractor",
                work_order_filename="ICTD_WO_DataCenter_SOC_Deployment.pdf",
                work_order_size="2.6 MB",
                completion_cert_filename="ICTD_Performance_Certificate_Accepted.pdf",
                completion_cert_size="1.4 MB",
                custom_fields=[
                    {
                        "id": "cf-4",
                        "name": "Security Compliance Standard",
                        "value": "ISO 27001:2022 & NIST CSF Level 3",
                    },
                    {
                        "id": "cf-5",
                        "name": "SLA Guaranteed Uptime",
                        "value": "99.982% Financial Uptime Guarantee",
                    },
                ],
            ),
            CompanyProjectCredential(
                id="PROJ-003",
                company_name="DataCore Systems Ltd",
                company_role="JV_PARTNER",
                project_title="Automated Metering Infrastructure & Smart Grid SCADA Integration",
                client_name="Dhaka Electric Supply Company (DESCO)",
                contract_value=27500000.0,
                currency="BDT",
                start_date="2023-08-10",
                completion_date="2025-04-15",
                role_in_project="Joint Venture Technical Partner",
                work_order_filename="DESCO_AMI_SCADA_WorkOrder_Signed.pdf",
                work_order_size="4.1 MB",
                completion_cert_filename="DESCO_Final_Acceptance_Certificate_2025.pdf",
                completion_cert_size="2.1 MB",
                custom_fields=[
                    {
                        "id": "cf-6",
                        "name": "JV Equity & Quota Share",
                        "value": "40% Technical & Automation Share",
                    },
                    {
                        "id": "cf-7",
                        "name": "Smart Meters Deployed",
                        "value": "250,000 Cellular NB-IoT Smart Meters",
                    },
                ],
            ),
        ]
        for p in initial_projects:
            db.add(p)

    # 13. Seed Company Profiles if not present
    if db.query(CompanyProfile).count() == 0:
        initial_profiles = [
            CompanyProfile(
                id="COMP-PRIMETECH",
                legal_name="PrimeTech Solutions Limited",
                trade_name="PrimeTech Ltd",
                company_role="LEAD_BIDDER",
                entity_type="Private Limited Company",
                registration_no="C-114829/2014",
                incorporation_date="2014-03-15",
                country="Bangladesh",
                status="VERIFIED",
                business_nature="Enterprise Systems Integration, Optical Fiber Backbone Construction, Cloud Infrastructure, and Mission-Critical Turnkey Solutions.",
                logo_url="/assets/logos/primetech.png",
                # Statutory & Tax
                tin_number="817294029148",
                bin_vat_number="001849204-0101",
                trade_license_no="TRAD/DNCC/049281/2025",
                trade_license_expiry="2026-06-30",
                trade_license_issuer="Dhaka North City Corporation (Zone-03)",
                tax_circle_zone="Circle-114 (Companies), Taxes Zone-06, Dhaka",
                rjsc_return_year="2025",
                irc_erc_no="IRC-BD-2940194",
                # Registered Office & Communication
                registered_address="Level 11 & 12, Prime Tower, Plot 42, Road 11, Block D, Banani C/A, Dhaka-1213, Bangladesh",
                operational_address="Technology Center, Sector-03, Uttara, Dhaka-1230, Bangladesh",
                official_email="bids@primetech.com.bd",
                billing_email="accounts@primetech.com.bd",
                phone="+880-2-9824001",
                fax="+880-2-9824005",
                website="https://www.primetech.com.bd",
                # Focal Person & Authorized Signatory
                contact_person_name="Mahmudur Rahman, PMP",
                contact_person_title="Vice President, Tender Capture & Public Bids",
                contact_person_phone="+880-1711-849201",
                contact_person_email="m.rahman@primetech.com.bd",
                signatory_name="Engr. K. M. Shamsuddin",
                signatory_title="Managing Director & Chief Executive Officer",
                signatory_nid="19822694109400012",
                power_of_attorney_ref="Board Resolution 2024/09 & Registered General Power of Attorney No. 4410",
                # Banking & Financials
                bank_name="Eastern Bank PLC",
                bank_branch="Gulshan Corporate Branch, Dhaka",
                bank_account_name="PrimeTech Solutions Limited - Tender & Operational A/C",
                bank_account_no="1041060284910",
                routing_no="095261452",
                swift_code="EBLDBDDH",
                audited_turnover_bdt=185000000.0,
                audited_turnover_usd=1516393.0,
                bank_solvency_limit_bdt=75000000.0,
                paid_up_capital_bdt=50000000.0,
                authorized_capital_bdt=100000000.0,
                credit_rating="AA+ (Long Term) / ST-1 (Short Term)",
                credit_rating_validity="2026-11-30",
                # Certifications & Capacity
                certifications=[
                    "ISO 9001:2015 (Quality Management System)",
                    "ISO 27001:2022 (Information Security Management System)",
                    "ISO 14001:2015 (Environmental Management System)",
                    "CMMI Maturity Level 3 (Dev v2.0)",
                    "BASIS Member No. G-842",
                    "FBCCI Associate Corporate Member No. 2019-114",
                ],
                core_competencies=[
                    "DWDM & Optical Fiber Backbone EPC",
                    "Tier-III/Tier-IV Cloud Data Center Deployments",
                    "Security Operations Center (SOC) & Cyber Defense",
                    "National Smart Grid SCADA & Automation",
                    "Enterprise ERP & e-Governance Portal Development",
                ],
                total_employees=142,
                certified_engineers=46,
                # Dynamic Custom Fields
                custom_fields=[
                    {
                        "id": "cf-pt-1",
                        "name": "Bidding Entity Classification",
                        "value": "Lead Bidder / Consortium Principal Contractor",
                    },
                    {
                        "id": "cf-pt-2",
                        "name": "BAPA Registration No",
                        "value": "BAPA-EPC-2022-841",
                    },
                    {
                        "id": "cf-pt-3",
                        "name": "Default Tender Security Bank Guarantee Provider",
                        "value": "Eastern Bank PLC & City Bank PLC (Irrevocable & On-Demand)",
                    },
                    {
                        "id": "cf-pt-4",
                        "name": "Audit Firm of Record",
                        "value": "A. Qasem & Co. Chartered Accountants (Member Firm of BDO International)",
                    },
                ],
            ),
            CompanyProfile(
                id="COMP-DATACORE",
                legal_name="DataCore Systems Limited",
                trade_name="DataCore Systems Ltd",
                company_role="JV_PARTNER",
                entity_type="Private Limited Company",
                registration_no="C-148291/2018",
                incorporation_date="2018-09-22",
                country="Bangladesh",
                status="VERIFIED",
                business_nature="Smart Grid Automation, AMI Infrastructure, Industrial IoT Sensor Networks, and SCADA Engineering.",
                logo_url="/assets/logos/datacore.png",
                # Statutory & Tax
                tin_number="649102849103",
                bin_vat_number="002948102-0202",
                trade_license_no="TRAD/DSCC/019284/2025",
                trade_license_expiry="2026-06-30",
                trade_license_issuer="Dhaka South City Corporation (Zone-05)",
                tax_circle_zone="Circle-082 (Companies), Taxes Zone-04, Dhaka",
                rjsc_return_year="2025",
                irc_erc_no="IRC-BD-8491022",
                # Registered Office & Communication
                registered_address="Suite 802, High-Tech Tower, Karwan Bazar, Dhaka-1215, Bangladesh",
                operational_address="Smart Grid Lab & Testing Center, Mirpur DOHS, Dhaka-1216, Bangladesh",
                official_email="jv-tenders@datacoresystems.com",
                billing_email="finance@datacoresystems.com",
                phone="+880-2-8149202",
                fax="+880-2-8149203",
                website="https://www.datacoresystems.com",
                # Focal Person & Authorized Signatory
                contact_person_name="Tanvir Hossain, CISA",
                contact_person_title="Director, Government Solutions & Strategic Partnerships",
                contact_person_phone="+880-1819-204910",
                contact_person_email="tanvir.h@datacoresystems.com",
                signatory_name="S. M. Nazmul Huda",
                signatory_title="Chief Executive Officer",
                signatory_nid="19862691029400088",
                power_of_attorney_ref="Power of Attorney Deed No. 1092 / Certified RJSC Resolution",
                # Banking & Financials
                bank_name="The City Bank PLC",
                bank_branch="Principal Branch, Dilkusha, Dhaka",
                bank_account_name="DataCore Systems Limited",
                bank_account_no="3101849201001",
                routing_no="225260142",
                swift_code="CIBLBDDH",
                audited_turnover_bdt=92000000.0,
                audited_turnover_usd=754098.0,
                bank_solvency_limit_bdt=35000000.0,
                paid_up_capital_bdt=25000000.0,
                authorized_capital_bdt=50000000.0,
                credit_rating="A+ (Long Term)",
                credit_rating_validity="2026-10-15",
                # Certifications & Capacity
                certifications=[
                    "ISO 9001:2015 (Quality Management System)",
                    "ISO 27001:2022 (ISMS Certification)",
                    "BASIS Corporate Member No. M-1092",
                    "BCS (Bangladesh Computer Samity) Member",
                ],
                core_competencies=[
                    "AMI / Smart Metering Protocol Integration (DLMS/COSEM)",
                    "Substation Automation & DNP3 / IEC 61850 Architecture",
                    "Industrial IoT Gateways & Edge Computing",
                    "Power Distribution SCADA Operations",
                ],
                total_employees=68,
                certified_engineers=28,
                # Dynamic Custom Fields
                custom_fields=[
                    {
                        "id": "cf-dc-1",
                        "name": "JV Agreement Quota Capacity",
                        "value": "Up to 49% Joint Venture Equity Participation",
                    },
                    {
                        "id": "cf-dc-2",
                        "name": "DLMS/COSEM Compliance Lab Certificate",
                        "value": "Certified DLMS Conformance ID #2024-819",
                    },
                ],
            ),
        ]
        for cp in initial_profiles:
            db.add(cp)

    # 13. Seed Client Visits & Scheduled Meetings
    if db.query(ClientVisit).count() == 0:
        initial_visits = [
            ClientVisit(
                id="VISIT-2026-001",
                title="Pre-Bid Architecture Clarification & Sovereign Cloud Specs",
                client_organization="United Nations Development Programme (UNDP)",
                organization_id="ORG-101",
                tender_id="TDR-PRC0190428",
                visitor_name="Dr. Amina Osei",
                visitor_designation="Senior Technical Procurement Specialist",
                visitor_phone="+233 24 555 0192",
                visitor_email="amina.osei@undp.org",
                accompanying_persons=[
                    {"name": "Kwame Mensah", "role": "IT Infrastructure Lead"},
                    {
                        "name": "Elena Rostova",
                        "role": "UN Regional Procurement Officer",
                    },
                ],
                internal_host_name="Sarah Jenkins",
                internal_host_role="Business Head",
                visit_type="PRE_BID_MEETING",
                status="COMPLETED",
                scheduled_start="2026-09-04T10:00:00",
                scheduled_end="2026-09-04T12:30:00",
                actual_check_in="2026-09-04T09:52:00",
                actual_check_out="2026-09-04T12:45:00",
                location_or_room="Executive Boardroom A (HQ)",
                meeting_link=None,
                agenda="Review of data sovereignty requirements, Tier-III DC replication SLAs, and ISO 27001 audit standards.",
                discussion_notes="UNDP delegation was very satisfied with our multi-region failover demo. Clarified that local joint venture partnership is encouraged but not mandatory. Confirmed bid submission deadline extension to Sept 16.",
                action_items=[
                    {
                        "task": "Provide certified ISO 27001 audit report copy to UNDP procurement desk",
                        "owner": "Sarah Jenkins",
                        "deadline": "2026-09-10",
                        "is_done": True,
                    },
                    {
                        "task": "Update Financial Model to reflect 3-year multi-tier SaaS escalation structure",
                        "owner": "Financial Lead",
                        "deadline": "2026-09-11",
                        "is_done": True,
                    },
                ],
                sentiment_outcome="CRITICAL_BREAKTHROUGH",
            ),
            ClientVisit(
                id="VISIT-2026-002",
                title="Executive Courtesy Call & ERP Modernization Roadmap Review",
                client_organization="European Commission — DG DIGIT",
                organization_id="ORG-102",
                tender_id="TDR-2026-EU-089",
                visitor_name="Marc Vandenberg",
                visitor_designation="Director of Digital Modernization",
                visitor_phone="+32 2 299 11 11",
                visitor_email="marc.vandenberg@ec.europa.eu",
                accompanying_persons=[
                    {"name": "Sophie Dubois", "role": "Principal Systems Architect"},
                ],
                internal_host_name="Sarah Jenkins",
                internal_host_role="Business Head",
                visit_type="IN_PERSON_OFFICE",
                status="CHECKED_IN",
                scheduled_start="2026-09-08T14:00:00",
                scheduled_end="2026-09-08T16:00:00",
                actual_check_in="2026-09-08T13:50:00",
                actual_check_out=None,
                location_or_room="Innovation Hub Conference Suite (Level 4)",
                meeting_link=None,
                agenda="Discussion on modular ERP migration milestones, open API gateways, and multi-tenant security guarantees.",
                discussion_notes="Currently in progress. Visitor presented European interoperability framework constraints.",
                action_items=[
                    {
                        "task": "Submit updated Form Tech-4 Architecture Blueprint",
                        "owner": "Technical Architect",
                        "deadline": "2026-09-12",
                        "is_done": False,
                    }
                ],
                sentiment_outcome="POSITIVE",
            ),
            ClientVisit(
                id="VISIT-2026-003",
                title="Telemedicine Platform Security & Compliance Audit Briefing",
                client_organization="World Bank Group (Health Sector Development)",
                organization_id="ORG-103",
                tender_id="TDR-2026-WB-104",
                visitor_name="Dr. Rajesh Patel",
                visitor_designation="Lead Health Informatics Specialist",
                visitor_phone="+1 202 473 1000",
                visitor_email="rpatel@worldbank.org",
                accompanying_persons=[],
                internal_host_name="Sarah Jenkins",
                internal_host_role="Business Head",
                visit_type="VIRTUAL_CONFERENCE",
                status="CONFIRMED",
                scheduled_start="2026-09-10T15:00:00",
                scheduled_end="2026-09-10T16:30:00",
                actual_check_in=None,
                actual_check_out=None,
                location_or_room="Virtual Microsoft Teams Room",
                meeting_link="https://teams.microsoft.com/l/meetup-join/worldbank-health-rfp-2026",
                agenda="Review of HL7 / FHIR data exchange protocols and patient data encryption at rest (AES-256).",
                discussion_notes=None,
                action_items=[
                    {
                        "task": "Prepare HL7 FHIR compliance matrix and API sandbox credentials",
                        "owner": "Lead Solutions Engineer",
                        "deadline": "2026-09-09",
                        "is_done": False,
                    }
                ],
                sentiment_outcome="POSITIVE",
            ),
            ClientVisit(
                id="VISIT-2026-004",
                title="Smart Grid SCADA Hardening & Substation Site Inspection Alignment",
                client_organization="Asian Development Bank (ADB) / Power Grid Corp",
                organization_id="ORG-104",
                tender_id="TDR-2026-ADB-215",
                visitor_name="Hiroshi Tanaka",
                visitor_designation="Chief Energy Sector Specialist",
                visitor_phone="+63 2 8632 4444",
                visitor_email="htanaka@adb.org",
                accompanying_persons=[
                    {"name": "Engr. Tariqul Islam", "role": "Executive Engineer, PGCB"},
                ],
                internal_host_name="Sarah Jenkins",
                internal_host_role="Business Head",
                visit_type="CLIENT_SITE_VISIT",
                status="SCHEDULED",
                scheduled_start="2026-09-14T09:30:00",
                scheduled_end="2026-09-14T13:00:00",
                actual_check_in=None,
                actual_check_out=None,
                location_or_room="PGCB National Load Dispatch Centre (NLDC), Aftabnagar",
                meeting_link=None,
                agenda="Physical site inspection of SCADA servers, backup power generators, and fiber telemetry patch panels.",
                discussion_notes=None,
                action_items=[],
                sentiment_outcome="POSITIVE",
            ),
        ]
        for v in initial_visits:
            db.add(v)

    db.commit()
