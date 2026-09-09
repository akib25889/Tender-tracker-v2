# TenderTracker Command Center (v2.18.0)

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4_LTS-4479A1?logo=mysql)](https://www.mysql.com/)

**TenderTracker Command Center** is an enterprise-grade procurement lifecycle management system designed for public and multilateral tenders (e-GP, UNDP, World Bank, ADB, JICA). It guides bid teams across the **6-gate tender lifecycle**, implements the **10-Second Attention Rule** for triage, and provides complete cryptographic document assurance.

---

## 🚀 Quick Start

### Frontend (Vite Dev Server)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173/ (Opens Login Page directly)
```

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
# → http://127.0.0.1:8000/docs
```

### Run All Verification Gates (One Command)
```bash
python run_all_tests.py
```
Executes: DB health → Pytest suite (29 tests) → TypeScript type-check → Knowledge graph sync.

---

## 🏛️ 6-Gate Tender Lifecycle

1. **Stage 1 — Bid Discovery**: Scanner intake and portal integration with confidence scoring.
2. **Stage 2 — Screening**: Entity jurisdiction check, debarment screening, and mandatory criteria.
3. **Stage 3 — Analysis & Go/No-Go**: Scope breakdown, SLA viability, geometric radar evaluation (35% Tech, 30% Fin, 20% Team, 15% SLA), and predicted win probability (`pWin`).
4. **Stage 4 — Preparation**: Task board, statutory document vault population, and clause compliance checklist.
5. **Stage 5 — Review & Approval**: 4-tier sequential gatekeeper sign-off (Technical, Financial, Legal, Executive).
6. **Stage 6 — Submission & Outcome**: Portal proof verification, SHA-256 cryptographic locking, and win/loss debrief ledger.

---

## 🖥️ Screen & Route Directory (28 Modules)

| Screen ID | Screen Name | Route | Module |
| :--- | :--- | :--- | :--- |
| `screen:login` | Login — Internal Bid Team | `/` or `/login` | `auth` |
| `screen:jv_login` | Login — JV / Partner Portal Direct | `/jv` or `/login/jv` | `auth` |
| `screen:dashboard` | Tender Command Center Dashboard | `/dashboard` | `dashboard` |
| `screen:tender_registry` | Tender Registry & Data Entry Console | `/registry` | `registry` |
| `screen:tender_summary` | Formal 3-Page Tender Document Summary | `/registry/summary/{id}` | `registry` |
| `screen:tenders_list` | Tender List & Pipeline Registry | `/tenders` | `tenders` |
| `screen:bid_discovery` | Bid Discovery Queue (Filtered) | `/tenders?stage=DISCOVERED` | `tenders` |
| `screen:tender_detail` | Tender Detail & Proposal Workspace | `/tenders/{id}` | `tenders` |
| `screen:tender_requirements` | Compliance & Requirements Matrix | `/tenders/{id}/requirements` | `compliance` |
| `screen:tender_tasks` | Tender Task Board | `/tenders/{id}/tasks` | `tasks` |
| `screen:tender_documents` | Tender Document Vault & Custom Folders | `/tenders/{id}/documents` | `documents` |
| `screen:tender_partners` | JV Partner Collaboration & Allocation Hub | `/tenders/{id}/partners` | `collaboration` |
| `screen:master_documents` | Master Reusable Document Vault & Permissions | `/documents` | `documents` |
| `screen:company_credentials` | Company Project Credentials (WO & CC) | `/documents?tab=credentials` | `credentials` |
| `screen:company_profiles` | Corporate Entities & Company Profiles | `/tools/company-profiles` | `tools` |
| `screen:client_visits` | Client Visitor & Scheduled Meetings Hub | `/clients/visits` | `crm` |
| `screen:master_permissions` | Master Access & Permissions Control Center | `/permissions` | `security` |
| `screen:tender_review` | Review & Sign-Off Workflow | `/tenders/{id}/review` | `review` |
| `screen:tender_submission` | Submission Ledger | `/tenders/{id}/submission` | `submission` |
| `screen:tender_result` | Outcome & Debrief Ledger | `/tenders/{id}/result` | `result` |
| `screen:my_tasks` | My Operational Deliverables | `/tasks/my-tasks` | `tasks` |
| `screen:chat_discussions` | Team Chat & Tender Discussions Hub | `/discussions` | `collaboration` |
| `screen:team_allocation` | Team Workload & RBAC Access Matrix | `/team` | `team` |
| `screen:calendar` | Tender Calendar & Deadline Schedule | `/calendar` | `calendar` |
| `screen:reports` | Report & Analytics (Basic, General, Advance) | `/reports` | `analytics` |
| `screen:archive` | Archived Non-Participating Records | `/tools/archive` | `archive` |
| `screen:notifications` | Real-Time Operational Alert Center | `/notifications` | `notifications` |
| `screen:organizations` | Organizations — Procuring Entity Catalog & Tree | `/tools/organizations` | `tools` |
| `screen:shared_portal` | Tokenized Shared Document Portal | `/shared/:token` | `documents` |
| `screen:partner_portal` | Joint Venture Partner Collaboration Portal | `/partner/portal` | `collaboration` |
| `screen:settings` | Settings & System Configuration | `/settings` | `settings` |

---

## ⚡ Architecture & Optimization Engines

- **Master Access & Permissions Control Center (`/permissions`)**: Enterprise 5-tab permissions governance console:
  - *Live Diagnostic Simulator:* Multi-select permission tester with "Select All", "Reset (*)", badge counters, and multi-action authorization evaluation.
  - *JV & Partner Ceilings:* Maximum boundary ceiling matrix ($Actual = Ceiling \cap Granted$) with batch "Allow All Permissions" and "Deny All" controls.
  - *Role Baselines & Scope Overrides:* Hierarchical permission rules (Resource > Tender > Organization > Role baseline) supporting wildcard `*` ("Grant All Permissions").
  - *Security Blockers (Layer 1):* Hard DENY conditions (account suspensions, NDA flags) that supersede all granted roles.
  - *Authorization Audit Trail:* Immutable append-only audit trail logging request IDs, decisions, matched scopes, and denial reason codes with CSV and JSON exports.
- **Client Visitor & Scheduled Meetings Management System (`/clients/visits`)**: Executive hub for managing in-person delegations, pre-bid clarification meetings, and site visits with reception check-in/out workflows, Minutes of Meeting (MoM) logs, actionable deliverable checkboxes, and sentiment tracking.
- **Procurement Governance & Sourcing Framework (Req #21)**: Full-stack persistence, API serialization, and multi-surface UI representation for 4 critical public procurement attributes: `tender_type`, `budget_type`, `source_of_fund`, and `procurement_method`.
- **Corporate Entities & Company Profiles Command Center (`/tools/company-profiles`)**: Dedicated multi-entity management hub for Lead Bidders and JV Partners storing legal identities, statutory & tax credentials, banking standing (turnovers, credit lines), accreditations, and 1-click **"Copy Tender Profile Summary"** generation.
- **Top-of-Field Action Toolbar & Dynamic Custom Fields**: Standardized interactive `[📋 Copy] [✏️ Edit] [🗑️ Delete]` toolbar positioned directly on top of profile and credential fields with toast confirmations and inline database persistence.
- **Company Project Experience Credentials (`/documents?tab=credentials`)**: Dedicated past project credentials ledger tracking contracts, client names, values, and direct uploads for certified Work Orders and Completion Certificates with SHA-256 verification.
- **Universal Document Viewer Hub**: Secure MIME-aware in-browser previewing for PDF, DOCX, XLSX/CSV, images, and text files using native browser APIs, `docx-preview`, and SheetJS with byte-range streaming.
- **Comprehensive CSS-Only Dark Mode Theme (WCAG AA Compliant)**: Full dark surface elevation hierarchy (`--bg-canvas`: `#0B0F17`, `--bg-surface`: `#131B28`, `--bg-surface-raised`: `#1A2436`) and high-contrast typography tokens ($\ge 14:1$ contrast ratio).
- **Dual-Mode Database Architecture (SQLite Dev / MySQL 8.4 Prod)**: Zero-configuration local development and automated testing using embedded SQLite (`tender_tracker.db`) requiring no local MySQL installation. Fully production-ready for MySQL 8.4 LTS via SQLAlchemy.
- **Local Disk Storage (HDD / SSD)**: Direct local server filesystem storage under `storage/tenders/{TDR-ID}/...` with streaming uploads, SHA-256 cryptographic hashing, and 3-2-1 backup rotation sentinel.

---

## 🗄️ Database & Storage Engine Architecture (23 Tables)

| Environment | Database Engine | Setup Required | Notes |
| :--- | :--- | :--- | :--- |
| **Local Dev & Testing** | **SQLite 3** (`tender_tracker.db`) | **None (0 sec)** | Built directly into Python standard library. Runs all 29 tests without installing MySQL. |
| **Production Server** | **MySQL 8.4 LTS** | Set `.env` `DATABASE_URL` | Connects via `pymysql`. 23 normalized tables auto-generated via SQLAlchemy Base metadata. |
| **Document Vault** | **Local Disk (HDD / SSD)** | Configurable `STORAGE_ROOT` | Microsecond read/write, SHA-256 integrity manifests, 3-2-1 backup rotation sentinel. |

---

## ✅ Current Test Status

| Suite | Result |
| :--- | :--- |
| `test_api_integration.py` | ✅ 11/11 pass |
| `test_authorization_engine.py` | ✅ 15/15 pass |
| `test_sharing_and_isolation.py` | ✅ 3/3 pass |
| **Total Pytest Suite** | **✅ 29/29 pass (100%)** |
| TypeScript `tsc -b` | ✅ 0 errors |
| Production `npm run build` | ✅ Clean |
| Knowledge graph | ✅ 54 nodes, 32 edges |
| Dark Mode Visual Audit (Playwright) | ✅ 25/25 screens verified (WCAG AA) |

---

## 📄 Project Documentation

- **[Project History Ledger](file:///h:/Tender%20tracker%20v2/project%20history/project%20history.md)**: Full chronological changelog, versioning, and ADRs.
- **[Design Walkthrough](file:///h:/Tender%20tracker%20v2/project%20design/walkthrough.md)**: Feature walkthrough and build verification results.
- **[Knowledge Graph Index](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.md)**: Screen and schema mapping.
- **[Unified Test Runner](file:///h:/Tender%20tracker%20v2/run_all_tests.py)**: `python run_all_tests.py`
