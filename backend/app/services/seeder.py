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
        "id": "USR-SYS-01",
        "name": "System Administrator",
        "email": "admin@tendertracker.org",
        "password": "Admin@1234!",
        "role": "SUPER_ADMIN",
        "title": "System Administrator",
        "department": "IT & Systems",
        "max_capacity": 99,
        "avatar": "SA",
    },
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


def seed_database(db: Session):
    """
    Production-ready initial seeder.
    Seeds only necessary infrastructure:
    - System Settings (timeouts, currency defaults)
    - Procurement Taxonomy Categories
    - Standard RBAC Permissions Catalog & Baseline Role Rules
    - Production Super Admin Account (admin@tendertracker.com / Admin@2026!)
    NO dummy tenders, dummy documents, dummy visits, or mock chats are seeded.
    """
    # 0. Seed System Settings
    for s in INITIAL_SETTINGS:
        if not db.query(SystemSetting).filter(SystemSetting.key == s["key"]).first():
            db.add(
                SystemSetting(key=s["key"], value=s["value"], category=s["category"])
            )
    db.commit()

    # 1. Seed Tender Categories (Taxonomy Classification)
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

    # 2. Seed Standard Permissions Catalog
    for code, name, module, action in STANDARD_PERMISSIONS:
        if not db.query(Permission).filter(Permission.code == code).first():
            db.add(Permission(code=code, name=name, module=module, action=action))
    db.commit()

    # 3. Seed Baseline Role Rules for RBAC
    if (
        not db.query(PermissionRule)
        .filter(PermissionRule.subject_id == "SUPER_ADMIN")
        .first()
    ):
        for code, _, _, _ in STANDARD_PERMISSIONS:
            db.add(
                PermissionRule(
                    subject_type="ROLE",
                    subject_id="SUPER_ADMIN",
                    permission_code=code,
                    effect="ALLOW",
                    scope_type="ROLE",
                    scope_id="SUPER_ADMIN",
                )
            )

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
        .filter(PermissionRule.subject_id == "EXECUTIVE_MANAGER")
        .first()
    ):
        for code, _, _, _ in STANDARD_PERMISSIONS:
            db.add(
                PermissionRule(
                    subject_type="ROLE",
                    subject_id="EXECUTIVE_MANAGER",
                    permission_code=code,
                    effect="ALLOW",
                    scope_type="ROLE",
                    scope_id="EXECUTIVE_MANAGER",
                )
            )

    if (
        not db.query(PermissionRule)
        .filter(PermissionRule.subject_id == "SENIOR_MANAGER")
        .first()
    ):
        for code, _, _, _ in STANDARD_PERMISSIONS:
            db.add(
                PermissionRule(
                    subject_type="ROLE",
                    subject_id="SENIOR_MANAGER",
                    permission_code=code,
                    effect="ALLOW",
                    scope_type="ROLE",
                    scope_id="SENIOR_MANAGER",
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

    # 4. Seed Production Super Admin Account
    admin_emails = ["admin@tendertracker.com", "admin@tendertracker.io"]
    existing_admin = db.query(User).filter(User.email.in_(admin_emails)).first()
    if not existing_admin:
        db.add(
            User(
                id="USR-ADMIN-01",
                name="System Administrator",
                email="admin@tendertracker.com",
                hashed_password=get_password_hash("Admin@2026!"),
                role="SUPER_ADMIN",
                title="System Administrator",
                department="Operations & Governance",
                max_capacity=10,
                avatar="SA",
            )
        )
        db.commit()
