#!/usr/bin/env python3
"""
TenderTracker - Synthetic Demo Data Loader
==========================================

Fills every module of TenderTracker with realistic, made-up data so the system
can be demonstrated end to end:

  * 7 team members (plus the default admin) with CV dossiers
  * 41 tenders across every stage (Discovered -> Awarded / Lost / Declined / Archived)
    from real buyers (e-GP agencies, banks, UN agencies) but with INVENTED
    titles, reference numbers, values and outcomes
  * tasks, compliance requirements, documents (real PDF files), comments,
    decision matrices, financial models, amendments, submissions, post-award data
  * master document vault (with expiring documents), company profiles,
    past-project credentials, client visits, team chat, JV partners,
    permission rules, access blocks, audit logs and partner share links

All dates are calculated from the moment you run the script, so deadlines are
always "in N days". Run it again right before a demo to refresh the clock.

USAGE (from the backend folder, with your normal Python environment active)
--------------------------------------------------------------------------
  The demo uses its OWN database and file storage, so your real data is never
  touched:
      database : backend/tender_tracker_demo.db
      files    : storage/_demo/

  1. Load the demo data and start the API on the demo database:
         python scripts/seed_demo_data.py --serve
  2. In a second terminal start the frontend as usual:
         cd frontend
         npm run dev
  3. Open http://localhost:5173 and log in (see below).

  Other options:
      python scripts/seed_demo_data.py              load / refresh demo data only
      python scripts/seed_demo_data.py --serve-only start the API on the demo
                                                    database without reloading
      --port 8000        API port for --serve / --serve-only (default 8000)
      --db PATH          use another SQLite file for the demo
      --db-url URL       use a MySQL / PostgreSQL demo database instead
      --storage PATH     use another folder for demo files
      --force            wipe even if the target database holds tenders that
                         were NOT created by this script (never use this on
                         your production database)

  Note: do not point the normal server at the demo with
  DATABASE_URL=sqlite:///./something.db - the app's config rewrites every
  relative SQLite path to backend/tender_tracker.db (your main database).
  Use --serve / --serve-only, which pass an absolute path.

LIVE MODE (wipe the live database and load the demo data) - run ON THE SERVER
-----------------------------------------------------------------------------
  Uses the server's own backend/.env (DATABASE_URL, STORAGE_ROOT), so the data
  lands where the running backend reads it. Takes a full backup first.

      sudo -u tendertracker /opt/tender-tracker/backend/venv/bin/python \
          scripts/seed_demo_data.py --live --confirm-wipe <database name>

      --confirm-wipe NAME  required; must equal the database name in .env
      --backup-dir PATH    where the pre-wipe backup goes (default ../backups)
      --keep-users         keep existing user accounts (default: remove every
                           non-super-admin user, as part of the wipe)

  What the wipe removes: all tenders and their tasks, requirements, documents
  (database rows), comments, decisions, financial rules, submissions; the master
  document vault, company profiles, credentials, client visits, chat, JV
  partners, user/partner permission rules, access blocks, audit logs, share
  links, and (unless --keep-users) all users except super admins.
  What it keeps: super-admin accounts, organisations, categories, settings,
  role permission rules, and every file already in the storage folder (only the
  demo's own folders are replaced).

  Restore the backup (MySQL):
      mysql -h HOST -u USER -p DATABASE < backups/pre_demo_<database>_<time>.sql

Demo logins (password for all demo users: Demo@2026!)
      akib.mahamud@tendertracker.org      Business Head (sees everything)
      farhana.rahman@tendertracker.org    Executive Manager
      tanvir.hasan@tendertracker.org      Senior Manager (pricing)
      nusrat.jahan@tendertracker.org      Tender Analyst
      admin@tendertracker.com / Admin@2026!   default super admin (needed for the
                                              Access & Permissions console)

JV partner portal: open /jv and enter any email with token  DEMO-JV-2026
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import shutil
import sys
import textwrap
from datetime import datetime, timedelta, timezone
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))


def _parse_args():
    ap = argparse.ArgumentParser(description="Load synthetic demo data into a separate TenderTracker demo database.")
    ap.add_argument("--serve", action="store_true", help="load the demo data, then start the API on the demo database")
    ap.add_argument("--serve-only", action="store_true", help="start the API on the demo database without reloading data")
    ap.add_argument("--port", type=int, default=8000, help="API port (default 8000)")
    ap.add_argument("--db", default=None, help="SQLite file for the demo (default backend/tender_tracker_demo.db)")
    ap.add_argument("--db-url", default=None, help="full SQLAlchemy URL for a MySQL/PostgreSQL demo database")
    ap.add_argument("--storage", default=None, help="folder for demo files (default storage/_demo)")
    ap.add_argument("--force", action="store_true", help="wipe even if the database contains non-demo tenders")
    ap.add_argument("--live", action="store_true",
                    help="use the server's own .env database and storage (wipes live data; needs --confirm-wipe)")
    ap.add_argument("--confirm-wipe", default=None, metavar="DATABASE_NAME",
                    help="live mode: type the database name from .env to confirm the wipe")
    ap.add_argument("--backup-dir", default=None, help="live mode: folder for the pre-wipe backup (default ../backups)")
    ap.add_argument("--skip-backup", action="store_true", help="live mode: do not back up first (not recommended)")
    ap.add_argument("--keep-users", action="store_true", help="keep existing user accounts when wiping")
    ap.add_argument("--merge", action="store_true",
                    help="live mode: keep all existing data and only replace this script's own demo rows")
    args = ap.parse_args()
    if args.live and (args.db or args.db_url or args.storage or args.serve or args.serve_only):
        ap.error("--live uses backend/.env; do not combine it with --db, --db-url, --storage, --serve or --serve-only")
    return args


ARGS = _parse_args()
# Must be set BEFORE the app's settings are imported.
if not ARGS.live:
    os.environ["DATABASE_URL"] = ARGS.db_url or (
        "sqlite:///" + Path(ARGS.db or (BACKEND_DIR / "tender_tracker_demo.db")).resolve().as_posix())
    os.environ["STORAGE_ROOT"] = str(Path(ARGS.storage or (BACKEND_DIR.parent / "storage" / "_demo")).resolve())

from app.core.config import settings  # noqa: E402
from app.core.database import SessionLocal, Base, engine, run_migrations  # noqa: E402
import app.models  # noqa: E402,F401  (registers every model)
from app.core.security import get_password_hash  # noqa: E402
from app.services.seeder import seed_database  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.tender import Tender, TenderDecisionMatrix, TenderCategory, TenderSubmission  # noqa: E402
from app.models.task import TenderTask  # noqa: E402
from app.models.requirement import TenderRequirement  # noqa: E402
from app.models.document import TenderDocument, TenderFolder, ReusableDocument  # noqa: E402
from app.models.comment import TenderComment  # noqa: E402
from app.models.chat import ChatChannelMessage  # noqa: E402
from app.models.client_visit import ClientVisit  # noqa: E402
from app.models.company_profile import CompanyProfile  # noqa: E402
from app.models.company_credential import CompanyProjectCredential  # noqa: E402
from app.models.financial_rule import TenderFinancialRule  # noqa: E402
from app.models.organization import Organization  # noqa: E402
from app.models.setting import SystemSetting  # noqa: E402
from app.models.permission import (  # noqa: E402
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
    AuthorizationAuditLog,
    ResourceShare,
)

DHAKA = timezone(timedelta(hours=6))
NOW = datetime.now(DHAKA).replace(second=0, microsecond=0)
RNG = random.Random(2026)
DEMO_PASSWORD = "Demo@2026!"
DEMO_MARKER_KEY = "demo_data_seeded_at"
OUR_COMPANY = "PrimeTech Solutions Ltd"
SYNTHETIC_NOTE = "Synthetic demo record created by seed_demo_data.py. Not a real tender."


# ---------------------------------------------------------------------------
# Time helpers
# ---------------------------------------------------------------------------

def at(days: float = 0, hour: int | None = None, minute: int = 0) -> datetime:
    """Dhaka-time datetime relative to now; optionally snapped to a clock time."""
    dt = NOW + timedelta(days=days)
    if hour is not None:
        dt = dt.replace(hour=hour, minute=minute)
    return dt


def utc_naive(dt: datetime) -> datetime:
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def d(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def iso(dt: datetime) -> str:
    return dt.isoformat()


# ---------------------------------------------------------------------------
# Minimal dependency-free PDF writer (so previews and downloads work)
# ---------------------------------------------------------------------------

_ASCII_MAP = {
    "—": "-", "–": "-", "’": "'", "‘": "'", "“": '"',
    "”": '"', "•": "-", "৳": "BDT ", "×": "x", "≤": "<=",
    "≥": ">=", "→": "->", "…": "...",
}


def _ascii(s: str) -> str:
    for k, v in _ASCII_MAP.items():
        s = s.replace(k, v)
    return s.encode("latin-1", "replace").decode("latin-1")


def _pdf_escape(s: str) -> str:
    return _ascii(s).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def write_pdf(path: Path, title: str, meta: list[str], sections: list[tuple[str, list[str]]]) -> bytes:
    """Write a simple multi-page A4 PDF and return its bytes."""
    lines: list[tuple[str, int, str]] = []  # (font, size, text)
    lines.append(("F1", 8, "SYNTHETIC DEMO DOCUMENT - generated for a TenderTracker demonstration. Not a real tender document."))
    lines.append(("F1", 8, ""))
    for chunk in textwrap.wrap(title, 60) or [""]:
        lines.append(("F2", 16, chunk))
    lines.append(("F1", 10, ""))
    for m in meta:
        for chunk in textwrap.wrap(m, 95) or [""]:
            lines.append(("F1", 10, chunk))
    for heading, body in sections:
        lines.append(("F1", 10, ""))
        lines.append(("F2", 12, heading))
        for para in body:
            wrapped = textwrap.wrap(para, 92) or [""]
            for i, chunk in enumerate(wrapped):
                lines.append(("F1", 10, ("- " if i == 0 else "  ") + chunk))

    pages: list[list[tuple[str, int, str]]] = [[]]
    y = 800
    for font, size, text in lines:
        lead = size + 5
        if y - lead < 50:
            pages.append([])
            y = 800
        pages[-1].append((font, size, text))
        y -= lead

    objs: list[bytes] = []

    def add(obj: bytes) -> int:
        objs.append(obj)
        return len(objs)

    catalog_id = add(b"")  # placeholder
    pages_id = add(b"")
    f1 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    f2 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    page_ids = []
    total = len(pages)
    for pno, page in enumerate(pages, start=1):
        stream_parts = ["BT"]
        y = 800
        for font, size, text in page:
            lead = size + 5
            stream_parts.append(f"/{font} {size} Tf 1 0 0 1 50 {y} Tm ({_pdf_escape(text)}) Tj")
            y -= lead
        stream_parts.append(f"/F1 8 Tf 1 0 0 1 50 30 Tm (Page {pno} of {total}) Tj")
        stream_parts.append("ET")
        stream = "\n".join(stream_parts).encode("latin-1")
        content_id = add(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream")
        page_ids.append(add(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {f1} 0 R /F2 {f2} 0 R >> >> /Contents {content_id} 0 R >>".encode()
        ))
    objs[catalog_id - 1] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode()
    kids = " ".join(f"{p} 0 R" for p in page_ids)
    objs[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode()

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, obj in enumerate(objs, start=1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n".encode() + obj + b"\nendobj\n"
    xref_pos = len(out)
    out += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode()
    for off in offsets:
        out += f"{off:010d} 00000 n \n".encode()
    out += f"trailer\n<< /Size {len(objs) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode()

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(bytes(out))
    return bytes(out)


def file_meta(data: bytes) -> tuple[str, str]:
    size = len(data)
    size_str = f"{size / 1024:.1f} KB" if size < 1024 * 1024 else f"{size / 1024 / 1024:.1f} MB"
    return hashlib.sha256(data).hexdigest(), size_str


# ---------------------------------------------------------------------------
# Team
# ---------------------------------------------------------------------------

TEAM = [
    dict(id="USR-DEMO-01", name="Akib Mahamud", email="akib.mahamud@tendertracker.org", role="BUSINESS_HEAD",
         title="Head of Business Development", department="Business Development", cap=8, avatar="AM",
         designation="Bid Director", phone="+880 1700-000101"),
    dict(id="USR-DEMO-02", name="Farhana Rahman", email="farhana.rahman@tendertracker.org", role="EXECUTIVE_MANAGER",
         title="Head of Technical Solutions", department="Technical Solutions", cap=6, avatar="FR",
         designation="Technical Lead / Solution Architect", phone="+880 1700-000102"),
    dict(id="USR-DEMO-03", name="Tanvir Hasan", email="tanvir.hasan@tendertracker.org", role="SENIOR_MANAGER",
         title="Commercial & Pricing Manager", department="Commercial Finance", cap=6, avatar="TH",
         designation="Commercial Manager", phone="+880 1700-000103"),
    dict(id="USR-DEMO-04", name="Nusrat Jahan", email="nusrat.jahan@tendertracker.org", role="TENDER_ANALYST",
         title="Senior Tender Analyst", department="Bid Operations", cap=6, avatar="NJ",
         designation="Business Analyst", phone="+880 1700-000104"),
    dict(id="USR-DEMO-05", name="Rafiq Ahmed", email="rafiq.ahmed@tendertracker.org", role="TENDER_ANALYST",
         title="Compliance & Documentation Officer", department="Bid Operations", cap=5, avatar="RA",
         designation="Compliance Specialist", phone="+880 1700-000105"),
    dict(id="USR-DEMO-06", name="Sadia Islam", email="sadia.islam@tendertracker.org", role="TENDER_ANALYST",
         title="Bid Coordinator", department="Bid Operations", cap=5, avatar="SI",
         designation="Project Coordinator", phone="+880 1700-000106"),
    dict(id="USR-DEMO-07", name="Imran Chowdhury", email="imran.chowdhury@tendertracker.org", role="SENIOR_MANAGER",
         title="Principal Solution Architect", department="Technical Solutions", cap=5, avatar="IC",
         designation="Software Architect", phone="+880 1700-000107"),
]
TEAM_BY_NAME = {m["name"]: m for m in TEAM}

CV_DATA = {
    "Akib Mahamud": dict(
        certs=["PMP (Project Management Professional)", "CIPS Level 4 Procurement & Supply"],
        edu=[{"degree": "MBA (Marketing)", "institution": "University of Dhaka", "year": 2015},
             {"degree": "B.Sc. in Computer Science & Engineering", "institution": "North South University", "year": 2012}],
        past=[("e-GP Bid Management for Banking ICT Tenders", "Multiple state-owned banks", "Bid Director", "2021-2025",
               ["40+ bids submitted", "BDT 180 crore in awarded contracts"], ["e-GP", "MS Project"]),
              ("UN Agency Proposal Desk", "UNDP / UNICEF Bangladesh", "Proposal Manager", "2019-2021",
               ["RFP responses for digital platforms"], ["UNGM", "Quantum"])]),
    "Farhana Rahman": dict(
        certs=["TOGAF 9 Certified", "AWS Solutions Architect - Associate"],
        edu=[{"degree": "M.Sc. in Software Engineering", "institution": "BUET", "year": 2013}],
        past=[("Integrated Revenue Management System", "[Demo client] City Corporation", "Technical Lead", "2022-2024",
               ["Microservice architecture", "Bangla UI"], ["Java", "PostgreSQL", "Kubernetes"]),
              ("Hospital MIS rollout (12 hospitals)", "[Demo client] Health Directorate", "Solution Architect", "2019-2021",
               ["HL7 integration"], ["DHIS2", ".NET"])]),
    "Tanvir Hasan": dict(
        certs=["ACCA (Affiliate)"],
        edu=[{"degree": "BBA (Finance)", "institution": "IBA, University of Dhaka", "year": 2014}],
        past=[("Pricing desk for ICT supply and AMC tenders", "Various", "Commercial Manager", "2018-2025",
               ["BOQ costing", "Bank guarantees"], ["Excel", "e-GP"])]),
    "Nusrat Jahan": dict(
        certs=["CBAP (Certified Business Analysis Professional)"],
        edu=[{"degree": "B.Sc. in CSE", "institution": "Khulna University of Engineering & Technology", "year": 2018}],
        past=[("Tender analysis and summary desk", "Internal", "Senior Tender Analyst", "2021-2025",
               ["300+ tender summaries"], ["TenderTracker", "UNGM", "e-GP"])]),
    "Rafiq Ahmed": dict(
        certs=["ISO 27001 Lead Implementer"],
        edu=[{"degree": "LLB (Hons)", "institution": "University of Chittagong", "year": 2016}],
        past=[("Statutory compliance and document vault", "Internal", "Compliance Officer", "2020-2025",
               ["Zero disqualifications on documents in FY2025"], ["Document control"])]),
    "Sadia Islam": dict(
        certs=["PRINCE2 Foundation"],
        edu=[{"degree": "BBA (MIS)", "institution": "East West University", "year": 2019}],
        past=[("Bid coordination for e-GP submissions", "Internal", "Bid Coordinator", "2022-2025",
               ["Portal submissions", "Tender security tracking"], ["e-GP"])]),
    "Imran Chowdhury": dict(
        certs=["CISSP", "Oracle Certified Professional", "Red Hat Certified Engineer"],
        edu=[{"degree": "M.Sc. in Computer Science", "institution": "University of Dhaka", "year": 2011}],
        past=[("Data center modernisation", "[Demo client] State-owned bank", "Principal Architect", "2023-2024",
               ["DR site virtualization", "SAN migration"], ["VMware", "Oracle", "RHEL"]),
              ("Managed SOC design", "[Demo client] Telecom operator", "Security Architect", "2020-2022",
               ["SIEM onboarding of 400 devices"], ["SIEM", "SOAR"])]),
}


# ---------------------------------------------------------------------------
# Content profiles (scope, requirements, risks per type of tender)
# ---------------------------------------------------------------------------

P = {
    "software": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["Requirements study, SRS and system design approved by the client",
              "Web-based application with role-based access and multi-level approval workflow",
              "Bangla and English user interface",
              "Integration with existing systems through REST APIs",
              "Reporting dashboard with export to PDF and Excel",
              "Data migration from legacy records",
              "Security testing, UAT and go-live support"],
        techs=["Web-based application", "REST APIs", "Relational database (product not specified)",
               "Programming language or framework: Not specified in the tender documents."],
        ops=["Training for administrators and end users", "Hosting at the client's data center",
             "12 months warranty support after go-live", "Source code and documentation handover"],
        personnel=[("Team Leader / Project Manager", "Bachelor's in CSE/EEE; PMP preferred", "10 years, 5 in a similar role", "1"),
                   ("Software Architect", "Bachelor's in CSE", "8 years", "1"),
                   ("Senior Developer", "Bachelor's in CSE", "5 years", "3"),
                   ("Database Administrator", "Bachelor's in CSE", "5 years", "1"),
                   ("QA Engineer", "Bachelor's in CSE", "3 years", "1"),
                   ("Business Analyst", "Bachelor's degree", "5 years", "1")],
        hardware=[],
        risks=[("Tender Requirement", "Source code and IPR must be transferred to the client."),
               ("Tender Requirement", "Liquidated damages of 0.1% per day of delay, capped at 10%."),
               ("Analyst Observation", "Integration scope with legacy systems is not fully defined; clarify before pricing."),
               ("Analyst Observation", "Timeline is tight for a full SDLC including data migration.")],
        clauses=[("Source code and IPR ownership", "LEGAL_RISK", "HIGH", "GCC 22",
                  "All source code, documentation and IPR developed under the contract shall vest in the Purchaser.",
                  "Price must include full handover; reuse of our framework needs a carve-out."),
                 ("Payment only after UAT sign-off", "FINANCIAL", "MEDIUM", "SCC 12",
                  "Milestone payments are released only after UAT sign-off by the acceptance committee.",
                  "Cash-flow risk if UAT is delayed.")],
        reqs=[("CMMI Level 3 or ISO 9001 certificate", "Technical")],
        tech_docs=["Technical_Proposal.pdf", "Solution_Architecture.pdf", "Work_Plan_Gantt.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Prepare solution architecture and integration diagram", "Set up demo environment for presentation"],
        scenario="ADVANCE_AND_MILESTONES"),
    "cyber": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["24x7 Security Operations Center monitoring with defined SLAs",
              "SIEM deployment and log onboarding from servers, network and security devices",
              "Incident detection, triage and response playbooks",
              "Monthly vulnerability assessment and quarterly penetration testing",
              "Threat intelligence feeds and monthly executive reporting"],
        techs=["SIEM (product not specified)", "SOAR (optional)", "EDR integration",
               "Specific vendor: Not specified in the tender documents."],
        ops=["Onsite L1 analysts during business hours", "Remote L2/L3 support 24x7",
             "Response within 30 minutes for critical alerts", "Quarterly service review meetings"],
        personnel=[("SOC Manager", "Bachelor's in CSE; CISSP or CISM", "10 years", "1"),
                   ("SOC Analyst L2", "CEH / GCIH", "5 years", "3"),
                   ("SOC Analyst L1", "Bachelor's in CSE", "2 years", "6"),
                   ("Incident Responder", "GCIH / GCFA", "6 years", "1")],
        hardware=[("Log collectors", "On-premise log forwarding at the client site"),
                  ("SIEM storage", "365 days log retention")],
        risks=[("Tender Requirement", "The bidder's ISO 27001 certificate is mandatory."),
               ("Tender Requirement", "SLA penalties of up to 15% of the monthly fee."),
               ("Analyst Observation", "Log volume (EPS) is not stated; licensing cost could swing significantly.")],
        clauses=[("SLA-based monthly deductions", "PENALTY", "CRITICAL", "SLA Annex B",
                  "The monthly service fee is reduced by up to 15% for missed detection and response SLAs.",
                  "Build an SLA buffer into the staffing plan."),
                 ("Data residency", "LEGAL_RISK", "HIGH", "SCC 8",
                  "All logs and security data must remain within Bangladesh.",
                  "Cloud SIEM options must be hosted in-country.")],
        reqs=[("ISO/IEC 27001:2022 certificate", "Technical"), ("Certified SOC staff (CISSP/CEH) CVs", "Technical")],
        tech_docs=["SOC_Service_Proposal.pdf", "SLA_Compliance_Matrix.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Estimate EPS and SIEM licensing", "Draft SLA compliance matrix"],
        scenario="MILESTONE_BASED", subscription=True),
    "infra": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["Supply, installation, testing and commissioning of servers, storage and network equipment",
              "Virtualization platform setup and migration of existing workloads",
              "DR replication between primary and DR sites",
              "3 years manufacturer warranty with local partner support",
              "Training for client IT staff"],
        techs=["Rack servers (x86)", "SAN storage", "Virtualization platform (brand not specified)", "Backup software"],
        ops=["Installation at the client data center and DR site", "24x7 support with 4-hour onsite response",
             "Quarterly preventive maintenance"],
        personnel=[("Project Manager", "Bachelor's in EEE/CSE", "8 years", "1"),
                   ("Certified Infrastructure Engineer", "Vendor certification (VCP or equivalent)", "5 years", "2"),
                   ("Storage Engineer", "Vendor certification", "4 years", "1")],
        hardware=[("Rack servers", "Compute for virtualized workloads"),
                  ("SAN storage with expansion shelves", "Primary and DR data"),
                  ("SAN switches", "Fibre channel fabric"),
                  ("Backup appliance / tape library", "Backup and archival")],
        risks=[("Tender Requirement", "Manufacturer authorization letter (MAF) required for all major items."),
               ("Tender Requirement", "Delivery within 60 days of contract signing."),
               ("Analyst Observation", "USD price volatility; 120-day bid validity is long for imported hardware.")],
        clauses=[("Manufacturer authorization", "ELIGIBILITY", "CRITICAL", "ITT 18.1",
                  "The bidder shall submit a Manufacturer's Authorization for each major item.",
                  "The bid is non-responsive without MAF; request it early from the distributor."),
                 ("Delivery schedule", "PENALTY", "HIGH", "SCC 25",
                  "Delivery and commissioning within 60 days; LD 0.1% per day.",
                  "Confirm stock availability with the distributor.")],
        reqs=[("Manufacturer authorization letters (MAF)", "Technical"), ("Technical compliance sheet with datasheets", "Technical")],
        tech_docs=["Technical_Compliance_Sheet.pdf", "Product_Datasheets.pdf", "Implementation_Plan.pdf"],
        tasks=["Request MAF from distributor", "Prepare technical compliance sheet"],
        scenario="ACCEPTANCE_BASED"),
    "hardware": dict(
        classification="PARTIALLY SOFTWARE / IT RELATED",
        tech=["Supply of branded desktop computers / laptops as per specification",
              "Pre-installed licensed operating system", "Delivery and installation at listed offices",
              "3 years warranty with parts and service"],
        techs=["Intel Core i5 (13th gen or later) or equivalent", "8 GB RAM / 512 GB SSD", "Licensed Windows 11 Pro"],
        ops=["Delivery within 45 days", "Warranty service centres in divisional cities"],
        personnel=[],
        hardware=[("Desktop computers / laptops", "Office use"), ("Online UPS", "Power backup"), ("Printers", "Office printing")],
        risks=[("Tender Requirement", "Brand and country of origin must be stated."),
               ("Analyst Observation", "Thin margin; compete on price, warranty and delivery time.")],
        clauses=[("Comprehensive warranty", "TECHNICAL_MANDATORY", "MEDIUM", "Section 6",
                  "Minimum 3 years comprehensive warranty including parts and labour.",
                  "Confirm back-to-back warranty with the distributor.")],
        reqs=[("Manufacturer authorization letter (MAF)", "Technical"), ("Brand and country of origin declaration", "Technical")],
        tech_docs=["Technical_Specification_Compliance.pdf", "Brochures_and_Datasheets.pdf"],
        tasks=["Collect distributor quotation and MAF"],
        scenario="ACCEPTANCE_BASED"),
    "toll": dict(
        classification="PARTIALLY SOFTWARE / IT RELATED",
        tech=["Operation of the web-based toll collection software at the toll plaza",
              "Vehicle classification and axle-load records", "Daily revenue reconciliation and bank deposit",
              "CCTV monitoring of all lanes", "Monthly MIS reports to the road division"],
        techs=["Web-based toll collection software (approved by RHD)", "CCTV", "RFID-ready lanes (future)"],
        ops=["24x7 operation in three shifts", "Deployment of toll collectors, supervisors and security guards",
             "Maintenance of toll booth equipment", "Daily deposit of collected toll to the designated government account"],
        personnel=[("Plaza Manager", "Graduate", "5 years toll operation", "1"),
                   ("Shift Supervisor", "Graduate", "3 years", "3"),
                   ("Toll Collector", "HSC", "1 year", "18"),
                   ("IT Support Engineer", "Diploma/Bachelor's in CSE", "3 years", "2")],
        hardware=[("Lane computers and receipt printers", "Ticket issuance"), ("CCTV cameras and NVR", "Lane monitoring")],
        risks=[("Tender Requirement", "Performance security of 10% of the contract value."),
               ("Tender Requirement", "Revenue shortfall or late deposit attracts penalty."),
               ("Analyst Observation", "Labour cost escalation over 3 years is not covered by price adjustment.")],
        clauses=[("Daily revenue deposit", "FINANCIAL", "CRITICAL", "SCC 14",
                  "All toll revenue must be deposited to the government account by 12:00 the next working day.",
                  "Cash-handling controls and insurance are needed."),
                 ("No price adjustment", "FINANCIAL", "MEDIUM", "SCC 30",
                  "No price adjustment during the 3-year contract.",
                  "Include wage escalation in the bid price.")],
        reqs=[("Toll operation experience (2 plazas in 5 years)", "Experience")],
        tech_docs=["Operation_and_Management_Plan.pdf", "Manpower_Deployment_Plan.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Site visit to toll plaza", "Prepare manpower and shift plan"],
        scenario="MILESTONE_BASED", subscription=True),
    "callcenter": dict(
        classification="PARTIALLY SOFTWARE / IT RELATED",
        tech=["Universal agent seats with call center software", "CRM integration with the customer database",
              "IVR with Bangla prompts", "Call recording and quality monitoring", "Real-time dashboard and monthly reports"],
        techs=["Contact center platform (not specified)", "CRM", "IVR", "SIP trunk"],
        ops=["24x7x365 operation", "Supervisors and QA team", "Workspace, utilities and backup power provided by the bidder"],
        personnel=[("Operations Manager", "Graduate", "8 years contact center", "1"),
                   ("Team Leader", "Graduate", "4 years", "4"),
                   ("Call Center Agent", "HSC/Graduate", "1 year", "40"),
                   ("CRM Developer", "Bachelor's in CSE", "4 years", "1")],
        hardware=[("Agent workstations and headsets", "Agent seats"), ("Recording servers", "1-year call recording retention")],
        risks=[("Tender Requirement", "80% of calls answered within 20 seconds."),
               ("Analyst Observation", "Seat count may change; keep per-seat pricing flexible.")],
        clauses=[("Service level penalty", "PENALTY", "HIGH", "SLA Schedule",
                  "Deduction of 2% of the monthly bill for each 5% shortfall in service level.",
                  "Staff to peak load, not average.")],
        reqs=[("Contact center operation experience", "Experience")],
        tech_docs=["Call_Center_Operation_Proposal.pdf", "CRM_Integration_Approach.pdf"],
        tasks=["Calculate per-seat cost model"],
        scenario="MILESTONE_BASED", subscription=True),
    "elearning": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["Moodle-based LMS deployment and configuration", "Development of 12 interactive SCORM modules",
              "Mobile-friendly access with offline download", "Certificates and learner analytics dashboard"],
        techs=["Moodle (open source)", "SCORM 1.2 / xAPI", "Android app"],
        ops=["Hosting for 2 years", "Helpdesk support for learners", "Training of content administrators"],
        personnel=[("Project Lead", "Master's in Education Technology", "8 years", "1"),
                   ("Instructional Designer", "Bachelor's", "5 years", "2"),
                   ("Moodle Developer", "Bachelor's in CSE", "4 years", "1"),
                   ("Multimedia Designer", "Bachelor's", "3 years", "2")],
        hardware=[],
        risks=[("Tender Requirement", "Content must be in Bangla and English."),
               ("Analyst Observation", "Subject-matter expert reviews could delay module sign-off.")],
        clauses=[("Content ownership", "LEGAL_RISK", "MEDIUM", "GCC 9",
                  "All learning content becomes the client's property under an open licence.",
                  "No reuse restrictions for our template library.")],
        reqs=[("E-learning content samples", "Technical")],
        tech_docs=["LMS_Technical_Proposal.pdf", "Sample_Module_Storyboard.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Prepare sample module storyboard"],
        scenario="MILESTONE_BASED"),
    "gis": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["Web GIS platform with map layers for crops and hazards",
              "Integration of satellite imagery and field survey data",
              "Mobile data collection app for field officers", "Early warning alerts and dashboards"],
        techs=["Web GIS", "Satellite imagery (Sentinel-2)", "Mobile data collection (Android)"],
        ops=["Capacity building for government staff", "12 months technical support"],
        personnel=[("Team Leader (GIS)", "Master's in GIS/Remote Sensing", "10 years", "1"),
                   ("Remote Sensing Specialist", "Master's", "6 years", "1"),
                   ("GIS Developer", "Bachelor's in CSE", "4 years", "2"),
                   ("Agronomist", "Master's in Agriculture", "8 years", "1")],
        hardware=[],
        risks=[("Tender Requirement", "All data and models must be open and handed to the ministry."),
               ("Analyst Observation", "Agronomy expertise is not in-house; partner needed.")],
        clauses=[("Open data requirement", "TECHNICAL_MANDATORY", "MEDIUM", "ToR 6.2",
                  "All datasets and code must be published under open licences.",
                  "Proprietary GIS components cannot be used.")],
        reqs=[("GIS / remote sensing project references", "Experience")],
        tech_docs=["Technical_Proposal_GIS.pdf", "Methodology.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Confirm agronomist availability with partner"],
        scenario="MILESTONE_BASED"),
    "consulting": dict(
        classification="PARTIALLY SOFTWARE / IT RELATED",
        tech=["Assessment of existing digital systems and data", "Stakeholder consultations with ministries",
              "Readiness scoring framework", "Roadmap with costed recommendations"],
        techs=["Not specified in the tender documents."],
        ops=["Validation workshop", "Final report and policy brief"],
        personnel=[("Team Leader (Digital Governance)", "Master's", "15 years", "1"),
                   ("Data Governance Expert", "Master's", "10 years", "1"),
                   ("Policy Analyst", "Master's", "5 years", "1")],
        hardware=[],
        risks=[("Analyst Observation", "Evaluation is QCBS 80/20; the team leader profile carries most technical points.")],
        clauses=[("Key personnel replacement", "LEGAL_RISK", "MEDIUM", "GCC 19",
                  "Key experts cannot be replaced without written approval.",
                  "Confirm the team leader is available for the full period.")],
        reqs=[],
        tech_docs=["Technical_Proposal_Consulting.pdf", "Key_Expert_CVs.pdf"],
        tasks=["Confirm team leader availability"],
        scenario="MILESTONE_BASED"),
    "metering": dict(
        classification="PARTIALLY SOFTWARE / IT RELATED",
        tech=["Smart prepayment meters with two-way communication", "Head-end system and meter data management",
              "Vending integration with mobile financial services", "Installation and replacement of existing meters"],
        techs=["DLMS/COSEM", "Head-end system", "Meter data management", "Mobile financial service APIs"],
        ops=["Installation at customer premises", "Customer awareness campaign", "5 years warranty"],
        personnel=[("Project Director", "Bachelor's in EEE", "15 years", "1"),
                   ("Metering Engineer", "Bachelor's in EEE", "5 years", "4"),
                   ("Software Engineer (HES/MDM)", "Bachelor's in CSE", "5 years", "2")],
        hardware=[("Smart prepayment meters", "Customer metering"), ("Data concentrator units", "Communication")],
        risks=[("Tender Requirement", "Average annual turnover of BDT 300 crore in the last 5 years."),
               ("Tender Requirement", "Meter manufacturing experience of 50,000 units."),
               ("Analyst Observation", "Turnover requirement is far above our capacity; a JV with a manufacturer would be required.")],
        clauses=[("Turnover requirement", "ELIGIBILITY", "CRITICAL", "TDS 32",
                  "Minimum average annual turnover of BDT 300 crore over the last 5 years.",
                  "We do not qualify alone.")],
        reqs=[("Meter manufacturer authorization", "Technical")],
        tech_docs=["Metering_Technical_Proposal.pdf"],
        tasks=[],
        scenario="ACCEPTANCE_BASED"),
    "health": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["Technical support for the DHIS2 instance (upgrades, performance tuning)",
              "Custom dashboards and data quality apps", "Integration with facility registry and HR systems",
              "Training of district health information officers"],
        techs=["DHIS2", "PostgreSQL", "REST APIs", "Android data capture app"],
        ops=["Call-off based LTA for 2 years", "Response within 4 hours for critical incidents"],
        personnel=[("DHIS2 Implementation Lead", "DHIS2 Academy certification", "8 years", "1"),
                   ("DHIS2 Developer", "Bachelor's in CSE", "4 years", "2"),
                   ("Data Analyst (Health)", "Master's in Public Health / Statistics", "5 years", "1")],
        hardware=[],
        risks=[("Tender Requirement", "The LTA does not guarantee any minimum volume of work."),
               ("Analyst Observation", "Strong fit with our DHIS2 experience.")],
        clauses=[("No minimum volume", "FINANCIAL", "MEDIUM", "RFP Section 3",
                  "The LTA does not oblige the agency to purchase any minimum quantity.",
                  "Revenue is uncertain; price daily rates competitively.")],
        reqs=[("DHIS2 implementation references", "Experience")],
        tech_docs=["DHIS2_Technical_Proposal.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Prepare daily rate card for call-off"],
        scenario="MILESTONE_BASED"),
    "smartcity": dict(
        classification="PARTIALLY SOFTWARE / IT RELATED",
        tech=["Gate automation with OCR cameras and RFID readers", "Integration with the terminal operating system",
              "Boom barriers and lane controllers", "Central monitoring dashboard"],
        techs=["OCR / ANPR cameras", "RFID (UHF)", "Terminal Operating System integration"],
        ops=["Installation at 8 gates", "3 years O&M", "Onsite support engineers"],
        personnel=[("Project Manager", "Bachelor's in EEE/CSE", "10 years", "1"),
                   ("Integration Engineer", "Bachelor's in CSE", "6 years", "2"),
                   ("Field Engineer", "Diploma in EEE", "3 years", "4")],
        hardware=[("OCR cameras", "Container number recognition"), ("RFID readers and tags", "Truck identification"),
                  ("Boom barriers", "Lane control")],
        risks=[("Tender Requirement", "Integration with the existing terminal operating system is the bidder's responsibility."),
               ("Analyst Observation", "Requires a JV partner with port automation references.")],
        clauses=[("Integration responsibility", "TECHNICAL_MANDATORY", "HIGH", "ToR 4.3",
                  "The bidder shall integrate with the existing TOS at its own cost.",
                  "TOS vendor cooperation is a risk; seek clarification.")],
        reqs=[("Port or transport automation references", "Experience")],
        tech_docs=["Gate_Automation_Technical_Proposal.pdf", "System_Integration_Plan.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Clarify TOS integration interface with the port"],
        scenario="ADVANCE_AND_MILESTONES"),
    "ai": dict(
        classification="SOFTWARE / IT RELATED",
        tech=["Large Language Model (LLM) fine-tuning for Bengali and administrative corpora",
              "Enterprise Retrieval-Augmented Generation (RAG) and document intelligence pipeline",
              "Multi-modal generative AI sandbox and sovereign API integration",
              "Responsible AI governance, security red-teaming, and model bias monitoring",
              "High-performance GPU cluster orchestration and telemetry dashboard"],
        techs=["Bengali LLM / Transformer models", "Vector Database (Qdrant / Milvus)", "PyTorch & vLLM", "On-Premises NVIDIA GPU Cluster"],
        ops=["Pilot deployment across 5 ministries / directorates", "24x7 inference latency monitoring < 800ms", "Monthly model drift audit and retraining"],
        personnel=[("Lead AI Research Scientist", "Ph.D. in Computer Science / AI", "8 years", "1"),
                   ("Senior MLOps / Infrastructure Engineer", "Bachelor's in CSE", "6 years", "2"),
                   ("Bengali NLP Specialist / Linguist", "Master's in Computational Linguistics", "5 years", "2"),
                   ("Full-Stack AI Application Engineer", "Bachelor's in CSE", "5 years", "3")],
        hardware=[("NVIDIA H100 / A100 GPU compute nodes", "Model fine-tuning and high-throughput inference"),
                  ("NVMe Flash Storage Array", "Low-latency vector and document retrieval")],
        risks=[("Tender Requirement", "100% on-premises data residency; zero third-party cloud data leakage."),
               ("Analyst Observation", "High compute hardware lead times; establish distributor commitments early.")],
        clauses=[("Sovereign data security", "LEGAL_RISK", "CRITICAL", "ToR 7.1",
                  "No government documents or training embeddings may leave the sovereign on-premises environment.",
                  "Strict air-gapped deployment architecture required."),
                 ("Inference accuracy benchmark", "TECHNICAL_MANDATORY", "HIGH", "SCC 18",
                  "Minimum 94% accuracy on administrative Bengali benchmark tasks.",
                  "Rigorous pre-deployment validation protocol required.")],
        reqs=[("AI / Machine Learning project references", "Experience"), ("ISO 27001 & ISO 42001 (AI Management)", "Technical")],
        tech_docs=["AI_System_Architecture_Proposal.pdf", "Bengali_NLP_Benchmarking_Report.pdf", "Key_Personnel_CVs.pdf"],
        tasks=["Benchmark Bengali tokenization accuracy", "Confirm GPU server distributor delivery schedule"],
        scenario="ADVANCE_AND_MILESTONES"),
}


# ---------------------------------------------------------------------------
# Buyers (real organisations) - extra ones not in organizations_seed.json
# ---------------------------------------------------------------------------

EXTRA_ORGS = [
    ("ORG-UN-UNDP-BD", "United Nations Development Programme, Bangladesh", "UNDP Bangladesh", "https://www.undp.org/bangladesh", "HIGH"),
    ("ORG-UN-UNICEF-BD", "UNICEF Bangladesh", "UNICEF", "https://www.unicef.org/bangladesh", "HIGH"),
    ("ORG-UN-WFP-BD", "World Food Programme, Bangladesh", "WFP", "https://www.wfp.org/countries/bangladesh", "MEDIUM"),
    ("ORG-UN-WHO-BD", "World Health Organization, Bangladesh", "WHO", "https://www.who.int/bangladesh", "MEDIUM"),
    ("ORG-UN-ILO-BD", "International Labour Organization, Bangladesh", "ILO", "https://www.ilo.org/dhaka", "MEDIUM"),
    ("ORG-UN-UNOPS", "United Nations Office for Project Services", "UNOPS", "https://www.unops.org", "MEDIUM"),
    ("ORG-UN-FAO-BD", "Food and Agriculture Organization, Bangladesh", "FAO", "https://www.fao.org/bangladesh", "MEDIUM"),
    ("ORG-UN-UNPD-HQ", "United Nations Procurement Division (UNPD) - New York", "UNPD NY", "https://www.un.org/Depts/ptd", "HIGH"),
    ("ORG-BD-BRAC", "BRAC Technology Division", "BRAC Tech", "https://www.brac.net", "HIGH"),
    ("ORG-BD-BR", "Bangladesh Railway", "BR", "https://railway.gov.bd", "MEDIUM"),
]

E = "EGP"
UN = "UN"

# stage, days to deadline (negative = past), readiness, owner
TENDERS = [
    # ---------------- DISCOVERED ----------------
    dict(n=1, src=E, ref="1371204", stage="DISCOVERED", dl=18, ready=5, owner="Nusrat Jahan", prio="HIGH",
         title="National Data Center Object Storage Expansion and Backup Software (Lot-2)",
         buyer="Bangladesh Computer Council (BCC)", org_id="ORG-BD-BCC", cat="Infrastructure & Public Works", prof="infra",
         value=185_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="expansion of object storage capacity at the National Data Center with backup software licences and 3 years support"),
    dict(n=2, src=UN, ref="LRPS-2026-9208117", stage="DISCOVERED", dl=24, ready=0, owner="Nusrat Jahan", prio="MEDIUM",
         title="LTA for Mobile App and Web Platform Maintenance Services",
         buyer="UNICEF Bangladesh", org_id="ORG-UN-UNICEF-BD", cat="Software Development", prof="software",
         value=420_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a long-term agreement for maintenance and enhancement of UNICEF Bangladesh's mobile apps and web platforms"),
    dict(n=3, src=E, ref="1369872", stage="DISCOVERED", dl=21, ready=0, owner="Sadia Islam", prio="MEDIUM",
         title="Customer Billing System Upgrade and Mobile Payment Integration",
         buyer="Dhaka WASA", org_id="ORG-BD-DWASA", cat="Software Development", prof="software",
         value=92_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="upgrade of the customer billing system and integration with mobile financial services for bill payment"),
    dict(n=4, src=E, ref="1370455", stage="DISCOVERED", dl=27, ready=0, owner="Nusrat Jahan", prio="LOW",
         title="Spectrum Monitoring Data Analytics Dashboard",
         buyer="Bangladesh Telecommunication Regulatory Commission", org_id="ORG-BD-BTRC", cat="Software Development", prof="software",
         value=64_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="an analytics dashboard over spectrum monitoring station data with alerting and reporting"),
    dict(n=5, src=UN, ref="RFP-BGD-26-0142", stage="DISCOVERED", dl=30, ready=0, owner="Akib Mahamud", prio="HIGH",
         title="Beneficiary Registration and Cash Transfer Reconciliation Platform (Cox's Bazar)",
         buyer="World Food Programme, Bangladesh", org_id="ORG-UN-WFP-BD", cat="Software Development", prof="software",
         value=650_000, ttype="Expression of Interest (EOI)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a platform for beneficiary registration and reconciliation of cash transfers across humanitarian partners"),
    dict(n=6, src=E, ref="1368120", stage="DISCOVERED", dl=33, ready=0, owner="Sadia Islam", prio="MEDIUM",
         title="Crew Management System Licences and Implementation",
         buyer="Biman Bangladesh Airlines Limited", org_id="ORG-BD-BIMAN", cat="Software Development", prof="software",
         value=120_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="licences, configuration and implementation of a crew rostering and management system"),
    # ---------------- SCREENING ----------------
    dict(n=7, src=E, ref="1366731", stage="SCREENING", dl=9, ready=15, owner="Tanvir Hasan", prio="MEDIUM",
         title="Supply of 450 Desktop Computers with UPS (Framework Agreement)",
         buyer="Sonali Bank PLC", org_id="ORG-BD-SONALIBANK", cat="ICT Hardware & Networking", prof="hardware",
         value=54_000_000, ttype="Framework Agreement / Call-off", pm="Open Tendering Method (OTM)", em="Least Cost Selection (LCS)",
         scope="a framework agreement for 450 branded desktop computers with online UPS for branches"),
    dict(n=8, src=E, ref="1367015", stage="SCREENING", dl=16, ready=20, owner="Farhana Rahman", prio="HIGH",
         title="Digital Case Diary and Evidence Management System (Phase-1)",
         buyer="Bangladesh Police", org_id="ORG-BD-POLICE", cat="Software Development", prof="software",
         value=210_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a digital case diary and evidence management system for pilot police stations"),
    dict(n=9, src=UN, ref="UNDP-BGD-01297", stage="SCREENING", dl=12, ready=20, owner="Nusrat Jahan", prio="HIGH",
         title="Firm for Climate Finance Tracking Dashboard and Data Pipeline",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Software Development", prof="software",
         value=280_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a dashboard and automated data pipeline to track climate finance flows across ministries"),
    dict(n=10, src=E, ref="1365598", stage="SCREENING", dl=14, ready=10, owner="Imran Chowdhury", prio="MEDIUM",
         title="Network Switches and Next-Generation Firewalls for 20 PBS Offices",
         buyer="Bangladesh Rural Electrification Board (BREB)", org_id="ORG-BD-BREB", cat="ICT Hardware & Networking", prof="infra",
         value=78_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="supply and installation of access switches and next-generation firewalls for 20 Palli Bidyut Samity offices"),
    dict(n=11, src=UN, ref="rfx_12544_DHAKA", stage="SCREENING", dl=11, ready=15, owner="Nusrat Jahan", prio="MEDIUM",
         title="Development of a Labour Inspection Mobile Application",
         buyer="International Labour Organization, Bangladesh", org_id="ORG-UN-ILO-BD", cat="Software Development", prof="software",
         value=150_000, ttype="Request for Quotation (RFQ)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="an offline-capable mobile application for labour inspectors with a web back office"),
    # ---------------- UNDER ANALYSIS ----------------
    dict(n=12, src=E, ref="1362448", stage="UNDER_ANALYSIS", dl=19, ready=35, owner="Farhana Rahman", prio="HIGH",
         title="Container Terminal Gate Automation with OCR and RFID",
         buyer="Chittagong Port Authority (CPA)", org_id="ORG-BD-CPA", cat="Smart City & Transportation", prof="smartcity",
         value=340_000_000, ttype="Open Tendering Method (OTM)", pm="Two Stage Tendering Method (TSTM)", em="Quality & Cost Based Selection (QCBS)",
         scope="automation of 8 terminal gates with OCR cameras, RFID and integration with the terminal operating system",
         jv=["ORG-JV-KESTREL"], decision="CONDITIONAL"),
    dict(n=13, src=UN, ref="WHO-BAN-RFP-26-031", stage="UNDER_ANALYSIS", dl=8, ready=40, owner="Farhana Rahman", prio="HIGH",
         title="LTA for Health Information System (DHIS2) Technical Support",
         buyer="World Health Organization, Bangladesh", org_id="ORG-UN-WHO-BD", cat="Healthcare & Medical Systems", prof="health",
         value=360_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a 2-year LTA for technical support, customisation and training on the national DHIS2 instance"),
    dict(n=14, src=E, ref="1363907", stage="UNDER_ANALYSIS", dl=13, ready=30, owner="Imran Chowdhury", prio="HIGH",
         title="Managed Security Operations Center (SOC) for Voter Data Center, 3 Years",
         buyer="Election Commission", org_id="ORG-BD-EC", cat="Cloud & Cyber Security", prof="cyber",
         value=155_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a managed 24x7 SOC service with SIEM for the voter data center and DR site for 3 years"),
    dict(n=15, src=E, ref="1364210", stage="UNDER_ANALYSIS", dl=6, ready=25, owner="Imran Chowdhury", prio="MEDIUM",
         title="Smart Prepayment Meter Head-End System Upgrade",
         buyer="Dhaka Power Distribution Company Limited (DPDC)", org_id="ORG-BD-DPDC", cat="Energy & Utilities", prof="metering",
         value=98_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="upgrade of the head-end system and meter data management for existing smart prepayment meters"),
    dict(n=16, src=E, ref="1363355", stage="UNDER_ANALYSIS", dl=10, ready=45, owner="Nusrat Jahan", prio="MEDIUM",
         title="Digital Investor Facilitation Portal",
         buyer="Bangladesh Hi-Tech Park Authority", org_id="ORG-BD-BHTPA", cat="Software Development", prof="software",
         value=46_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="an online portal for investor registration, space allocation and service requests across hi-tech parks"),
    # ---------------- PREPARATION ----------------
    dict(n=17, src=E, ref="1358921", stage="PREPARATION", dl_h=40, ready=72, owner="Akib Mahamud", prio="CRITICAL",
         title="Web-Based Toll Collection, Operation and Management, Meghna-Gumti Approach Plaza (3 Years)",
         buyer="Roads and Highways Department", org_id="ORG-BD-RHD", cat="Smart City & Transportation", prof="toll",
         value=132_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="web-based toll collection, operation and management of the approach toll plaza for 3 years"),
    dict(n=18, src=E, ref="1357702", stage="PREPARATION", dl=4, ready=58, owner="Imran Chowdhury", prio="HIGH",
         title="Core Banking DR Site Virtualization and SAN Storage",
         buyer="Rupali Bank PLC", org_id="ORG-BD-RUPALIBANK", cat="Infrastructure & Public Works", prof="infra",
         value=165_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="servers, virtualization and SAN storage for the core banking DR site with replication from the primary site",
         amend=True),
    dict(n=19, src=UN, ref="UNDP-BGD-01264", stage="PREPARATION", dl=5, ready=64, owner="Farhana Rahman", prio="HIGH",
         title="Design and Implementation of a Disaster Early Warning Data Platform",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Software Development", prof="gis",
         value=520_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a data platform that combines hydro-met, GIS and field data to issue disaster early warnings",
         jv=["ORG-JV-SUNDARBAN"], parent=27),
    dict(n=20, src=E, ref="1359340", stage="PREPARATION", dl=7, ready=48, owner="Tanvir Hasan", prio="HIGH",
         title="Card Management System and Payment Gateway Integration",
         buyer="Agrani Bank PLC", org_id="ORG-BD-AGRANIBANK", cat="Software Development", prof="software",
         value=88_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a card management system with payment gateway integration and 3 years support"),
    dict(n=21, src=E, ref="1360018", stage="PREPARATION", dl=3, ready=81, owner="Sadia Islam", prio="MEDIUM",
         title="Passenger Information Display System Software Maintenance (2 Years)",
         buyer="Dhaka Mass Transit Company Limited", org_id="ORG-BD-DMTCL", cat="Smart City & Transportation", prof="software",
         value=36_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="maintenance and minor enhancement of the passenger information display system software for 2 years"),
    dict(n=22, src=UN, ref="2026/FABGD/RFP/014", stage="PREPARATION", dl=9, ready=45, owner="Nusrat Jahan", prio="MEDIUM",
         title="GIS-based Crop Monitoring and Early Warning Tool",
         buyer="Food and Agriculture Organization, Bangladesh", org_id="ORG-UN-FAO-BD", cat="Software Development", prof="gis",
         value=210_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a GIS crop monitoring tool with satellite imagery and an early warning module for extension officers",
         jv=["ORG-JV-SUNDARBAN"]),
    # ---------------- INTERNAL REVIEW ----------------
    dict(n=23, src=E, ref="1355476", stage="PREPARATION", dl_h=20, ready=92, owner="Imran Chowdhury", prio="CRITICAL",
         title="Managed SOC and SIEM Services for 3 Years",
         buyer="Janata Bank PLC", org_id="ORG-BD-JANATABANK", cat="Cloud & Cyber Security", prof="cyber",
         value=112_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a managed SOC with SIEM, 24x7 monitoring and incident response for the bank's data center and branches"),
    dict(n=24, src=E, ref="1356630", stage="PREPARATION", dl=3, ready=88, owner="Akib Mahamud", prio="HIGH",
         title="Data Warehouse Modernization and BI Reporting",
         buyer="Bangladesh Bank (Central Bank)", org_id="ORG-BD-BANGLADESHBANK", cat="Software Development", prof="software",
         value=245_000_000, ttype="Open Tendering Method (OTM)", pm="Two Stage Tendering Method (TSTM)", em="Quality & Cost Based Selection (QCBS)",
         scope="modernization of the enterprise data warehouse and self-service BI reporting for supervision departments",
         jv=["ORG-JV-MEGHNA"]),
    # ---------------- SUBMITTED ----------------
    dict(n=25, src=E, ref="1351188", stage="SUBMITTED", dl=-4, ready=100, owner="Tanvir Hasan", prio="HIGH",
         title="Customer Care Call Center Outsourcing with CRM (3 Years)",
         buyer="Teletalk Bangladesh Limited", org_id="ORG-BD-TELETALK", cat="Consulting & Advisory Services", prof="callcenter",
         value=96_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="outsourced customer care call center with CRM integration for 3 years"),
    dict(n=26, src=UN, ref="RFP/2026/66218", stage="SUBMITTED", dl=-6, ready=100, owner="Nusrat Jahan", prio="MEDIUM",
         title="E-Learning Platform for Public Health Workers (Moodle-based)",
         buyer="United Nations Office for Project Services", org_id="ORG-UN-UNOPS", cat="Healthcare & Medical Systems", prof="elearning",
         value=175_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a Moodle-based learning platform with 12 modules for community health workers"),
    dict(n=27, src=UN, ref="UNDP-BGD-01188", stage="SUBMITTED", dl=-38, ready=100, owner="Farhana Rahman", prio="HIGH",
         title="EOI: Disaster Early Warning Data Platform",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Software Development", prof="gis",
         value=520_000, ttype="Expression of Interest (EOI)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="expression of interest for shortlisting firms for the disaster early warning data platform",
         eoi_child=19),
    dict(n=28, src=E, ref="1349902", stage="SUBMITTED", dl=-9, ready=100, owner="Imran Chowdhury", prio="HIGH",
         title="Border Surveillance Data Integration Platform",
         buyer="Border Guard Bangladesh (BGB)", org_id="ORG-BD-BGB", cat="Defense & Strategic Technology", prof="software",
         value=188_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="integration of sensor, camera and patrol data into a single command dashboard", jv=["ORG-JV-MEGHNA"]),
    dict(n=29, src=E, ref="1352671", stage="SUBMITTED", dl=-3, ready=100, owner="Sadia Islam", prio="MEDIUM",
         title="Supply of 120 Laptops and 60 Network Printers",
         buyer="Chattogram WASA (CWASA)", org_id="ORG-BD-CWASA", cat="ICT Hardware & Networking", prof="hardware",
         value=21_500_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="supply of 120 laptops and 60 network printers for divisional offices"),
    # ---------------- AWARDED ----------------
    dict(n=30, src=E, ref="1331470", stage="AWARDED", dl=-75, ready=100, owner="Akib Mahamud", prio="HIGH",
         title="Web-Based Toll Collection, Operation and Management, Bhairab Bridge (3 Years)",
         buyer="Roads and Highways Department", org_id="ORG-BD-RHD", cat="Smart City & Transportation", prof="toll",
         value=118_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="web-based toll collection, operation and management of the bridge toll plaza for 3 years"),
    dict(n=31, src=E, ref="1336042", stage="AWARDED", dl=-60, ready=100, owner="Imran Chowdhury", prio="MEDIUM",
         title="Annual Maintenance of e-Office Application Servers (2 Years)",
         buyer="Bangladesh Computer Council (BCC)", org_id="ORG-BD-BCC", cat="Infrastructure & Public Works", prof="infra",
         value=42_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="2-year annual maintenance of the e-Office application servers, storage and virtualization stack"),
    dict(n=32, src=UN, ref="LRPS-2026-9204410", stage="AWARDED", dl=-95, ready=100, owner="Farhana Rahman", prio="MEDIUM",
         title="Birth Registration Data Quality Dashboard",
         buyer="UNICEF Bangladesh", org_id="ORG-UN-UNICEF-BD", cat="Software Development", prof="software",
         value=95_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="a data quality dashboard for birth registration data with automated validation rules"),
    dict(n=33, src=E, ref="1339817", stage="AWARDED", dl=-48, ready=100, owner="Tanvir Hasan", prio="MEDIUM",
         title="Supply of 300 Desktop Computers",
         buyer="Agrani Bank PLC", org_id="ORG-BD-AGRANIBANK", cat="ICT Hardware & Networking", prof="hardware",
         value=36_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="supply of 300 branded desktop computers for branches"),
    # ---------------- LOST ----------------
    dict(n=34, src=E, ref="1333205", stage="LOST", dl=-70, ready=100, owner="Farhana Rahman", prio="HIGH",
         title="Enterprise Document Management System",
         buyer="Sonali Bank PLC", org_id="ORG-BD-SONALIBANK", cat="Software Development", prof="software",
         value=140_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="an enterprise document management system with workflow for head office and 1,200 branches",
         lost="Price higher than winner: we were 2nd lowest, 7.8% above the winning bid."),
    dict(n=35, src=UN, ref="UNDP-BGD-01102", stage="LOST", dl=-55, ready=100, owner="Akib Mahamud", prio="MEDIUM",
         title="Digital Public Infrastructure Readiness Assessment",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Consulting & Advisory Services", prof="consulting",
         value=180_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="assessment of digital public infrastructure readiness with a costed roadmap",
         lost="Technical score below cutoff: 68/100 against a 70 threshold (team leader experience scored low)."),
    dict(n=36, src=E, ref="1329960", stage="LOST", dl=-82, ready=100, owner="Imran Chowdhury", prio="MEDIUM",
         title="SCADA Data Historian and Analytics",
         buyer="Dhaka WASA", org_id="ORG-BD-DWASA", cat="Energy & Utilities", prof="infra",
         value=66_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="a SCADA data historian with analytics for water treatment and distribution",
         lost="Price higher than winner: 3rd lowest, 11.2% above the winning bid."),
    dict(n=37, src=E, ref="1341256", stage="LOST", dl=-40, ready=100, owner="Sadia Islam", prio="MEDIUM",
         title="Body-Worn Camera Evidence Management Platform",
         buyer="Bangladesh Police", org_id="ORG-BD-POLICE", cat="Defense & Strategic Technology", prof="software",
         value=90_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="an evidence management platform for body-worn camera footage with chain-of-custody",
         lost="Disqualified: bank solvency certificate was older than 30 days at submission."),
    # ---------------- DECLINED ----------------
    dict(n=38, src=E, ref="1342740", stage="DECLINED", dl=-20, ready=15, owner="Akib Mahamud", prio="LOW",
         title="Smart Prepayment Meters, 40,000 Units (Turnkey)",
         buyer="Bangladesh Rural Electrification Board (BREB)", org_id="ORG-BD-BREB", cat="Energy & Utilities", prof="metering",
         value=560_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Least Cost Selection (LCS)",
         scope="design, supply and installation of 40,000 smart prepayment meters on a turnkey basis",
         declined="No-go: average annual turnover requirement (BDT 300 crore) is far above our capacity."),
    dict(n=39, src=UN, ref="RFQ-BGD-26-0098", stage="DECLINED", dl=-15, ready=10, owner="Nusrat Jahan", prio="LOW",
         title="Fleet Telematics Hardware Supply",
         buyer="World Food Programme, Bangladesh", org_id="ORG-UN-WFP-BD", cat="ICT Hardware & Networking", prof="hardware",
         value=300_000, ttype="Request for Quotation (RFQ)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="supply of GPS telematics units for the humanitarian fleet",
         declined="No-go: pure hardware supply outside our core scope; no distributor relationship."),
    dict(n=40, src=E, ref="1338804", stage="DECLINED", dl=-30, ready=20, owner="Farhana Rahman", prio="MEDIUM",
         title="Airport Ground Handling ERP",
         buyer="Biman Bangladesh Airlines Limited", org_id="ORG-BD-BIMAN", cat="Software Development", prof="software",
         value=260_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="an ERP for ground handling operations, billing and resource planning",
         declined="No-go: 12 days to prepare and no aviation ERP reference; revisit if re-tendered."),
    # ---------------- ARCHIVED ----------------
    dict(n=41, src=E, ref="1318455", stage="ARCHIVED", dl=-120, ready=5, owner="Sadia Islam", prio="LOW",
         title="Innovation Hub Website Refresh",
         buyer="Bangladesh Hi-Tech Park Authority", org_id="ORG-BD-BHTPA", cat="Software Development", prof="software",
         value=4_500_000, ttype="Request for Quotation (RFQ)", pm="Open Tendering Method (OTM)", em="Least Cost Selection (LCS)",
         scope="refresh of the innovation hub website", archived_from="DISCOVERED"),
    # ---------------- FULL YEAR HISTORICAL (JANUARY - MAY 2026) ----------------
    # January 2026
    dict(n=42, src=E, ref="1310101", stage="AWARDED", dl=-286, ready=100, owner="Akib Mahamud", prio="HIGH",
         title="National Core Banking Switch and Security Infrastructure Upgrade",
         buyer="Bangladesh Bank (Central Bank)", org_id="ORG-BD-BANGLADESHBANK", cat="Infrastructure & Public Works", prof="infra",
         value=68_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="core network switch and perimeter security hardware upgrade for central bank"),
    dict(n=43, src=E, ref="1310450", stage="LOST", dl=-276, ready=100, owner="Sadia Islam", prio="MEDIUM",
         title="Flight Operations Crew Scheduling & Rostering System",
         buyer="Biman Bangladesh Airlines Limited", org_id="ORG-BD-BIMAN", cat="Software Development", prof="software",
         value=45_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="flight ops crew rostering and fatigue tracking platform", lost="Price higher than winning bidder by 6.2%."),
    dict(n=44, src=E, ref="1310890", stage="ARCHIVED", dl=-268, ready=10, owner="Farhana Rahman", prio="LOW",
         title="Land Information and Zoning GIS Portal",
         buyer="Rajdhani Unnayan Kartripakkha (RAJUK)", org_id="ORG-BD-RAJUK", cat="Software Development", prof="gis",
         value=18_000_000, ttype="Request for Quotation (RFQ)", pm="Open Tendering Method (OTM)", em="Least Cost Selection (LCS)",
         scope="cadastral map GIS digitization and zoning verification portal", archived_from="DISCOVERED"),

    # February 2026
    dict(n=45, src=E, ref="1315220", stage="AWARDED", dl=-255, ready=100, owner="Imran Chowdhury", prio="HIGH",
         title="SCADA Remote Telemetry and IoT Sensor Units",
         buyer="Dhaka WASA", org_id="ORG-BD-DWASA", cat="Infrastructure & Public Works", prof="infra",
         value=88_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="IoT telemetry units and SCADA transmission modules for water booster stations"),
    dict(n=46, src=E, ref="1316040", stage="LOST", dl=-245, ready=100, owner="Tanvir Hasan", prio="HIGH",
         title="Active-Active ATM Switch Redundancy and Disaster Recovery",
         buyer="Sonali Bank PLC", org_id="ORG-BD-SONALIBANK", cat="Software Development", prof="software",
         value=52_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="active-active ATM transaction switch replication to DR site", lost="OEM authorization letter format was non-compliant."),
    dict(n=47, src=E, ref="1317110", stage="DECLINED", dl=-238, ready=15, owner="Akib Mahamud", prio="LOW",
         title="Turnkey 33/11kV Substation Power Automation",
         buyer="Bangladesh Rural Electrification Board (BREB)", org_id="ORG-BD-BREB", cat="Infrastructure & Public Works", prof="infra",
         value=320_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Least Cost Selection (LCS)",
         scope="turnkey power substation civil and transformer installation", declined="No-go: high-voltage civil power equipment outside ICT scope."),

    # March 2026
    dict(n=48, src=E, ref="1321450", stage="AWARDED", dl=-224, ready=100, owner="Farhana Rahman", prio="CRITICAL",
         title="Chittagong Port Container Gate Automation and OCR Infrastructure",
         buyer="Chittagong Port Authority (CPA)", org_id="ORG-BD-CPA", cat="Smart City & Transportation", prof="smartcity",
         value=115_000_000, ttype="Open Tendering Method (OTM)", pm="Two Stage Tendering Method (TSTM)", em="Quality & Cost Based Selection (QCBS)",
         scope="automation of container terminal gates with OCR and RFID reader integration", jv=["ORG-JV-KESTREL"]),
    dict(n=49, src=UN, ref="LRPS-2026-9195001", stage="AWARDED", dl=-214, ready=100, owner="Nusrat Jahan", prio="HIGH",
         title="LTA for Cold Chain IoT Vaccine Monitoring and Fleet Telemetry",
         buyer="UNICEF Bangladesh", org_id="ORG-UN-UNICEF-BD", cat="Software Development", prof="software",
         value=220_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="real-time IoT temperature telemetry for district vaccine cold rooms"),
    dict(n=50, src=E, ref="1322880", stage="LOST", dl=-204, ready=100, owner="Imran Chowdhury", prio="MEDIUM",
         title="Tactical Mobile Command Vehicles Telematics",
         buyer="Bangladesh Police", org_id="ORG-BD-POLICE", cat="ICT Hardware & Networking", prof="hardware",
         value=130_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Least Cost Selection (LCS)",
         scope="surveillance and radio command vehicle retrofitting", lost="Automotive fabrication partner withdrew prior to bid opening."),

    # April 2026
    dict(n=51, src=E, ref="1325120", stage="AWARDED", dl=-195, ready=100, owner="Imran Chowdhury", prio="HIGH",
         title="Hyperconverged Infrastructure (HCI) and SAN Storage Expansion",
         buyer="Rupali Bank PLC", org_id="ORG-BD-RUPALIBANK", cat="Infrastructure & Public Works", prof="infra",
         value=72_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="hyperconverged compute nodes and all-flash storage expansion"),
    dict(n=52, src=E, ref="1326440", stage="LOST", dl=-184, ready=100, owner="Farhana Rahman", prio="HIGH",
         title="Electronic VAT Invoicing & Tax Reconciliation Portal",
         buyer="National Board of Revenue", org_id="ORG-BD-NBR", cat="Software Development", prof="software",
         value=160_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="real-time VAT electronic cash register integration and tax audit portal", lost="Competitor scored 84 technical points with international customs references vs our 71."),
    dict(n=53, src=E, ref="1327090", stage="DECLINED", dl=-175, ready=10, owner="Tanvir Hasan", prio="LOW",
         title="Metro Optical Fiber Cable Trenching and Laying",
         buyer="Bangladesh Telecommunications Company Limited (BTCL)", org_id="ORG-BD-BTCL", cat="Infrastructure & Public Works", prof="infra",
         value=210_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage One Envelope (SSOE)", em="Least Cost Selection (LCS)",
         scope="civil road excavation and optical fiber duct installation", declined="No-go: civil trenching and municipality permits carry unacceptable delivery delay penalties."),

    # May 2026
    dict(n=54, src=E, ref="1329100", stage="AWARDED", dl=-164, ready=100, owner="Farhana Rahman", prio="HIGH",
         title="Farmer Agro-Advisory & Weather Early Warning Mobile Application",
         buyer="Department of Agricultural Extension", org_id="ORG-BD-DAE", cat="Software Development", prof="gis",
         value=58_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="hyper-local weather advisory and crop pest alert mobile platform for extension workers", jv=["ORG-JV-SUNDARBAN"]),
    dict(n=55, src=E, ref="1330200", stage="LOST", dl=-154, ready=100, owner="Akib Mahamud", prio="HIGH",
         title="Intercity Train E-Ticketing Infrastructure & Handheld POS",
         buyer="Bangladesh Railway", org_id="ORG-BD-BR", cat="Software Development", prof="software",
         value=310_000_000, ttype="Open Tendering Method (OTM)", pm="Single Stage Two Envelope (SSTE)", em="Least Cost Selection (LCS)",
         scope="e-ticketing engine and 4,000 conductor handheld POS terminals", lost="Winning bidder offered zero transaction fee commercial model subsidized by in-app ads."),
    dict(n=56, src=UN, ref="UNDP-SOM-00620", stage="AWARDED", dl=-144, ready=100, owner="Nusrat Jahan", prio="HIGH",
         title="Somalia Drought Predictive Analytics & Geospatial Risk Portal",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Software Development", prof="gis",
         value=450_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="satellite vegetation anomaly and drought predictive modeling system"),

    # ---------------- STRATEGIC FLAGSHIP AI & MEGA-PROJECT JOINT VENTURES ----------------
    dict(n=57, src=UN, id="TDR-2026-UNPD-USA-002", ref="UNPD-RFP-2026-088", stage="PREPARATION", dl=25, ready=78, owner="Akib Mahamud", prio="CRITICAL",
         title="Enterprise Hybrid Cloud Migration, AI Document Intelligence and Modernization Platform",
         buyer="United Nations Procurement Division (UNPD) - New York", org_id="ORG-UN-UNPD-HQ", cat="Cloud & Cyber Security", prof="ai",
         value=12_800_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="Global UN enterprise document intelligence, multi-modal LLM retrieval, and secure sovereign cloud migration",
         jv=["ORG-DATACORE"]),
    dict(n=58, src=E, id="UNDP-BGD-01218", ref="UNDP-BGD-01218", stage="SUBMITTED", dl=-11, ready=100, owner="Farhana Rahman", prio="CRITICAL",
         title="Contracting a Firm for AI Use Case Design, Bengali LLM Adaptation and Operational Efficiency Prototyping",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Software Development", prof="ai",
         value=145_000_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="sovereign Bengali LLM fine-tuning and AI prototyping across 5 ministry operational workflows",
         jv=["ORG-DATACORE"]),
    dict(n=59, src=UN, id="UNDP-SOM-00710", ref="UNDP-SOM-00710", stage="AWARDED", dl=-23, ready=100, owner="Akib Mahamud", prio="HIGH",
         title="Long-Term Agreement for AI-Enabled Early Warning, Operational Risk Monitoring and Analytical Services",
         buyer="UNDP Bangladesh", org_id="ORG-UN-UNDP-BD", cat="Software Development", prof="ai",
         value=4_800_000, ttype="Request for Proposals (RFP)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="predictive satellite analytics, flood anomaly detection, and automated crisis alert generation",
         jv=["ORG-DATACORE"]),
    dict(n=60, src=UN, id="TDR-2026-RHD-001", ref="RHD/ITS/2026/01", stage="AWARDED", dl=-9, ready=100, owner="Akib Mahamud", prio="CRITICAL",
         title="Intelligent Transportation System (ITS), Electronic Toll Collection (ETC) and Traffic Control, Dhaka-Chattogram Expressway",
         buyer="Roads and Highways Department", org_id="ORG-BD-RHD", cat="Smart City & Transportation", prof="smartcity",
         value=4_500_000, ttype="Open Tendering Method (OTM)", pm="Two Stage Tendering Method (TSTM)", em="Quality & Cost Based Selection (QCBS)",
         scope="full expressway intelligent transport system, automated toll plazas, and incident management",
         jv=["ORG-NYKADVANCE"]),
    dict(n=61, src=E, id="BPD-2026-IFT-2636", ref="BPD-2026-IFT-2636", stage="SUBMITTED", dl=-18, ready=100, owner="Imran Chowdhury", prio="HIGH",
         title="IFT for Technology Managed Network Services & 24/7 Cybersecurity Operations Center",
         buyer="BRAC Technology Division", org_id="ORG-BD-BRAC", cat="Cloud & Cyber Security", prof="cyber",
         value=280_000_000, ttype="National Competitive Tender (36 Months SLA)", pm="Single Stage Two Envelope (SSTE)", em="Quality & Cost Based Selection (QCBS)",
         scope="managed enterprise SD-WAN network infrastructure and CREST-certified SOC monitoring for 36 months",
         jv=["ORG-CYBERSHIELD"]),
]
for t in TENDERS:
    t["id"] = t.get("id") or f"TDR-2026-{700 + t['n']}"
TENDER_BY_N = {t["n"]: t for t in TENDERS}
DEMO_TENDER_IDS = [t["id"] for t in TENDERS]

STAGE_ORDER = ["DISCOVERED", "SCREENING", "UNDER_ANALYSIS", "PREPARATION", "INTERNAL_REVIEW", "SUBMITTED", "AWARDED", "LOST"]
POST_SUBMIT = {"SUBMITTED", "AWARDED", "LOST"}

PARTNERS = [
    dict(id="ORG-JV-MEGHNA", name="Meghna Data Systems Ltd", type="JV_PARTNER", country="Bangladesh",
         email="bids@meghna-data.example.com", phone="+880 1700-000201", status="ACTIVE",
         notes="Data warehouse and BI partner. Signed framework JV agreement (demo)."),
    dict(id="ORG-JV-KESTREL", name="Kestrel Port Automation Pte Ltd", type="JV_PARTNER", country="Singapore",
         email="tenders@kestrel-port.example.com", phone="+65 6000 0000", status="ACTIVE",
         notes="Foreign JV partner with OCR/RFID gate automation references."),
    dict(id="ORG-JV-SUNDARBAN", name="Sundarban GeoInfo Ltd", type="CONSORTIUM_PARTNER", country="Bangladesh",
         email="info@sundarban-geo.example.com", phone="+880 1700-000203", status="ACTIVE",
         notes="GIS, remote sensing and agronomy experts."),
    dict(id="ORG-SUB-PADMA", name="Padma Network Engineering Ltd", type="SUBCONTRACTOR", country="Bangladesh",
         email="ops@padma-net.example.com", phone="+880 1700-000204", status="ACTIVE",
         notes="Field installation subcontractor for network and CCTV work."),
    dict(id="ORG-SUB-NORTHGATE", name="Northgate Security Services", type="SUBCONTRACTOR", country="Bangladesh",
         email="contact@northgate-sec.example.com", phone="+880 1700-000205", status="SUSPENDED",
         notes="Suspended: NDA expired; access blocked until renewal."),
    dict(id="ORG-DATACORE", name="DataCore Systems Bangladesh Limited", type="JV_PARTNER", country="Bangladesh",
         email="tenders@datacore-bd.com", phone="+880 1711-889901", status="ACTIVE",
         notes="AI & High-Performance Computing infrastructure partner. Tier-3 datacenter & GPU clusters."),
    dict(id="ORG-NYKADVANCE", name="NYK Advance Engineering & Infrastructure Ltd", type="JV_PARTNER", country="Bangladesh",
         email="info@nyk-advance.com", phone="+880 1819-223344", status="ACTIVE",
         notes="Mega highway, toll plaza, and Intelligent Transport Systems (ITS) hardware partner."),
    dict(id="ORG-CYBERSHIELD", name="CyberShield Defense Solutions Limited", type="CONSORTIUM_PARTNER", country="Bangladesh",
         email="gov-bids@cybershield.com.bd", phone="+880 1912-334455", status="ACTIVE",
         notes="24/7 Security Operations Center (SOC) monitoring and offensive cyber red-teaming."),
]


# ---------------------------------------------------------------------------
# Builders
# ---------------------------------------------------------------------------

def deadline_of(t) -> datetime:
    if "dl_h" in t:
        return NOW + timedelta(hours=t["dl_h"])
    return at(t["dl"], hour=12 if t["src"] == E else 15, minute=0 if t["src"] == E else 30)


def tender_value_bdt(t) -> float:
    return float(t["value"]) if t["src"] == E else float(t["value"]) * 122.0


def money_text(t, amount: float) -> str:
    if t["src"] == E:
        return f"BDT {amount:,.0f}"
    return f"USD {amount:,.0f}"


def build_summary(t, prof, dl: datetime, published: datetime) -> dict:
    is_egp = t["src"] == E
    sec = t.get("_security")
    summary = {
        "classification": prof["classification"],
        "projectName": t["title"],
        "tenderIdDisplay": t["ref"],
        "shortTitle": t["title"][:60],
        "portal": "e-GP (eprocure.gov.bd)" if is_egp else ("UNDP Quantum Supplier Portal" if "UNDP" in t["buyer"] else "UNGM / agency e-tendering"),
        "publishedDate": d(published),
        "publishedHour": "10", "publishedMinute": "00",
        "publishedTimezone": "BST" if is_egp else "EDT",
        "submissionTime": dl.strftime("%H:%M") + (" (Dhaka time)" if is_egp else " (converted to Dhaka time)"),
        "closeHour": dl.strftime("%H"), "closeMinute": dl.strftime("%M"), "closeTimezone": "BST",
        "mainIdea": (
            f"This is a {prof['classification']} tender. {t['buyer']} is seeking a qualified firm for {t['scope']}. "
            f"The tender is published on {'the Bangladesh e-GP portal' if is_egp else 'the agency procurement portal'} "
            f"and evaluated using {t['em']}. (Synthetic demo data.)"
        ),
        "commercial": {
            "tenderSecurity": (f"BDT {sec:,.0f} as bank guarantee or pay order through an e-GP registered bank." if sec
                               else "Bid securing declaration (no monetary security)."),
            "tenderSecurityAmount": sec or 0,
            "tenderSecurityMethod": "Bank guarantee / pay order via e-GP bank" if sec else "Bid securing declaration",
            "contractPeriod": "36 months" if t["prof"] in ("toll", "callcenter", "cyber") else "9 months implementation + 12 months warranty",
            "tenderDocPrice": "BDT 5,000 (online payment)" if is_egp else "Free of charge",
            "schedulePurchaseDeadline": d(dl - timedelta(days=1)) if is_egp else "",
            "schedulePurchaseMethod": "Online payment via e-GP registered bank" if is_egp else "",
            "performanceSecurity": "10% of contract value" if is_egp else "5% of contract value (if requested)",
            "maintenancePeriod": "12 months after go-live",
        },
        "technicalReqs": prof["tech"],
        "technologyMentioned": prof["techs"],
        "operationalReqs": prof["ops"],
        "eligibility": {
            "generalExperience": "Minimum 5 years in ICT business." if is_egp else "Minimum 5 years of relevant corporate experience.",
            "similarExperience": "At least 2 similar contracts completed in the last 5 years.",
            "similarProjectValue": f"Each similar contract of at least {money_text(t, t['value'] * 0.4)}.",
            "avgTurnover": f"Average annual turnover of {money_text(t, t['value'] * 1.5)} over the last 3 years.",
            "financialResources": f"Liquid assets / credit line of {money_text(t, t['value'] * 0.25)}.",
            "certification": "ISO 27001 required." if t["prof"] == "cyber" else "ISO 9001 preferred.",
            "localPresence": "Office in Bangladesh required." if is_egp else "Local presence or local partner preferred.",
        },
        # NOTE: the frontend treats a tender as a JV bid when leadMember / localPartner are filled,
        # so they are only set for tenders we bid as a JV.
        "jv": ({
            "participation": "JV allowed (maximum 3 members).",
            "leadMember": f"{OUR_COMPANY} (lead, must meet 60% of the experience requirement)",
            "memberRules": "Members are jointly and severally liable.",
            "localPartner": next(p["name"] for p in PARTNERS if p["id"] == t["jv"][0]),
            "jvAgreement": "Signed JV agreement or letter of intent required with the bid.",
        } if t.get("jv") else {
            "participation": "Not required; single-bidder participation is expected.",
            "memberRules": "If a JV is formed, members are jointly and severally liable.",
            "jvAgreement": "Only if a JV is formed.",
        }),
        "submissionDocuments": (
            ["Bid submission letter", "Trade license", "TIN and VAT certificates", "Audited financial statements (3 years)",
             "Bank solvency certificate", "Similar experience certificates", "Technical proposal", "Priced BOQ", "Tender security"]
            if is_egp else
            ["Technical proposal submission form", "Proposer information form", "Eligibility and qualification form",
             "Technical proposal", "CVs of key personnel", "Financial proposal (separate envelope)"]),
        "personnel": [dict(position=a, qualification=b, experience=c, qty=q) for a, b, c, q in prof["personnel"]],
        "hardware": [dict(equipment=a, purpose=b) for a, b in prof["hardware"]],
        "dates": {
            "clarificationDeadline": d(dl - timedelta(days=7)),
            "submissionDeadline": iso(dl),
            "schedulePurchaseDeadline": d(dl - timedelta(days=1)) if is_egp else "",
            "openingDate": d(dl),
            "contractSigningDate": d(dl + timedelta(days=45)),
            "workStartDate": d(dl + timedelta(days=60)),
            "possiblePeriod": "36 months" if t["prof"] in ("toll", "callcenter", "cyber") else "9 months",
            "productHandoverDate": d(dl + timedelta(days=330)),
            "maintenancePeriod": "12 months",
        },
        "risks": [dict(type=a, text=b) for a, b in prof["risks"]],
        "managementHighlights": [
            f"Estimated value: {money_text(t, t['value'])}.",
            f"Evaluation: {t['em']}.",
            "JV partner identified." if t.get("jv") else "We can bid alone.",
        ],
        "notes": SYNTHETIC_NOTE,
        "procurementManager": {
            "name": "Procurement focal point (demo)",
            "designation": "Deputy Director (Procurement)" if is_egp else "Procurement Associate",
            "email": "procurement@example.org",
            "phone": "+880 2-0000000",
            "officeAddress": f"{t['buyer']}, Dhaka",
        },
        "helpline": {"phone": "16575" if is_egp else "+880 2-0000001", "email": "helpdesk@example.org",
                     "hours": "Sun-Thu, 09:00-17:00", "notes": "Demo contact details."},
        "tenderType": t["ttype"], "budgetType": t["_budget"], "sourceOfFund": t["_fund"],
        "procurementMethod": t["pm"], "evaluationMethod": t["em"],
    }
    if t.get("lost"):
        summary["notes"] = f"Outcome: {t['lost']} {SYNTHETIC_NOTE}"
    if t.get("declined"):
        summary["notes"] = f"Decision: {t['declined']} {SYNTHETIC_NOTE}"
    return summary


def build_financial_model(t, prof) -> dict:
    v = float(t["value"])
    scenario = prof.get("scenario", "MILESTONE_BASED")
    adv_pct = 10 if scenario == "ADVANCE_AND_MILESTONES" else 0
    if scenario == "ACCEPTANCE_BASED":
        ms = [("Delivery of equipment", 60, "Delivery and inspection certificate"),
              ("Installation and commissioning", 30, "Commissioning certificate"),
              ("Final acceptance", 10, "Final acceptance certificate")]
    elif prof.get("subscription"):
        ms = [("Mobilisation and transition", 10, "Mobilisation report approved"),
              ("Year 1 operation", 30, "Monthly service reports"),
              ("Year 2 operation", 30, "Monthly service reports"),
              ("Year 3 operation", 30, "Monthly service reports and exit plan")]
    else:
        ms = [("Inception report and SRS", 15, "Approval of inception report"),
              ("System design and prototype", 20, "Design sign-off"),
              ("Development and UAT", 35, "UAT sign-off"),
              ("Go-live and training", 20, "Go-live certificate"),
              ("End of warranty", 10, "Warranty completion certificate")]
    milestones = [dict(id=f"MS-{t['n']}-{i}", milestoneNumber=i, name=name, percentage=pct, amount=round(v * pct / 100, 2),
                       deliverable=name, approvalRequired=True, clientReviewDays=14, paymentProcessingDays=30,
                       paymentTrigger=trig, invoiceRequirements="Invoice with VAT challan and approval certificate")
                  for i, (name, pct, trig) in enumerate(ms, start=1)]
    years = 3 if prof.get("subscription") else 1
    esc = 5 if prof.get("subscription") else 0
    base = round(v / years, 2) if prof.get("subscription") else 0
    tiers = [dict(year=y, amount=round(base * (1 + esc / 100) ** (y - 1), 2), rateIncreasePercent=esc if y > 1 else 0)
             for y in range(1, years + 1)] if prof.get("subscription") else []
    return {
        "paymentScenario": scenario,
        "workingCapitalRisk": "HIGH" if scenario == "ACCEPTANCE_BASED" else ("LOW" if adv_pct else "MEDIUM"),
        "advancePayment": dict(enabled=bool(adv_pct), percentage=adv_pct, amount=round(v * adv_pct / 100, 2),
                               bankGuaranteeRequired=bool(adv_pct), bankGuaranteeType="Advance payment guarantee",
                               recoveryType="PRO_RATA_INVOICE", recoveryPercentagePerInvoice=20 if adv_pct else 0,
                               recoveryStartMilestone=2),
        "milestones": milestones,
        "subscriptionModel": dict(pricingModel="MULTI_YEAR_ESCALATION" if prof.get("subscription") else "FIXED_RECURRING",
                                  billingFrequency="MONTHLY" if prof.get("subscription") else "ANNUAL",
                                  annualBaseFee=base, durationYears=years, annualEscalationRate=esc,
                                  calculatedTcv=round(sum(x["amount"] for x in tiers), 2) if tiers else v,
                                  calculatedAcv=base if tiers else v, escalationTiers=tiers),
        "penaltiesAndDeductions": dict(
            liquidatedDamages=dict(enabled=True, rate=0.1, frequency="PER_DAY", calculationBasis="DELAYED_MILESTONE_VALUE",
                                   maxCapPercentage=10, gracePeriodDays=0),
            retentionMoney=dict(enabled=t["src"] == E, percentage=5 if t["src"] == E else 0, releaseCondition="DLP_EXPIRY",
                                dlpMonths=12, interimReleasePercent=0),
            slaDeductionRate=15 if prof.get("subscription") else 0,
            taxDeductionAtSourcePercent=10 if t["src"] == E else 0,
            vatDeductionAtSourcePercent=15 if t["src"] == E else 0),
    }


TASK_TEMPLATE = [
    ("Register and download tender documents on the portal", "Sadia Islam", "HIGH"),
    ("Prepare tender summary and go/no-go brief", "Nusrat Jahan", "HIGH"),
    ("Send clarification questions to the procuring entity", "Nusrat Jahan", "MEDIUM"),
    ("Compile statutory documents (trade license, TIN, VAT, RJSC)", "Rafiq Ahmed", "MEDIUM"),
    ("PROFILE_0", "Farhana Rahman", "HIGH"),
    ("Draft technical methodology and work plan", "Farhana Rahman", "HIGH"),
    ("Finalize key personnel CVs and sign-offs", "Rafiq Ahmed", "MEDIUM"),
    ("PROFILE_1", "Imran Chowdhury", "MEDIUM"),
    ("Build BOQ and price schedule", "Tanvir Hasan", "CRITICAL"),
    ("Arrange tender security / bank guarantee", "Tanvir Hasan", "HIGH"),
    ("Internal compliance review against checklist", "Rafiq Ahmed", "HIGH"),
    ("Final upload and submission on portal", "OWNER", "CRITICAL"),
]

STAGE_TASK_COUNT = {"DISCOVERED": 2, "SCREENING": 4, "UNDER_ANALYSIS": 7, "PREPARATION": 12, "INTERNAL_REVIEW": 12,
                    "SUBMITTED": 12, "AWARDED": 12, "LOST": 12, "DECLINED": 3, "ARCHIVED": 1}


def build_tasks(t, prof, dl: datetime, published: datetime) -> list[TenderTask]:
    stage = t["stage"]
    tpl = []
    for title, who, prio in TASK_TEMPLATE:
        if title.startswith("PROFILE_"):
            idx = int(title[-1])
            if idx >= len(prof["tasks"]):
                continue
            title = prof["tasks"][idx]
        tpl.append((title, t["owner"] if who == "OWNER" else who, prio))
    count = min(STAGE_TASK_COUNT[stage], len(tpl))
    tpl = tpl[:count]
    if stage in POST_SUBMIT:
        done = count
    elif stage == "INTERNAL_REVIEW":
        done = count - 2
    elif stage == "PREPARATION":
        done = max(2, round(count * t["ready"] / 100) - 1)
    elif stage == "UNDER_ANALYSIS":
        done = 3
    elif stage in ("SCREENING", "DECLINED"):
        done = 2
    else:
        done = 0
    tasks = []
    span = max((dl - published).days, 5)
    for i, (title, who, prio) in enumerate(tpl):
        due = published + timedelta(days=round(span * (i + 1) / (len(tpl) + 1)))
        if i < done:
            status = "DONE"
        elif i == done:
            status = "IN_PROGRESS"
        elif i == done + 1 and stage in ("PREPARATION", "INTERNAL_REVIEW"):
            status = "REVIEW"
        else:
            status = "TODO"
        if stage in ("DECLINED", "ARCHIVED") and status != "DONE":
            continue
        # one deliberately overdue task to show in My Tasks
        if stage == "PREPARATION" and status == "TODO" and not any(x.due_date == d(at(-1)) for x in tasks):
            due = at(-1)
        tasks.append(TenderTask(id=f"TSK-{t['n']:03d}-{i + 1:02d}", tender_id=t["id"], title=title, assignee=who,
                                due_date=d(min(due, dl)), status=status, priority=prio))
    return tasks


BASE_REQS = [
    ("Valid trade license (current fiscal year)", "Statutory"),
    ("TIN certificate", "Statutory"),
    ("VAT / BIN registration certificate", "Statutory"),
    ("Audited financial statements (last 3 years)", "Financial"),
    ("Bank solvency certificate (issued within 30 days)", "Financial"),
    ("Similar experience certificates (2 contracts in 5 years)", "Experience"),
    ("Signed CVs of key personnel", "Technical"),
]

REQ_EVIDENCE = {
    "Valid trade license (current fiscal year)": "Trade_License_FY2026-27.pdf",
    "TIN certificate": "TIN_Certificate.pdf",
    "VAT / BIN registration certificate": "VAT_BIN_Registration.pdf",
    "Audited financial statements (last 3 years)": "Audited_Financial_Statements_FY2023-FY2025.pdf",
}

BLOCKERS = {
    18: "Manufacturer authorization letters (MAF)",
    12: "JV agreement / letter of intent",
    20: "Bank solvency certificate (issued within 30 days)",
}


def build_requirements(t, prof) -> list[TenderRequirement]:
    stage = t["stage"]
    reqs = list(BASE_REQS) + list(prof["reqs"])
    if t["src"] == E:
        reqs.append(("Tender security (bank guarantee / pay order)", "Financial"))
    if t.get("jv"):
        reqs.append(("JV agreement / letter of intent", "Legal"))
    if stage in ("DISCOVERED", "ARCHIVED"):
        reqs = reqs[:4]
    owners = {"Statutory": "Rafiq Ahmed", "Financial": "Tanvir Hasan", "Experience": "Rafiq Ahmed",
              "Technical": "Farhana Rahman", "Legal": "Akib Mahamud"}
    out = []
    for i, (title, cat) in enumerate(reqs):
        if stage in POST_SUBMIT or stage == "INTERNAL_REVIEW":
            status = "VERIFIED"
        elif stage == "PREPARATION":
            status = "VERIFIED" if i < len(reqs) - 3 else "PENDING"
        elif stage == "UNDER_ANALYSIS":
            status = "VERIFIED" if i < 3 else "PENDING"
        else:
            status = "PENDING"
        if BLOCKERS.get(t["n"]) == title:
            status = "BLOCKER"
        evidence = REQ_EVIDENCE.get(title) if status == "VERIFIED" else None
        out.append(TenderRequirement(id=f"REQ-{t['n']:03d}-{i + 1:02d}", tender_id=t["id"], title=title, category=cat,
                                     status=status, evidence_file=evidence, owner=owners.get(cat, "Rafiq Ahmed")))
    return out


def doc_sections(t, prof, kind: str) -> list[tuple[str, list[str]]]:
    if kind == "notice":
        return [("Invitation", [f"{t['buyer']} invites sealed bids from eligible bidders for {t['scope']}.",
                                f"Reference: {t['ref']}. Procurement method: {t['pm']}. Evaluation: {t['em']}."]),
                ("Key dates", [f"Submission deadline: {t['_dl'].strftime('%d %b %Y, %H:%M')} (Dhaka time).",
                               "Pre-bid meeting: as per tender data sheet."]),
                ("Eligibility (summary)", ["Valid trade license, TIN and VAT registration.",
                                           "At least 2 similar contracts in the last 5 years."])]
    if kind == "tor":
        return [("Scope of work", prof["tech"]), ("Operational requirements", prof["ops"]),
                ("Technology mentioned", prof["techs"]),
                ("Key personnel", [f"{a} - {b}, {c} (qty {q})" for a, b, c, q in prof["personnel"]] or ["Not applicable."])]
    if kind == "boq":
        v = float(t["value"])
        return [("Bill of quantities (indicative, demo)",
                 [f"Item {i}: {name} - {money_text(t, v * share)}" for i, (name, share) in
                  enumerate([("Software / equipment", 0.45), ("Implementation services", 0.25), ("Training", 0.05),
                             ("Support and maintenance", 0.2), ("Contingency", 0.05)], start=1)])]
    if kind == "technical":
        return [("Understanding of the assignment", [f"We understand that {t['buyer']} requires {t['scope']}."]),
                ("Approach and methodology", prof["tech"]),
                ("Team", [f"{a}: proposed staff from {OUR_COMPANY}" for a, *_ in prof["personnel"]] or ["Delivery team as per BOQ."]),
                ("Risks and mitigation", [r[1] for r in prof["risks"]])]
    if kind == "price":
        return [("Price schedule (confidential, demo)",
                 [f"Total quoted price: {money_text(t, float(t['value']) * 0.96)} (excluding VAT).",
                  "Validity: 120 days from the submission deadline."])]
    if kind == "receipt":
        return [("Submission acknowledgement", [f"Tender/Proposal ID {t['ref']} submitted by {OUR_COMPANY}.",
                                                f"Submitted at {(t['_dl'] - timedelta(hours=6)).strftime('%d %b %Y, %H:%M')} (Dhaka time).",
                                                "Status: submitted and locked."])]
    if kind == "noa":
        return [("Notification of award", [f"{t['buyer']} is pleased to notify {OUR_COMPANY} of the award of contract {t['ref']}.",
                                           "Please furnish the performance security within 14 days and sign the contract within 28 days."])]
    return [("Content", [f"Demo document for {t['title']}."])]


def build_documents(t, prof, storage_root: Path, vault: dict) -> list[TenderDocument]:
    stage = t["stage"]
    sidx = STAGE_ORDER.index(stage) if stage in STAGE_ORDER else 0
    is_egp = t["src"] == E
    plan = []  # (folder, name, kind, access, extra)
    if is_egp:
        plan += [("01_original_tender_documents", f"{t['ref']}_Tender_Notice.pdf", "notice", "ALL_TEAM", {}),
                 ("01_original_tender_documents", f"{t['ref']}_Tender_Document_TDS_ToR.pdf", "tor", "ALL_TEAM", {})]
    else:
        plan += [("01_original_tender_documents", f"{t['ref'].replace('/', '-')}_RFP_Document.pdf", "notice", "ALL_TEAM", {}),
                 ("01_original_tender_documents", "Terms_of_Reference.pdf", "tor", "ALL_TEAM", {})]
    if sidx >= 1 or stage == "DECLINED":
        plan.append(("01_original_tender_documents", "BOQ_Price_Schedule_Template.pdf" if is_egp else "Annex_Forms_and_Financial_Template.pdf",
                     "boq", "ALL_TEAM", {}))
    if sidx >= 3:
        for i, name in enumerate(prof["tech_docs"]):
            extra = {}
            if stage == "PREPARATION" and name == "Key_Personnel_CVs.pdf" and t["n"] in (18, 20):
                extra = dict(status="ACTION_REQUIRED", action_comment="Two CVs are unsigned. Please re-upload signed copies.",
                             requested_by="Tanvir Hasan", action_due_date=d(at(1)))
            elif stage == "PREPARATION" and t["ready"] >= 85 and i == 0:
                extra = dict(status="PENDING_REVIEW")
            plan.append(("03_technical_proposal", name, "technical", "ALL_TEAM", extra))
        plan.append(("04_financial_proposal", "Priced_BOQ_and_Price_Schedule.pdf", "price", "RESTRICTED_FINANCE", {}))
        if is_egp:
            plan.append(("04_financial_proposal", "Tender_Security_Bank_Guarantee.pdf", "price", "RESTRICTED_FINANCE", {}))
    if stage in POST_SUBMIT:
        plan.append(("05_final_submission_package", "Final_Submission_Package.pdf", "technical", "MANAGEMENT_ONLY", {}))
        plan.append(("06_submission_receipts", "e-GP_Submission_Receipt.pdf" if is_egp else "Portal_Submission_Acknowledgement.pdf",
                     "receipt", "ALL_TEAM", {}))
    if stage == "AWARDED":
        plan.append(("06_submission_receipts", "Notification_of_Award.pdf", "noa", "MANAGEMENT_ONLY", {}))

    docs = []
    uploaded_base = t["_published"]
    for i, (folder, name, kind, access, extra) in enumerate(plan, start=1):
        rel = Path("tenders") / t["id"] / folder / name
        data = write_pdf(storage_root / rel, name.replace("_", " ").replace(".pdf", ""),
                         [f"Tender: {t['title']}", f"Reference: {t['ref']}", f"Buyer: {t['buyer']}", f"Folder: {folder}"],
                         doc_sections(t, prof, kind))
        sha, size = file_meta(data)
        when = min(uploaded_base + timedelta(days=i), NOW)
        docs.append(TenderDocument(
            id=f"DOC-{t['n']:03d}-{i:02d}", tender_id=t["id"], name=name, folder=folder,
            company_name=OUR_COMPANY, company_role="LEAD_BIDDER", is_jv_partner=False,
            size=size, revision="v1.0" if kind != "technical" else f"v{1 + i % 3}.0", sha256=sha,
            uploaded_at=when.strftime("%Y-%m-%d %H:%M"), access_level=access,
            file_path=str((storage_root / rel).resolve()), status=extra.get("status", "VERIFIED" if folder != "01_original_tender_documents" else "CLEARED"),
            action_comment=extra.get("action_comment"), requested_by=extra.get("requested_by"),
            action_due_date=extra.get("action_due_date"), is_reusable_link=False))

    # statutory documents linked from the master vault
    # (the Document Vault tab shows a JV folder layout - 02A/02B/02C - for JV bids)
    statutory_folder = "02B_lead_statutory_documents" if t.get("jv") else "02_company_statutory_documents"
    if sidx >= 2:
        for j, key in enumerate(["trade", "tin", "vat", "audited"], start=1):
            v = vault[key]
            docs.append(TenderDocument(
                id=f"DOC-{t['n']:03d}-L{j}", tender_id=t["id"], name=v.name, folder=statutory_folder,
                company_name=OUR_COMPANY, company_role="LEAD_BIDDER", size=v.size, revision=v.revision, sha256=v.sha256,
                uploaded_at=(uploaded_base + timedelta(days=2)).strftime("%Y-%m-%d %H:%M"), is_reusable_link=True,
                reusable_source_id=v.id, access_level=v.access_level, file_path=v.file_path, status="VERIFIED"))
    # JV partner documents
    if t.get("jv") and sidx >= 3:
        partner = next(p for p in PARTNERS if p["id"] == t["jv"][0])
        for j, (name, jv_folder) in enumerate([("JV_Agreement_Signed.pdf", "02C_jv_agreement_and_poa"),
                                               ("Power_of_Attorney_JV_Lead.pdf", "02C_jv_agreement_and_poa"),
                                               (f"{partner['name'].split()[0]}_Trade_License.pdf", "02A_jv_partner_credentials"),
                                               (f"{partner['name'].split()[0]}_Audited_Financials.pdf", "02A_jv_partner_credentials")], start=1):
            rel = Path("tenders") / t["id"] / jv_folder / name
            data = write_pdf(storage_root / rel, name.replace("_", " ").replace(".pdf", ""),
                             [f"Partner: {partner['name']}", f"Tender: {t['title']}"],
                             [("Content", [f"Joint venture between {OUR_COMPANY} (lead) and {partner['name']} for {t['ref']}."])])
            sha, size = file_meta(data)
            docs.append(TenderDocument(
                id=f"DOC-{t['n']:03d}-J{j}", tender_id=t["id"], name=name, folder=jv_folder,
                company_name=OUR_COMPANY if "Power_of_Attorney" in name else partner["name"],
                company_role="LEAD_BIDDER" if "Power_of_Attorney" in name else "JV_PARTNER",
                is_jv_partner="Power_of_Attorney" not in name, size=size, revision="v1.0",
                sha256=sha, uploaded_at=(uploaded_base + timedelta(days=3)).strftime("%Y-%m-%d %H:%M"),
                access_level="ALL_TEAM", file_path=str((storage_root / rel).resolve()),
                status="PENDING_REVIEW" if stage in ("UNDER_ANALYSIS", "PREPARATION") else "VERIFIED", is_reusable_link=False))
    return docs


COMMENT_BANK = {
    "DISCOVERED": [("Nusrat Jahan", "Picked this up from the portal this morning. Summary to follow by tomorrow.")],
    "SCREENING": [("Nusrat Jahan", "Eligibility looks fine on turnover; similar-experience clause needs a closer read."),
                  ("Akib Mahamud", "Let's take this to Thursday's go/no-go meeting.")],
    "UNDER_ANALYSIS": [("Farhana Rahman", "Scope is a good fit. Main risk is the integration effort with the legacy system."),
                       ("Tanvir Hasan", "First-cut costing is within the estimate if we reuse our framework."),
                       ("Akib Mahamud", "Conditional go. Send clarifications on integration before we commit resources.")],
    "PREPARATION": [("Rafiq Ahmed", "Statutory folder is complete. Waiting on the bank for the solvency certificate."),
                    ("Tanvir Hasan", "Pricing draft v2 uploaded to the financial folder (restricted)."),
                    ("Farhana Rahman", "Methodology section is ready for review."),
                    ("Akib Mahamud", "Please keep the submission at least 6 hours before the deadline.")],
    "INTERNAL_REVIEW": [("Akib Mahamud", "Final review meeting set for today 16:00. Please close open comments before then."),
                        ("Rafiq Ahmed", "Compliance checklist: all items verified.")],
    "SUBMITTED": [("Sadia Islam", "Submitted on the portal; receipt uploaded to folder 06."),
                  ("Akib Mahamud", "Good work, team. Let's track the opening date.")],
    "AWARDED": [("Akib Mahamud", "We have received the notification of award."),
                ("Tanvir Hasan", "Performance security arranged with the bank.")],
    "LOST": [("Akib Mahamud", "Result published. Lessons-learned note added to the summary.")],
    "DECLINED": [("Akib Mahamud", "Marking as no-go. Reason recorded in the summary notes.")],
    "ARCHIVED": [("Sadia Islam", "Buyer cancelled the tender. Archived.")],
}


def build_comments(t) -> list[TenderComment]:
    out = []
    bank = COMMENT_BANK.get(t["stage"], [])
    base = min(t["_published"] + timedelta(days=1), NOW - timedelta(hours=len(bank) * 5 + 1))
    for i, (who, text) in enumerate(bank, start=1):
        m = TEAM_BY_NAME[who]
        out.append(TenderComment(id=f"CMT-{t['n']:03d}-{i}", tender_id=t["id"], channel_id=f"tender-{t['id']}",
                                 author_name=who, author_role=m["role"], author_avatar=m["avatar"], content=text,
                                 created_at=utc_naive(base + timedelta(hours=i * 5))))
    return out


def build_matrix(t) -> TenderDecisionMatrix | None:
    if t["stage"] in ("DISCOVERED", "SCREENING", "ARCHIVED"):
        return None
    if t["stage"] == "DECLINED":
        tech, fin, team, sla = 55, 30, 50, 60
        status, rationale = "NO_GO", t["declined"]
    else:
        tech = RNG.randint(72, 92)
        fin = RNG.randint(65, 88)
        team = RNG.randint(70, 90)
        sla = RNG.randint(68, 90)
        status = t.get("decision", "GO")
        rationale = "Strong technical fit and manageable commercial risk." if status == "GO" else \
            "Proceed only if the JV partner confirms references and integration risk is clarified."
    comp = round(tech * 0.35 + fin * 0.30 + team * 0.20 + sla * 0.15, 1)
    return TenderDecisionMatrix(tender_id=t["id"], technical_score=tech, financial_score=fin, team_score=team,
                                sla_score=sla, composite_score=comp, threshold=70.0, status=status, rationale=rationale)


def build_fin_rules(t, prof) -> list[TenderFinancialRule]:
    cur = "BDT" if t["src"] == E else "USD"
    v = float(t["value"])
    rules = [
        dict(rule_category="PAYMENT_TERMS", rule_type="Milestone payment", percentage=None, payment_trigger="Approval of milestone deliverable",
             payment_due_days=30, risk_level="MEDIUM", original_clause="Payment shall be made within 30 days of approval of each milestone.", page_number="42"),
        dict(rule_category="PENALTY", rule_type="Liquidated damages", penalty_rate=0.1, penalty_frequency="PER_DAY", maximum_penalty=round(v * 0.1, 2),
             penalty_basis="Delayed milestone value", risk_level="HIGH", original_clause="LD at 0.1% per day of delay, capped at 10% of contract value.", page_number="47"),
        dict(rule_category="PERFORMANCE_SECURITY", rule_type="Bank guarantee", percentage=10 if t["src"] == E else 5,
             financial_value=round(v * (0.10 if t["src"] == E else 0.05), 2), risk_level="MEDIUM",
             original_clause="Performance security to be furnished within 14 days of the notification of award.", page_number="39"),
    ]
    if t["src"] == E:
        rules.append(dict(rule_category="TAX", rule_type="AIT and VAT at source", tax_rate=10, vat_rate=15, risk_level="LOW",
                          original_clause="Income tax and VAT will be deducted at source as per prevailing rates.", page_number="51"))
    if prof.get("subscription"):
        rules.append(dict(rule_category="SUBSCRIPTION", rule_type="Monthly service fee", subscription_type="FIXED_RECURRING",
                          subscription_frequency="MONTHLY", contract_duration="36 months", price_escalation="None",
                          risk_level="MEDIUM", original_clause="Monthly fee is fixed for the contract duration.", page_number="44"))
    out = []
    for i, r in enumerate(rules, start=1):
        out.append(TenderFinancialRule(id=f"FIN-{t['n']:03d}-{i}", tender_id=t["id"], currency=cur, payment_currency=cur,
                                       source_document="Tender_Document_TDS_ToR.pdf", **r))
    return out


# ---------------------------------------------------------------------------
# Wipe
# ---------------------------------------------------------------------------

def safe_url() -> str:
    from sqlalchemy.engine import make_url
    return make_url(settings.DATABASE_URL).render_as_string(hide_password=True)


def database_name() -> str:
    from sqlalchemy.engine import make_url
    url = make_url(settings.DATABASE_URL)
    return Path(url.database).name if url.get_backend_name() == "sqlite" else (url.database or "")


def backup_database(backup_dir: Path) -> Path:
    """Full backup of the target database before the wipe. Exits if it fails."""
    import subprocess
    from sqlalchemy.engine import make_url
    url = make_url(settings.DATABASE_URL)
    backend = url.get_backend_name()
    stamp = datetime.now(DHAKA).strftime("%Y%m%d_%H%M%S")
    backup_dir.mkdir(parents=True, exist_ok=True)
    if backend == "sqlite":
        src = Path(url.database)
        dst = backup_dir / f"pre_demo_{src.stem}_{stamp}.db"
        if src.exists():
            shutil.copy2(src, dst)
        return dst
    if backend in ("mysql", "mariadb"):
        dump = shutil.which("mysqldump") or shutil.which("mariadb-dump")
        if not dump:
            print("STOP: mysqldump was not found. Install the MySQL client (e.g. sudo apt install mysql-client)")
            print("or back up manually and re-run with --skip-backup.")
            sys.exit(1)
        dst = backup_dir / f"pre_demo_{url.database}_{stamp}.sql"
        cmd = [dump, "--single-transaction", "--no-tablespaces", "--default-character-set=utf8mb4",
               "-h", url.host or "127.0.0.1", "-P", str(url.port or 3306), "-u", url.username or "root", url.database]
        env = dict(os.environ, MYSQL_PWD=url.password or "")
        with open(dst, "wb") as fh:
            res = subprocess.run(cmd, stdout=fh, stderr=subprocess.PIPE, env=env)
        ok = res.returncode == 0 and dst.exists() and b"CREATE TABLE" in dst.read_bytes()[:2_000_000]
        if not ok:
            dst.unlink(missing_ok=True)
            print("STOP: the backup failed, nothing was changed.")
            print(res.stderr.decode(errors="replace")[:600])
            sys.exit(1)
        return dst
    if backend == "postgresql":
        dump = shutil.which("pg_dump")
        if not dump:
            print("STOP: pg_dump was not found. Back up manually and re-run with --skip-backup.")
            sys.exit(1)
        dst = backup_dir / f"pre_demo_{url.database}_{stamp}.sql"
        cmd = [dump, "-h", url.host or "127.0.0.1", "-p", str(url.port or 5432), "-U", url.username or "postgres",
               "-f", str(dst), url.database]
        res = subprocess.run(cmd, stderr=subprocess.PIPE, env=dict(os.environ, PGPASSWORD=url.password or ""))
        if res.returncode != 0:
            print("STOP: the backup failed, nothing was changed.")
            print(res.stderr.decode(errors="replace")[:600])
            sys.exit(1)
        return dst
    print(f"STOP: no automatic backup for '{backend}'. Back up manually and re-run with --skip-backup.")
    sys.exit(1)


def remove_demo_rows(db):
    """Merge mode: delete only rows this script creates (by id / owner), leave everything else."""
    print("  - merge mode: removing only previous demo rows, existing data is kept")
    tids = DEMO_TENDER_IDS
    pids = [p["id"] for p in PARTNERS]
    uids = [m["id"] for m in TEAM]
    for model in (ResourceShare, AuthorizationAuditLog):
        db.query(model).filter(model.tender_id.in_(tids)).delete(synchronize_session=False)
    db.query(AuthorizationAuditLog).filter(
        AuthorizationAuditLog.user_id.in_(uids) | AuthorizationAuditLog.partner_organization_id.in_(pids)
    ).delete(synchronize_session=False)
    for model in (TenderPartnerAssignment, TenderSubmission, TenderDecisionMatrix, TenderFinancialRule, TenderComment,
                  TenderRequirement, TenderTask, TenderDocument, TenderFolder):
        db.query(model).filter(model.tender_id.in_(tids)).delete(synchronize_session=False)
    db.query(Tender).filter(Tender.id.in_(tids)).delete(synchronize_session=False)
    db.query(PartnerPermissionCeiling).filter(PartnerPermissionCeiling.partner_organization_id.in_(pids)).delete(synchronize_session=False)
    db.query(AccessBlock).filter(AccessBlock.subject_id.in_(pids)).delete(synchronize_session=False)
    db.query(PermissionRule).filter(PermissionRule.subject_type != "ROLE",
                                    PermissionRule.subject_id.in_(pids + uids)).delete(synchronize_session=False)
    db.query(PartnerOrganization).filter(PartnerOrganization.id.in_(pids)).delete(synchronize_session=False)
    db.query(ReusableDocument).filter(ReusableDocument.id.like("RUD-DEMO-%")).delete(synchronize_session=False)
    db.query(CompanyProjectCredential).filter(CompanyProjectCredential.id.like("PROJ-DEMO%")).delete(synchronize_session=False)
    db.query(CompanyProfile).filter(CompanyProfile.id.like("COMP-DEMO-%")).delete(synchronize_session=False)
    db.query(ClientVisit).filter(ClientVisit.id.like("VIS-DEMO-%")).delete(synchronize_session=False)
    db.query(ChatChannelMessage).filter(ChatChannelMessage.id.like("MSG-DEMO-%")).delete(synchronize_session=False)
    db.query(User).filter(User.id.in_(uids) | User.email.in_([m["email"] for m in TEAM])).delete(synchronize_session=False)
    db.query(Organization).filter(Organization.id.in_([o[0] for o in EXTRA_ORGS])).delete(synchronize_session=False)
    db.query(TenderCategory).filter(TenderCategory.name == "ICT Hardware & Networking").delete(synchronize_session=False)
    db.commit()


def wipe(db, storage_root: Path, keep_users: bool = False, merge: bool = False):
    if merge:
        remove_demo_rows(db)
        demo_dirs = [storage_root / "tenders" / tid for tid in DEMO_TENDER_IDS]
        demo_dirs.append(storage_root / "master_library" / "demo")
        for comp in (OUR_COMPANY, "Meghna Data Systems Ltd", "Kestrel Port Automation Pte Ltd", "Sundarban GeoInfo Ltd"):
            demo_dirs.append(storage_root / "companies" / "".join(ch if ch.isalnum() else "_" for ch in comp))
        for pth in demo_dirs:
            if pth.exists():
                shutil.rmtree(pth, ignore_errors=True)
        return
    print("  - clearing previous tenders, documents, visits, chat, partners and demo users")
    for model in (ResourceShare, AuthorizationAuditLog, AccessBlock, PartnerPermissionCeiling, TenderPartnerAssignment,
                  PartnerOrganization, TenderSubmission, TenderDecisionMatrix, TenderFinancialRule, TenderComment,
                  TenderRequirement, TenderTask, TenderDocument, TenderFolder, Tender, ReusableDocument,
                  CompanyProjectCredential, CompanyProfile, ClientVisit, ChatChannelMessage):
        db.query(model).delete(synchronize_session=False)
    db.query(PermissionRule).filter(PermissionRule.subject_type != "ROLE").delete(synchronize_session=False)
    if keep_users:
        db.query(User).filter(User.id.in_([m["id"] for m in TEAM]) | User.email.in_([m["email"] for m in TEAM])).delete(
            synchronize_session=False)
    else:
        db.query(User).filter(User.role != "SUPER_ADMIN").delete(synchronize_session=False)
    db.query(Organization).filter(Organization.id.in_([o[0] for o in EXTRA_ORGS])).delete(synchronize_session=False)
    db.query(TenderCategory).filter(TenderCategory.name == "ICT Hardware & Networking").delete(synchronize_session=False)
    db.commit()
    # remove only folders this script creates
    demo_dirs = [storage_root / "tenders" / tid for tid in DEMO_TENDER_IDS]
    demo_dirs.append(storage_root / "master_library" / "demo")
    for comp in (OUR_COMPANY, "Meghna Data Systems Ltd", "Kestrel Port Automation Pte Ltd", "Sundarban GeoInfo Ltd"):
        demo_dirs.append(storage_root / "companies" / "".join(ch if ch.isalnum() else "_" for ch in comp))
    for p in demo_dirs:
        if p.exists():
            shutil.rmtree(p, ignore_errors=True)


def serve(port: int):
    import uvicorn
    from app.main import app as fastapi_app
    print(f"\nStarting the API on the demo database at http://127.0.0.1:{port}  (Ctrl+C to stop)")
    print("Start the frontend in another terminal:  cd frontend && npm run dev")
    uvicorn.run(fastapi_app, host="127.0.0.1", port=port)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = ARGS
    if args.serve_only:
        serve(args.port)
        return

    if args.live:
        name = database_name()
        if args.confirm_wipe != name:
            print(f"STOP: live mode wipes the database '{name}' ({safe_url()}).")
            print(f"To confirm, re-run with:  --confirm-wipe {name}")
            sys.exit(1)
        args.force = True
    else:
        main_db = (BACKEND_DIR / "tender_tracker.db").resolve().as_posix()
        if settings.DATABASE_URL.endswith(main_db) and not args.force:
            print("STOP: the target is your main database (backend/tender_tracker.db). Use the default demo database.")
            sys.exit(1)

    storage_root = Path(settings.STORAGE_ROOT).resolve()
    print("=" * 72)
    print(" TenderTracker - synthetic demo data" + ("   [LIVE MODE: wipe and replace]" if args.live else ""))
    print(f" Database : {safe_url()}")
    print(f" Storage  : {storage_root}")
    print(f" Clock    : {NOW.strftime('%a %d %b %Y, %H:%M')} (Dhaka)")
    print("=" * 72)

    if args.live:
        if args.skip_backup:
            print("  - backup SKIPPED (--skip-backup)")
        else:
            bdir = Path(args.backup_dir).resolve() if args.backup_dir else (BACKEND_DIR.parent / "backups").resolve()
            dst = backup_database(bdir)
            print(f"  - backup written before any change: {dst}  ({dst.stat().st_size / 1024:.0f} KB)")

    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        seed_database(db)  # settings, categories, permission catalog, role rules, admin, organizations

        foreign = db.query(Tender).filter(Tender.id.notin_(DEMO_TENDER_IDS)).count()
        if foreign and not args.force:
            print(f"\nSTOP: this database already holds {foreign} tender(s) that were not created by this script.")
            print("Point DATABASE_URL at a separate demo database (see the header of this file),")
            print("or re-run with --force if you really want to wipe it.")
            sys.exit(1)

        if args.live:
            print(f"  - existing data: {db.query(Tender).count()} tenders, {db.query(User).count()} users, "
                  f"{db.query(TenderDocument).count()} tender documents, {db.query(ClientVisit).count()} client visits")

        wipe(db, storage_root, keep_users=args.keep_users, merge=args.merge)

        # ---- organisations & category -------------------------------------------------
        for oid, name, short, web, prio in EXTRA_ORGS:
            db.add(Organization(id=oid, name=name, short_name=short, type="OTHER", country="Bangladesh", website=web,
                                priority=prio, description="UN agency (added for the demo)."))
        db.add(TenderCategory(name="ICT Hardware & Networking", description="Computers, servers, network and security appliances.",
                              color_badge="indigo"))
        for oid in ("ORG-BD-RHD", "ORG-BD-RUPALIBANK", "ORG-BD-SONALIBANK", "ORG-BD-BCC", "ORG-BD-AGRANIBANK"):
            org = db.query(Organization).filter(Organization.id == oid).first()
            if org:
                org.priority = "HIGH"
        db.commit()

        # ---- team -----------------------------------------------------------------------
        print("  - team members")
        pw = get_password_hash(DEMO_PASSWORD)
        for m in TEAM:
            cv = CV_DATA[m["name"]]
            roles = {}
            for t in TENDERS:
                if t["stage"] in ("PREPARATION", "INTERNAL_REVIEW", "UNDER_ANALYSIS") and t["owner"] == m["name"]:
                    roles[t["id"]] = "LEAD_MANAGER"
            db.add(User(
                id=m["id"], name=m["name"], email=m["email"], hashed_password=pw, role=m["role"], title=m["title"],
                department=m["department"], max_capacity=m["cap"], avatar=m["avatar"], phone=m["phone"],
                location="Dhaka, Bangladesh", employment_type="PERMANENT", proposed_designation=m["designation"],
                certifications=cv["certs"], education=cv["edu"], active_tender_roles=roles,
                past_assignments=[dict(id=f"PA-{m['id']}-{i}", projectName=p[0], client=p[1], role=p[2], duration=p[3],
                                       deploymentMonths=12, keyDeliverables=p[4], technologiesUsed=p[5],
                                       coreResponsibilities=f"{p[2]} responsible for delivery and client coordination.")
                                  for i, p in enumerate(cv["past"], start=1)]))
        db.commit()

        # ---- master document vault ------------------------------------------------------
        print("  - master document vault (with real PDF files)")
        vault_dir = storage_root / "master_library" / "demo"
        vault_items = [
            ("trade", "Trade_License_FY2026-27.pdf", "Company Statutory", 250, "ALL_TEAM", "Trade license issued by Dhaka North City Corporation."),
            ("tin", "TIN_Certificate.pdf", "Financial & Tax", None, "ALL_TEAM", "e-TIN certificate."),
            ("vat", "VAT_BIN_Registration.pdf", "Financial & Tax", None, "ALL_TEAM", "VAT / BIN registration (Mushak 2.3)."),
            ("rjsc", "RJSC_Certificate_of_Incorporation.pdf", "Company Statutory", None, "ALL_TEAM", "Certificate of incorporation and memorandum."),
            ("audited", "Audited_Financial_Statements_FY2023-FY2025.pdf", "Financial & Tax", 160, "RESTRICTED_FINANCE", "Three years of audited statements."),
            ("solvency", "Bank_Solvency_Certificate.pdf", "Financial & Tax", 12, "RESTRICTED_FINANCE", "Bank solvency certificate (valid 30 days)."),
            ("iso9001", "ISO_9001_2015_Certificate.pdf", "Certifications & ISO", 420, "ALL_TEAM", "Quality management certificate."),
            ("iso27001", "ISO_27001_2022_Certificate.pdf", "Certifications & ISO", 45, "ALL_TEAM", "Information security certificate."),
            ("basis", "BASIS_Membership_Certificate.pdf", "Company Statutory", -5, "ALL_TEAM", "BASIS membership (renewal overdue)."),
            ("egp", "e-GP_Tenderer_Registration.pdf", "Company Statutory", 20, "ALL_TEAM", "e-GP tenderer registration certificate."),
            ("itr", "Income_Tax_Return_Acknowledgement_FY2025-26.pdf", "Financial & Tax", 250, "RESTRICTED_FINANCE", "Tax return acknowledgement."),
            ("profile", "Company_Profile_2026.pdf", "Company Statutory", None, "ALL_TEAM", "Corporate capability statement."),
            ("poa", "Power_of_Attorney_Authorized_Signatory.pdf", "Legal & Governance", 300, "MANAGEMENT_ONLY", "Power of attorney for bid signing."),
            ("meghna_tl", "Meghna_Data_Systems_Trade_License.pdf", "Company Statutory", 180, "ALL_TEAM", "JV partner trade license."),
            ("cv_fr", "CV_Farhana_Rahman_Technical_Lead.pdf", "Key Personnel CV", None, "MANAGEMENT_ONLY", "Signed CV of the proposed technical lead."),
            ("cv_ic", "CV_Imran_Chowdhury_Solution_Architect.pdf", "Key Personnel CV", None, "MANAGEMENT_ONLY", "Signed CV of the proposed solution architect."),
            ("cc_bundle", "Completion_Certificates_2021-2025.pdf", "Past Credentials", None, "ALL_TEAM", "Bundle of completion certificates for similar projects."),
        ]
        vault = {}
        for i, (key, name, cat, exp_days, access, desc) in enumerate(vault_items, start=1):
            path = vault_dir / name
            data = write_pdf(path, name.replace("_", " ").replace(".pdf", ""),
                             [f"Holder: {'Meghna Data Systems Ltd' if key == 'meghna_tl' else OUR_COMPANY}", f"Category: {cat}"],
                             [("Description", [desc, "This certificate is synthetic and exists only for the demo."])])
            sha, size = file_meta(data)
            rd = ReusableDocument(
                id=f"RUD-DEMO-{i:02d}", name=name, category=cat,
                company_name="Meghna Data Systems Ltd" if key == "meghna_tl" else OUR_COMPANY,
                company_role="JV_PARTNER" if key == "meghna_tl" else "LEAD_BIDDER", is_jv_partner=key == "meghna_tl",
                uploaded_at=d(at(-RNG.randint(20, 200))), expiry_date=d(at(exp_days)) if exp_days is not None else None,
                size=size, revision="v1.0", access_level=access, sha256=sha, description=desc, file_path=str(path.resolve()))
            db.add(rd)
            vault[key] = rd
        db.commit()

        # ---- partners ---------------------------------------------------------------
        print("  - JV partners, ceilings and access rules")
        for p in PARTNERS:
            db.add(PartnerOrganization(id=p["id"], name=p["name"], partner_type=p["type"], country=p["country"],
                                       contact_email=p["email"], contact_phone=p["phone"], status=p["status"], notes=p["notes"]))
        db.commit()
        allowed = ["tender.view", "task.view", "document.view", "document.preview", "document.download", "document.upload"]
        denied = ["financial.view", "financial.edit", "document.delete", "document.share", "submission.submit"]
        for p in PARTNERS:
            for code in allowed:
                db.add(PartnerPermissionCeiling(partner_organization_id=p["id"], permission_code=code,
                                                allowed=p["status"] == "ACTIVE", created_by="Akib Mahamud"))
            for code in denied:
                db.add(PartnerPermissionCeiling(partner_organization_id=p["id"], permission_code=code, allowed=False,
                                                created_by="Akib Mahamud"))
        db.add(AccessBlock(subject_type="ORGANIZATION", subject_id="ORG-SUB-NORTHGATE", block_type="ORGANIZATION_SUSPENDED",
                           reason="NDA expired; access suspended until renewal.", expires_at=d(at(30)),
                           created_by="Akib Mahamud", is_active=True))
        db.add(PermissionRule(subject_type="USER", subject_id="USR-DEMO-04", permission_code="financial.view", effect="ALLOW",
                              scope_type="TENDER", scope_id=TENDER_BY_N[20]["id"], created_by="Tanvir Hasan",
                              expires_at=d(at(10))))
        db.add(PermissionRule(subject_type="USER", subject_id="USR-DEMO-06", permission_code="document.delete", effect="DENY",
                              scope_type="ORGANIZATION", scope_id="ALL", created_by="Akib Mahamud"))
        db.add(PermissionRule(subject_type="PARTNER_ORGANIZATION", subject_id="ORG-JV-MEGHNA", permission_code="financial.view",
                              effect="DENY", scope_type="TENDER", scope_id=TENDER_BY_N[24]["id"], created_by="Akib Mahamud"))
        db.commit()

        # ---- tenders --------------------------------------------------------------------
        print(f"  - {len(TENDERS)} tenders with tasks, requirements, documents, comments and financials")
        for t in TENDERS:
            prof = P[t["prof"]]
            dl = deadline_of(t)
            published = dl - timedelta(days=RNG.randint(14, 28))
            t["_dl"], t["_published"] = dl, published
            is_egp = t["src"] == E
            t["_budget"] = ("Revenue / Operational Budget (Opex)" if "Bank" in t["buyer"] else "Development Budget (ADP / Capex)") if is_egp else "Grant / Aid Budget"
            t["_fund"] = ("Organization's Own Fund" if "Bank" in t["buyer"] or "Biman" in t["buyer"] else "Government of Bangladesh (GoB)") if is_egp else "UNDP / UN Agencies"
            t["_security"] = round(t["value"] * 0.02, -3) if is_egp else None
            delta = dl - NOW
            hours = max(0, int(delta.total_seconds() // 3600))
            decision = {"DISCOVERED": "PENDING", "SCREENING": "PENDING", "ARCHIVED": "PENDING", "DECLINED": "NO_GO"}.get(
                t["stage"], t.get("decision", "GO"))
            summary = build_summary(t, prof, dl, published)
            lead = TEAM_BY_NAME[t["owner"]]
            row = Tender(
                id=t["id"], reference_no=t["ref"], title=t["title"], organization=t["buyer"], country="Bangladesh",
                category=t["cat"], estimated_value=float(t["value"]), currency="BDT" if is_egp else "USD",
                exchange_rate_to_bdt=1.0 if is_egp else 122.0, exchange_rate_date=d(at(-1)),
                estimated_value_bdt=tender_value_bdt(t), stage=t["stage"], decision=decision, priority=t["prio"],
                submission_deadline=iso(dl), days_remaining=max(0, delta.days), hours_remaining=hours,
                readiness_score=t["ready"], lead_owner_name=lead["name"], lead_owner_role=lead["title"],
                summary_json=json.dumps(summary), languages=["English", "Bangla"] if is_egp else ["English"],
                important_clauses=[dict(id=f"CLS-{t['n']:03d}-{i}", clause_title=c[0], category=c[1], criticality=c[2],
                                        doc_reference=c[3], doc_file_name="Tender_Document_TDS_ToR.pdf", page_number=str(20 + i * 7),
                                        clause_text=c[4], implication=c[5]) for i, c in enumerate(prof["clauses"], start=1)],
                procurement_manager_name="Procurement focal point (demo)",
                procurement_manager_designation=summary["procurementManager"]["designation"],
                procurement_manager_email="procurement@example.org", procurement_manager_phone="+880 2-0000000",
                helpline_phone=summary["helpline"]["phone"], helpline_email="helpdesk@example.org", helpline_hours="Sun-Thu, 09:00-17:00",
                tender_type=t["ttype"], budget_type=t["_budget"], source_of_fund=t["_fund"], procurement_method=t["pm"],
                evaluation_method=t["em"], opening_date=d(dl), contract_signing_date=d(dl + timedelta(days=45)),
                work_start_date=d(dl + timedelta(days=60)), possible_period=summary["dates"]["possiblePeriod"],
                product_handover_date=d(dl + timedelta(days=330)), maintenance_period="12 months",
                schedule_purchase_deadline=d(dl - timedelta(days=1)) if is_egp else None,
                schedule_purchase_method="Online payment via e-GP registered bank" if is_egp else None,
                tender_security_amount=t["_security"],
                tender_security_method="Bank guarantee / pay order via e-GP bank" if is_egp else None,
                archived_from_stage=t.get("archived_from"),
                created_at=utc_naive(published), amendments=[], post_award_data={}, financial_model={},
            )
            if t["stage"] in ("PREPARATION", "INTERNAL_REVIEW", "SUBMITTED", "AWARDED", "LOST"):
                row.financial_model = build_financial_model(t, prof)
            if t.get("amend"):
                old = dl - timedelta(days=5)
                row.amendments = [dict(id=f"AMD-{t['id']}-1", amendmentNumber=1, title="Corrigendum 1: deadline extension and revised storage capacity",
                                       issuedDate=d(at(-3)), isDeadlineExtended=True, previousDeadline=iso(old), newDeadline=iso(dl),
                                       newRules=["Usable storage capacity increased from 200 TB to 250 TB."],
                                       ruleChangesDescription="Storage capacity revised in Section 6.",
                                       referenceNotice="Corrigendum No. 1", notes="Pricing must be updated.", createdAt=iso(at(-3)))]
                row.important_clauses = row.important_clauses + [dict(
                    id=f"CLS-{t['n']:03d}-A1", clause_title="Corrigendum #1: storage capacity 250 TB", category="TECHNICAL_MANDATORY",
                    criticality="HIGH", doc_reference="Corrigendum No. 1", clause_text="Usable storage capacity increased from 200 TB to 250 TB.",
                    implication="Introduced via client corrigendum / amendment.")]
            if t.get("parent"):
                row.parent_eoi_id = TENDER_BY_N[t["parent"]]["id"]
            if t.get("eoi_child"):
                row.spawned_rfp_id = TENDER_BY_N[t["eoi_child"]]["id"]
                row.eoi_shortlist_status = "SHORTLISTED"
            if t["stage"] == "AWARDED":
                noa = dl + timedelta(days=25)
                ps = round(t["value"] * (0.10 if is_egp else 0.05), 2)
                signed = noa + timedelta(days=14)
                row.contract_signing_date = d(signed)
                row.work_start_date = d(signed + timedelta(days=7))
                row.post_award_data = dict(noaDate=d(noa), noaReference=f"NOA/{t['ref']}/2026", performanceSecurityAmount=ps,
                                           performanceSecurityDueDate=d(noa + timedelta(days=14)),
                                           performanceSecurityStatus="DEPOSITED", contractSigningStatus="SIGNED" if signed <= NOW else "SCHEDULED",
                                           contractSigningDate=d(signed), workOrderReference=f"WO/{t['ref']}/01",
                                           workStartDate=d(signed + timedelta(days=7)),
                                           handoverStatus="UAT_IN_PROGRESS" if t["prof"] == "software" else "PENDING",
                                           productHandoverDate=d(signed + timedelta(days=240)),
                                           warrantyEndDate=d(signed + timedelta(days=605)), maintenancePeriod="12 months")
            db.add(row)
            db.flush()

            # Seed tender_folders table
            f_list = [
                ("01_original_tender_documents", "01 Original Tender Documents"),
                ("02A_jv_partner_credentials" if t.get("jv") else "02_company_statutory_documents",
                 "02A JV Partner Credentials" if t.get("jv") else "02 Company Statutory Documents"),
            ]
            if t.get("jv"):
                f_list.extend([
                    ("02B_lead_statutory_documents", "02B Lead Statutory Documents"),
                    ("02C_jv_agreement_and_poa", "02C JV Agreement and POA"),
                ])
            f_list.extend([
                ("03_technical_proposal", "03 Technical Proposal"),
                ("04_financial_proposal", "04 Financial Proposal"),
                ("05_final_submission_package", "05 Final Submission Package"),
                ("06_submission_receipts", "06 Submission Receipts"),
            ])
            for f_n, f_l in f_list:
                db.add(TenderFolder(tender_id=t["id"], name=f_n, label=f_l))

            for x in build_tasks(t, prof, dl, published):
                db.add(x)
            for x in build_requirements(t, prof):
                db.add(x)
            for x in build_documents(t, prof, storage_root, vault):
                db.add(x)
            for x in build_comments(t):
                db.add(x)
            m = build_matrix(t)
            if m:
                db.add(m)
            if t["stage"] in ("PREPARATION", "INTERNAL_REVIEW", "SUBMITTED", "AWARDED", "LOST"):
                for x in build_fin_rules(t, prof):
                    db.add(x)
            if t["stage"] in POST_SUBMIT:
                receipt = next((p for p in (storage_root / "tenders" / t["id"] / "06_submission_receipts").glob("*Receipt*.pdf")), None) or \
                    next((storage_root / "tenders" / t["id"] / "06_submission_receipts").glob("*.pdf"))
                db.add(TenderSubmission(tender_id=t["id"], portal_reference=f"{'EGP' if is_egp else 'PORTAL'}-SUB-{t['ref'].replace('/', '-')}-{RNG.randint(1000, 9999)}",
                                        submitted_by=lead["name"], submitted_at=utc_naive(dl - timedelta(hours=6)),
                                        receipt_sha256=hashlib.sha256(receipt.read_bytes()).hexdigest(),
                                        receipt_path=str(receipt.resolve()), status="SUBMITTED_LOCKED"))
            for pid in t.get("jv", []):
                p = next(x for x in PARTNERS if x["id"] == pid)
                db.add(TenderPartnerAssignment(tender_id=t["id"], organization_id=pid, partner_type=p["type"], status="ACTIVE",
                                               assigned_by="Akib Mahamud", start_date=d(published), end_date=d(dl + timedelta(days=90)),
                                               notes="Assigned for joint bid (demo)."))
        db.commit()

        # ---- partner share links (JV portal) & a few audit trails -----------------------
        print("  - partner share links and audit log")
        jv_doc = db.query(TenderDocument).filter(TenderDocument.tender_id == TENDER_BY_N[24]["id"],
                                                 TenderDocument.folder == "03_technical_proposal").first()
        tor_doc = db.query(TenderDocument).filter(TenderDocument.tender_id == TENDER_BY_N[12]["id"]).first()
        gis_doc = db.query(TenderDocument).filter(TenderDocument.tender_id == TENDER_BY_N[19]["id"],
                                                  TenderDocument.folder == "03_technical_proposal").first()
        shares = [
            (jv_doc, TENDER_BY_N[24], "ORG-JV-MEGHNA", "bids@meghna-data.example.com", "DEMO-JV-2026", True, at(30), "ACTIVE"),
            (tor_doc, TENDER_BY_N[12], "ORG-JV-KESTREL", "tenders@kestrel-port.example.com", "DEMO-PARTNER-VIEW", False, at(7), "ACTIVE"),
            (gis_doc, TENDER_BY_N[19], "ORG-JV-SUNDARBAN", "info@sundarban-geo.example.com", "DEMO-EXPIRED-LINK", True, at(-2), "ACTIVE"),
            (tor_doc, TENDER_BY_N[12], "ORG-SUB-NORTHGATE", "contact@northgate-sec.example.com", "DEMO-REVOKED-LINK", False, at(20), "REVOKED"),
        ]
        for doc, t, pid, email, token, dl_ok, exp, status in shares:
            if not doc:
                continue
            db.add(ResourceShare(resource_type="DOCUMENT", resource_id=doc.id, tender_id=t["id"], shared_by_user_id="USR-DEMO-01",
                                 shared_with_type="PARTNER_ORGANIZATION", shared_with_id=pid, recipient_email=email,
                                 can_view=True, can_preview=True, can_download=dl_ok, token=token,
                                 expires_at=utc_naive(exp), status=status,
                                 revoked_at=utc_naive(at(-1)) if status == "REVOKED" else None,
                                 revoked_by="USR-DEMO-01" if status == "REVOKED" else None))
        audit_events = [
            ("USR-DEMO-04", None, 20, "financial.view", "view", "ALLOW", None),
            ("USR-DEMO-06", None, 18, "document.delete", "delete", "DENY", "Explicit DENY rule for user"),
            ("USR-DEMO-05", None, 23, "document.upload", "upload", "ALLOW", None),
            (None, "ORG-JV-MEGHNA", 24, "document.download", "download", "ALLOW", None),
            (None, "ORG-JV-MEGHNA", 24, "financial.view", "view", "DENY", "Partner ceiling denies financial.view"),
            (None, "ORG-JV-KESTREL", 12, "document.preview", "preview", "ALLOW", None),
            (None, "ORG-SUB-NORTHGATE", 12, "document.view", "view", "DENY", "Organization suspended (access block)"),
            ("USR-DEMO-03", None, 20, "financial.edit", "edit", "ALLOW", None),
            ("USR-DEMO-01", None, 24, "submission.submit", "submit", "ALLOW", None),
            ("USR-DEMO-04", None, 23, "financial.view", "view", "DENY", "Role TENDER_ANALYST has no financial.view"),
        ]
        for i in range(30):
            uid, pid, tn, code, action, decision, reason = audit_events[i % len(audit_events)]
            when = NOW - timedelta(hours=7 * i + RNG.randint(0, 5))
            db.add(AuthorizationAuditLog(
                request_id=f"REQ-{d(when)}-{RNG.randint(0x10000000, 0xFFFFFFFF):08X}", user_id=uid,
                partner_organization_id=pid, tender_id=TENDER_BY_N[tn]["id"], resource_type="DOCUMENT" if "document" in code else "TENDER",
                resource_id=f"DOC-{tn:03d}-01" if "document" in code else TENDER_BY_N[tn]["id"], permission_code=code, action=action,
                decision=decision, denial_reason_code="POLICY_DENY" if decision == "DENY" else None, denial_message=reason,
                matched_rule_scope="TENDER" if pid else "ROLE", matched_rule_effect=decision, request_method="GET",
                request_path=f"/api/tenders/{TENDER_BY_N[tn]['id']}", created_at=utc_naive(when)))
        db.commit()

        # ---- company profiles & credentials ---------------------------------------------
        print("  - company profiles and past-project credentials")
        db.add(CompanyProfile(
            id="COMP-DEMO-PRIMETECH", legal_name=OUR_COMPANY, trade_name="PrimeTech", company_role="LEAD_BIDDER",
            entity_type="Private Limited Company", registration_no="C-000000/2014 (demo)", incorporation_date="2014-03-12",
            country="Bangladesh", status="VERIFIED",
            business_nature="Software development, systems integration, managed security and ICT infrastructure.",
            tin_number="000000000000 (demo)", bin_vat_number="000000000-0000 (demo)", trade_license_no="TRAD/DNCC/000000/2026 (demo)",
            trade_license_expiry=d(at(250)), trade_license_issuer="Dhaka North City Corporation", tax_circle_zone="Circle-000, Taxes Zone-00, Dhaka",
            rjsc_return_year="2025", irc_erc_no="IRC-000000 (demo)",
            registered_address="House 00, Road 00, Gulshan-2, Dhaka 1212 (demo address)",
            operational_address="Level 9, Demo Tower, Banani, Dhaka 1213 (demo address)",
            official_email="info@primetech.example.com", billing_email="accounts@primetech.example.com", phone="+880 2-0000010",
            website="https://primetech.example.com", contact_person_name="Akib Mahamud", contact_person_title="Head of Business Development",
            contact_person_phone="+880 1700-000101", contact_person_email="akib.mahamud@tendertracker.org",
            signatory_name="[Managing Director]", signatory_title="Managing Director", signatory_nid="0000000000 (demo)",
            power_of_attorney_ref="POA/2026/01 (demo)", bank_name="[Bank name]", bank_branch="Gulshan Branch",
            bank_account_name=OUR_COMPANY, bank_account_no="0000-0000000-00 (demo)", routing_no="000000000", swift_code="DEMOBDDH",
            audited_turnover_bdt=620_000_000, audited_turnover_usd=5_080_000, bank_solvency_limit_bdt=150_000_000,
            paid_up_capital_bdt=50_000_000, authorized_capital_bdt=200_000_000, credit_rating="AA- (demo)",
            credit_rating_validity=d(at(200)), certifications=["ISO 9001:2015", "ISO/IEC 27001:2022", "BASIS Member (demo)", "CMMI Level 3 (demo)"],
            core_competencies=["Custom software & MIS", "Data warehouse & BI", "Managed SOC / SIEM", "Data center & virtualization", "GIS"],
            total_employees=185, certified_engineers=64,
            custom_fields=[{"id": "CF-1", "name": "e-GP User ID", "value": "demo-primetech"}]))
        for cid, name, role, nature, turnover, staff in [
            ("COMP-DEMO-MEGHNA", "Meghna Data Systems Ltd", "JV_PARTNER", "Data warehouse, BI and analytics.", 280_000_000, 70),
            ("COMP-DEMO-KESTREL", "Kestrel Port Automation Pte Ltd", "JV_PARTNER", "Port and terminal gate automation (Singapore).", 1_100_000_000, 210),
            ("COMP-DEMO-SUNDARBAN", "Sundarban GeoInfo Ltd", "SUBCONTRACTOR", "GIS, remote sensing and agronomy consulting.", 90_000_000, 35),
            ("COMP-DEMO-DATACORE", "DataCore Systems Bangladesh Limited", "JV_PARTNER", "High-Performance AI Infrastructure, Tier-3 Data Center & Edge GPU Clusters.", 480_000_000, 95),
            ("COMP-DEMO-NYKADVANCE", "NYK Advance Engineering & Infrastructure Ltd", "JV_PARTNER", "Expressway Intelligent Transport Systems (ITS) & Electronic Toll Collection (ETC).", 850_000_000, 160),
            ("COMP-DEMO-CYBERSHIELD", "CyberShield Defense Solutions Limited", "SUBCONTRACTOR", "24/7 Security Operations Center (SOC), Threat Intelligence & Penetration Testing.", 210_000_000, 55),
        ]:
            db.add(CompanyProfile(id=cid, legal_name=name, trade_name=name.split()[0], company_role=role, entity_type="Private Limited Company",
                                  country="Singapore" if "Kestrel" in name else "Bangladesh", status="ACTIVE", business_nature=nature,
                                  trade_license_expiry=d(at(RNG.randint(60, 300))), official_email=f"info@{name.split()[0].lower()}.example.com",
                                  audited_turnover_bdt=turnover, audited_turnover_usd=round(turnover / 122), total_employees=staff,
                                  certified_engineers=staff // 3, certifications=["ISO 9001:2015"], core_competencies=[nature], custom_fields=[]))
        creds = [
            (OUR_COMPANY, "LEAD_BIDDER", "Integrated Revenue Management System", "[Demo client] City Corporation", 84_000_000, "BDT", -900, -420, "Prime Contractor"),
            (OUR_COMPANY, "LEAD_BIDDER", "Core Banking DR Site Implementation", "[Demo client] State-owned bank", 126_000_000, "BDT", -800, -500, "Prime Contractor"),
            (OUR_COMPANY, "LEAD_BIDDER", "Managed SOC Services (3 years)", "[Demo client] Telecom operator", 98_000_000, "BDT", -1200, -110, "Prime Contractor"),
            (OUR_COMPANY, "LEAD_BIDDER", "Web-Based Toll Collection Operation (3 years)", "[Demo client] Bridge authority", 104_000_000, "BDT", -1300, -200, "Operator"),
            (OUR_COMPANY, "LEAD_BIDDER", "DHIS2 Customisation and Training", "[Demo client] UN agency", 210_000, "USD", -700, -380, "Prime Contractor"),
            (OUR_COMPANY, "LEAD_BIDDER", "Supply of 500 Desktop Computers", "[Demo client] Public university", 42_000_000, "BDT", -400, -330, "Supplier"),
            (OUR_COMPANY, "JV_PARTNER", "Disaster Data Portal (JV)", "[Demo client] Development partner", 340_000, "USD", -600, -250, "JV member (40%)"),
            (OUR_COMPANY, "LEAD_BIDDER", "e-Learning Platform for Teachers", "[Demo client] Education directorate", 31_000_000, "BDT", -520, -300, "Prime Contractor"),
            ("Meghna Data Systems Ltd", "JV_PARTNER", "Enterprise Data Warehouse", "[Demo client] Commercial bank", 150_000_000, "BDT", -1000, -560, "Prime Contractor"),
            ("Kestrel Port Automation Pte Ltd", "JV_PARTNER", "Terminal Gate OCR Automation", "[Demo client] Regional port", 2_400_000, "USD", -900, -380, "Prime Contractor"),
            ("Sundarban GeoInfo Ltd", "SUBCONTRACTOR", "Flood Mapping with Remote Sensing", "[Demo client] Water agency", 18_000_000, "BDT", -700, -400, "Subcontractor"),
            ("DataCore Systems Bangladesh Limited", "JV_PARTNER", "National AI GPU Cluster Deployment", "Bangladesh Computer Council", 185_000_000, "BDT", -500, -210, "JV Partner (HPC)"),
            ("NYK Advance Engineering & Infrastructure Ltd", "JV_PARTNER", "Padma Bridge ETC Toll Lane System", "Bridge Authority", 220_000_000, "BDT", -650, -310, "JV Partner (ITS)"),
            ("CyberShield Defense Solutions Limited", "SUBCONTRACTOR", "Central Bank Managed SOC Monitoring", "Bangladesh Bank", 140_000_000, "BDT", -580, -180, "Lead Security Contractor"),
        ]
        for i, (comp, role, title, client, val, cur, start, end, rip) in enumerate(creds, start=1):
            pid = f"PROJ-DEMO{i:03d}"
            safe_company = "".join(ch if ch.isalnum() else "_" for ch in comp)
            base_dir = storage_root / "companies" / safe_company / "projects" / pid
            wo = write_pdf(base_dir / "work_order" / f"Work_Order_{pid}.pdf", f"Work Order - {title}",
                           [f"Contractor: {comp}", f"Client: {client}", f"Contract value: {cur} {val:,.0f}"],
                           [("Scope", [title]), ("Note", ["Synthetic work order for the demo."])])
            cc = write_pdf(base_dir / "completion_cert" / f"Completion_Certificate_{pid}.pdf", f"Completion Certificate - {title}",
                           [f"Contractor: {comp}", f"Client: {client}"],
                           [("Certificate", [f"The assignment was completed satisfactorily on {d(at(end))}.", "Synthetic certificate for the demo."])])
            wo_sha, wo_size = file_meta(wo)
            cc_sha, cc_size = file_meta(cc)
            db.add(CompanyProjectCredential(
                id=pid, company_name=comp, company_role=role, project_title=title, client_name=client, contract_value=val,
                currency=cur, start_date=d(at(start)), completion_date=d(at(end)), role_in_project=rip,
                work_order_filename=f"Work_Order_{pid}.pdf", work_order_path=str((base_dir / "work_order" / f"Work_Order_{pid}.pdf").resolve()),
                work_order_sha256=wo_sha, work_order_size=wo_size,
                completion_cert_filename=f"Completion_Certificate_{pid}.pdf",
                completion_cert_path=str((base_dir / "completion_cert" / f"Completion_Certificate_{pid}.pdf").resolve()),
                completion_cert_sha256=cc_sha, completion_cert_size=cc_size,
                custom_fields=[{"id": "CF-1", "name": "Users", "value": str(RNG.choice([120, 450, 1200, 3000]))}]))
        db.commit()

        # ---- client visits ----------------------------------------------------------------
        print("  - client visits and meetings")
        visits = [
            (-280, "COMPLETED", "PRE_BID_MEETING", 42, "Pre-bid meeting: Core switch upgrade", "Bangladesh Bank (Central Bank)", "ORG-BD-BANGLADESHBANK", "Imran Chowdhury", "Conference Room 4", "VERY_POSITIVE"),
            (-250, "COMPLETED", "CLIENT_SITE_VISIT", 45, "Site inspection: WASA booster telemetry", "Dhaka WASA", "ORG-BD-DWASA", "Imran Chowdhury", "Saidabad WTP Site", "POSITIVE"),
            (-220, "COMPLETED", "COMMERCIAL_NEGOTIATION", 48, "Negotiation: Container gate automation", "Chittagong Port Authority (CPA)", "ORG-BD-CPA", "Farhana Rahman", "Port Board Room", "POSITIVE"),
            (-190, "COMPLETED", "IN_PERSON_OFFICE", 51, "Solution presentation: HCI expansion", "Rupali Bank PLC", "ORG-BD-RUPALIBANK", "Imran Chowdhury", "Level 8 IT Hall", "POSITIVE"),
            (-160, "COMPLETED", "VIRTUAL_CONFERENCE", 54, "Crop advisory app architecture review", "Department of Agricultural Extension", "ORG-BD-DAE", "Farhana Rahman", "Zoom", "VERY_POSITIVE"),
            (-130, "COMPLETED", "COMMERCIAL_NEGOTIATION", 30, "Contract signing: Bhairab toll operation", "Roads and Highways Department", "ORG-BD-RHD", "Tanvir Hasan", "RHD Sylhet Zone", "POSITIVE"),
            (-100, "COMPLETED", "IN_PERSON_OFFICE", 32, "Data quality dashboard sprint review", "UNICEF Bangladesh", "ORG-UN-UNICEF-BD", "Farhana Rahman", "UN Bhaban", "VERY_POSITIVE"),
            (-70, "COMPLETED", "IN_PERSON_OFFICE", 33, "Hardware delivery kickoff meeting", "Agrani Bank PLC", "ORG-BD-AGRANIBANK", "Tanvir Hasan", "Agrani Head Office", "POSITIVE"),
            (-40, "COMPLETED", "VIRTUAL_CONFERENCE", 27, "Early warning EOI shortlist debrief", "UNDP Bangladesh", "ORG-UN-UNDP-BD", "Farhana Rahman", "Microsoft Teams", "POSITIVE"),
            (-21, "COMPLETED", "PRE_BID_MEETING", 12, "Pre-bid meeting: gate automation", "Chittagong Port Authority (CPA)", "ORG-BD-CPA",
             "Farhana Rahman", "CPA conference room, Chattogram", "POSITIVE"),
            (-14, "COMPLETED", "IN_PERSON_OFFICE", 24, "Solution walkthrough: data warehouse", "Bangladesh Bank (Central Bank)", "ORG-BD-BANGLADESHBANK",
             "Akib Mahamud", "Main Conference Room", "VERY_POSITIVE"),
            (-9, "COMPLETED", "CLIENT_SITE_VISIT", 17, "Toll plaza site visit", "Roads and Highways Department", "ORG-BD-RHD",
             "Akib Mahamud", "Meghna-Gumti approach plaza", "NEUTRAL"),
            (-6, "COMPLETED", "VIRTUAL_CONFERENCE", 19, "Clarification call: early warning platform", "UNDP Bangladesh", "ORG-UN-UNDP-BD",
             "Farhana Rahman", "Microsoft Teams", "POSITIVE"),
            (-3, "COMPLETED", "COMMERCIAL_NEGOTIATION", 30, "Contract negotiation: Bhairab toll operation", "Roads and Highways Department", "ORG-BD-RHD",
             "Tanvir Hasan", "RHD Sylhet zone office", "POSITIVE"),
            (0, "CHECKED_IN", "IN_PERSON_OFFICE", 23, "SOC service demo for IT security team", "Janata Bank PLC", "ORG-BD-JANATABANK",
             "Imran Chowdhury", "Demo Lab, Level 9", None),
            (1, "SCHEDULED", "COURTESY_CALL", None, "Courtesy call: digital roadmap", "Bangladesh Computer Council (BCC)", "ORG-BD-BCC",
             "Akib Mahamud", "BCC Bhaban, Agargaon", None),
            (3, "SCHEDULED", "PRE_BID_MEETING", 8, "Pre-bid meeting: digital case diary", "Bangladesh Police", "ORG-BD-POLICE",
             "Farhana Rahman", "Police Headquarters", None),
            (5, "SCHEDULED", "VIRTUAL_CONFERENCE", 13, "Introductory call: DHIS2 LTA", "World Health Organization, Bangladesh", "ORG-UN-WHO-BD",
             "Farhana Rahman", "Zoom", None),
            (8, "RESCHEDULED", "IN_PERSON_OFFICE", 20, "Card management system workshop", "Agrani Bank PLC", "ORG-BD-AGRANIBANK",
             "Tanvir Hasan", "Agrani Bank head office", None),
            (-30, "CANCELLED", "COURTESY_CALL", None, "Courtesy call (cancelled by client)", "Biman Bangladesh Airlines Limited", "ORG-BD-BIMAN",
             "Akib Mahamud", "Biman head office", None),
        ]
        for i, (day, status, vtype, tn, title, client, oid, host, room, sentiment) in enumerate(visits, start=1):
            start = at(day, hour=11 if i % 2 else 15)
            desig = ("Programme Specialist" if oid.startswith("ORG-UN") else
                     ["Director (IT)", "Deputy Director (Procurement)", "Project Director", "Additional Director (ICT)"][i % 4])
            done = status == "COMPLETED"
            checked_in = status in ("COMPLETED", "CHECKED_IN")
            db.add(ClientVisit(
                id=f"VIS-DEMO-{i:03d}", title=title, client_organization=client, organization_id=oid,
                tender_id=TENDER_BY_N[tn]["id"] if tn else None, visitor_name=f"{desig} ({client.split('(')[0].strip()[:40]})",
                visitor_designation=desig,
                visitor_phone="+880 1700-0000" + f"{i:02d}", visitor_email=f"contact{i}@example.org",
                accompanying_persons=[{"name": "System Analyst (client team)", "designation": "System Analyst"}] if i % 3 == 0 else [],
                internal_host_name=host, internal_host_role=TEAM_BY_NAME[host]["title"], visit_type=vtype, status=status,
                scheduled_start=iso(start), scheduled_end=iso(start + timedelta(hours=1, minutes=30)),
                actual_check_in=iso(start + timedelta(minutes=5)) if checked_in else None,
                actual_check_out=iso(start + timedelta(hours=1, minutes=40)) if done else None,
                location_or_room=room, meeting_link="https://teams.example.com/demo" if vtype == "VIRTUAL_CONFERENCE" else None,
                agenda="1. Introductions\n2. Scope walkthrough\n3. Open questions\n4. Next steps",
                discussion_notes=("Client confirmed priorities and timeline. Integration with the existing system is the main concern. "
                                  "Shared reference case studies.") if done else None,
                action_items=[{"task": "Send follow-up note with references", "owner": host, "due": d(start + timedelta(days=2)), "done": done},
                              {"task": "Update tender summary with clarifications", "owner": "Nusrat Jahan", "due": d(start + timedelta(days=3)), "done": False}],
                sentiment_outcome=sentiment, attachments=[]))
        db.commit()

        # ---- team chat --------------------------------------------------------------------
        print("  - team chat channels")
        chat = [
            ("general-ops", "Akib Mahamud", "Good morning team. Happy New Year 2026. Let's make Q1 our strongest quarter yet. Bangladesh Bank switch upgrade RFP is out.", -285 * 24),
            ("tech-architecture", "Imran Chowdhury", "Reviewed Bangladesh Bank switch BoQ. Cisco Nexus + Fortinet NGFW matches the tender data sheet perfectly.", -280 * 24),
            ("commercial-pricing", "Tanvir Hasan", "Q1 win: Chittagong Port gate automation awarded! Final contract value BDT 115M with Kestrel JV.", -220 * 24),
            ("legal-compliance", "Rafiq Ahmed", "Annual trade license renewal DNCC FY2026-27 completed. Updated certificate placed in Document Vault.", -190 * 24),
            ("tech-architecture", "Farhana Rahman", "DAE Agro-Advisory mobile app prototype tested on Android 14. Ready for ministry demo.", -160 * 24),
            ("general-ops", "Akib Mahamud", "Milestone alert: Bhairab Bridge toll plaza operation contract formally signed with RHD today.", -130 * 24),
            ("commercial-pricing", "Tanvir Hasan", "UNICEF data quality dashboard contract signed. Performance security deposited.", -100 * 24),
            ("tech-architecture", "Imran Chowdhury", "UNPD Global AI Tender RFP released in New York. Value USD 12.8M. DataCore confirms edge GPU readiness.", -45 * 24),
            ("general-ops", "Akib Mahamud", "Good morning team. Two critical submissions this week: the RHD toll plaza and the Janata Bank SOC. Please prioritise both.", -50),
            ("general-ops", "Sadia Islam", "e-GP tender security for the toll plaza is paid. Bank confirmation is in folder 04.", -30),
            ("general-ops", "Nusrat Jahan", "Six new tenders added from e-GP and UNGM this morning; summaries are in the registry.", -20),
            ("general-ops", "Akib Mahamud", "Reminder: go/no-go meeting Thursday 11:00 for the Police case diary and the BTRC dashboard.", -6),
            ("tech-architecture", "Farhana Rahman", "Early warning platform architecture v2 is in the technical folder. Sundarban GeoInfo reviewed the GIS layer.", -44),
            ("tech-architecture", "Imran Chowdhury", "Rupali DR: corrigendum raised storage to 250 TB. I've re-sized the SAN and asked the distributor for an updated MAF.", -26),
            ("tech-architecture", "Farhana Rahman", "Gate automation: still waiting for the TOS interface spec from the port. Kestrel can only price once we have it.", -10),
            ("commercial-pricing", "Tanvir Hasan", "Pricing for the Janata SOC is final at 4% below the estimate. Margin is still 18%.", -36),
            ("commercial-pricing", "Tanvir Hasan", "Lost the Sonali DMS at +7.8% over L1. Our licence cost was the gap; we need a better OEM deal next time.", -100),
            ("commercial-pricing", "Akib Mahamud", "Agreed. Let's talk to two more OEMs before the Agrani card management bid.", -98),
            ("legal-compliance", "Rafiq Ahmed", "The bank solvency certificate in the vault expires in 12 days. I've requested a fresh one.", -28),
            ("legal-compliance", "Rafiq Ahmed", "BASIS membership renewal is overdue. Please approve the fee so I can renew it this week.", -12),
            ("legal-compliance", "Akib Mahamud", "Approved. Also renew the ISO 27001 surveillance audit; it lapses in about 45 days.", -11),
        ]
        for i, (ch, who, text, hrs) in enumerate(chat, start=1):
            m = TEAM_BY_NAME[who]
            db.add(ChatChannelMessage(id=f"MSG-DEMO-{i:03d}", channel_id=ch, sender_name=who, sender_role=m["role"],
                                      sender_avatar=m["avatar"], content=text, created_at=utc_naive(NOW + timedelta(hours=hrs))))

        marker = db.query(SystemSetting).filter(SystemSetting.key == DEMO_MARKER_KEY).first()
        if marker:
            marker.value = iso(NOW)
        else:
            db.add(SystemSetting(key=DEMO_MARKER_KEY, value=iso(NOW), category="GENERAL"))
        db.commit()

        # ---- summary ----------------------------------------------------------------------
        counts = {}
        for t in TENDERS:
            counts[t["stage"]] = counts.get(t["stage"], 0) + 1
        print("\nDone. Demo data loaded:")
        print("  tenders by stage : " + ", ".join(f"{k} {v}" for k, v in counts.items()))
        for label, model in [("tasks", TenderTask), ("requirements", TenderRequirement), ("documents", TenderDocument),
                             ("comments", TenderComment), ("vault documents", ReusableDocument),
                             ("credentials", CompanyProjectCredential), ("client visits", ClientVisit),
                             ("chat messages", ChatChannelMessage), ("audit log entries", AuthorizationAuditLog)]:
            print(f"  {label:<17}: {db.query(model).count()}")
        print("\nLog in with:  akib.mahamud@tendertracker.org  /  Demo@2026!")
        print("Partner portal (/jv): any email + token DEMO-JV-2026")
        # Sync database and storage so both live and demo endpoints have complete year-to-date data
        if args.live:
            demo_db = BACKEND_DIR / "tender_tracker_demo.db"
            live_db = BACKEND_DIR / "tender_tracker.db"
            if live_db.exists():
                shutil.copy2(live_db, demo_db)
                print(f"  [+] Synced live database to demo database: {demo_db}")
            live_storage = storage_root
            demo_storage = BACKEND_DIR.parent / "storage" / "_demo"
            demo_storage.mkdir(parents=True, exist_ok=True)
            for sub in ("tenders", "master_library", "companies"):
                s_src = live_storage / sub
                s_dst = demo_storage / sub
                if s_src.exists():
                    shutil.copytree(s_src, s_dst, dirs_exist_ok=True)
            print(f"  [+] Synced live storage to demo storage: {demo_storage}")
        else:
            demo_db = BACKEND_DIR / "tender_tracker_demo.db"
            live_db = BACKEND_DIR / "tender_tracker.db"
            if demo_db.exists():
                shutil.copy2(demo_db, live_db)
                print(f"  [+] Synced demo database to live database: {live_db}")
            demo_storage = storage_root
            live_storage = BACKEND_DIR.parent / "storage"
            live_storage.mkdir(parents=True, exist_ok=True)
            for sub in ("tenders", "master_library", "companies"):
                s_src = demo_storage / sub
                s_dst = live_storage / sub
                if s_src.exists():
                    shutil.copytree(s_src, s_dst, dirs_exist_ok=True)
            print(f"  [+] Synced demo storage to live storage: {live_storage}")

    finally:
        db.close()

    if args.serve:
        serve(args.port)


if __name__ == "__main__":
    main()
