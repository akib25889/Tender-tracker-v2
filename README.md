# TenderTracker Command Center (v2.8.0)

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
# → http://127.0.0.1:5173/
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

## 🖥️ Screen & Route Directory (24 Modules)

| Screen ID | Screen Name | Route | Module |
| :--- | :--- | :--- | :--- |
| `screen:login` | Login — Internal & Partner Portal | `/login` | `auth` |
| `screen:dashboard` | Tender Command Center Dashboard | `/dashboard` | `dashboard` |
| `screen:tender_registry` | Tender Registry & Data Entry Console | `/registry` | `registry` |
| `screen:tender_summary` | Formal 3-Page Tender Document Summary | `/registry/summary/{id}` | `registry` |
| `screen:tenders_list` | Tender List & Pipeline Registry | `/tenders` | `tenders` |
| `screen:bid_discovery` | Bid Discovery Queue (Filtered) | `/tenders?stage=DISCOVERED` | `tenders` |
| `screen:tender_detail` | Tender Detail & Proposal Workspace | `/tenders/{id}` | `tenders` |
| `screen:tender_requirements` | Compliance & Requirements Matrix | `/tenders/{id}/requirements` | `compliance` |
| `screen:tender_tasks` | Tender Task Board | `/tenders/{id}/tasks` | `tasks` |
| `screen:tender_documents` | Tender Document Vault & Custom Folders | `/tenders/{id}/documents` | `documents` |
| `screen:master_documents` | Master Reusable Document Vault & Permissions | `/documents` | `documents` |
| `screen:tender_review` | Review & Sign-Off Workflow | `/tenders/{id}/review` | `review` |
| `screen:tender_submission` | Submission Ledger | `/tenders/{id}/submission` | `submission` |
| `screen:tender_result` | Outcome & Debrief Ledger | `/tenders/{id}/result` | `result` |
| `screen:my_tasks` | My Operational Deliverables | `/tasks/my-tasks` | `tasks` |
| `screen:chat_discussions` | Team Chat & Tender Discussions Hub | `/discussions` | `collaboration` |
| `screen:team_allocation` | Team Workload & RBAC Access Matrix | `/team` | `team` |
| `screen:calendar` | Tender Calendar & Deadline Schedule | `/calendar` | `calendar` |
| `screen:reports` | Report & Analytics (Basic, General, Advance) | `/reports` | `analytics` |
| `screen:archive` | Archived Non-Participating Records | `/archive` | `archive` |
| `screen:notifications` | Real-Time Operational Alert Center | `/notifications` | `notifications` |
| `screen:organizations` | Organizations — Procuring Entity Catalog & Tree | `/tools/organizations` | `tools` |
| `screen:permissions` | Master Permissions & Access Control Matrix | `/permissions` | `security` |
| `screen:shared_portal` | Tokenized Shared Document Portal | `/shared/:token` | `documents` |
| `screen:settings` | Settings & System Configuration | `/settings` | `settings` |

---

## ⚡ Architecture & Optimization Engines

- **Interactive Command Palette (`Ctrl + Shift + K` / `⌘⇧K`)**: Omnipresent modal indexing tenders, deliverables, vault files, team members, and system pages with keyboard auto-navigation.
- **Enhanced Proposal Workspace (`/tenders/:id`)**: High-density command center featuring a 6-Gate visual step ribbon, 2x3 Tender Specification Matrix (Country, e-GP Portal, Authority, Reference with 1-click copy, dual USD/BDT Crore valuation, earnest money BG validity), technical Scope Synopsis, and the **Compliance Sentinel** gatekeeper checklist (`2 / 8 Cleared`).
- **Tools & Addons Module & Organizations Hierarchy (`/tools/organizations`)**: Master procuring entity catalog for Bangladesh Government bodies, UN agencies, and Multilateral Banks with infinite-depth hierarchy tree, directory table, duplicate detection, and collapsible sidebar dropdown navigation.
- **Master Permissions & Reusable Document Vault Sharing (`/permissions` & `/shared/:token`)**: Granular 4-tier document authorization ceilings with tokenized public links, expiry controls, and watermarked downloads.
- **Partner Portal Direct Login (`/login`)**: Dual-mode authentication switcher enabling Joint Venture and consortium partners to log in securely with watermarked cryptographic isolation.
- **Automated Email Notification Dispatcher (`/settings`)**: Configurable SMTP relay integration with deadline escalation (≤48h) and gatekeeper sign-off triggers.
- **Batch CSV/JSON Pipeline Ingestion (`/tenders`)**: Direct drag-and-drop batch tender import with pre-validation and interactive preview table.
- **Scope of Work (SOW) Standard**: Unified full-form standard throughout the UI, exports, and document generators.
- **Archived Future Specifications (`docs/future_implementations/`)**: Fully documented future specifications for both the **Tender Analysis & Scope Workspace** (4-pillar weighted score, SVG radar geometry, pWin) and the **AI Scope Extractor & Summarizer**.
- **Master Reusable Document Vault (`/documents`)**: Upload trade licenses, audited balance sheets, ISO certificates, and CVs once; reference them into any tender proposal with 1 click.
- **Role-Based Document Access Control**: Granular 4-tier document access permissions (`All Team`, `Management Only`, `Restricted Finance/Legal`, `Executive Board Only`) with download lock enforcement.
- **Custom Folder Lifecycle**: On-the-fly custom vault folder creation, inline document reassignment, and safe folder deletion with automated file safeguarding.
- **Real-Time Communications Hub (`/discussions`)**: Cross-team channels and tender proposal comment threads with user tagging (`@Name`) and instant workspace jumping.
- **Real-Time Operational Alert Center (`/notifications`)**: Live `/api/alerts` endpoint synthesises critical deadline warnings (≤48h), requirement blockers, pending Tier 3/4 executive sign-offs, and expired partner share links. Live numbered badge on header bell.
- **Interactive Monthly Calendar Grid (`/calendar`)**: Toggle between chronological Timeline and interactive monthly Grid view with colour-coded deadline chips per day and prev/next month navigation.
- **Unified Verification Runner (`run_all_tests.py`)**: One-command script executing all 4 quality gates — DB health, pytest backend, TypeScript type-check, and knowledge graph sync — with coloured pass/fail output.
- **Deterministic Production Lockfile (`requirements-lock.txt`)**: Exact pip-frozen dependency declarations guaranteeing byte-for-byte reproducible Docker and server deployments.
- **Ponytail ("Lazy Senior Dev")**: Generation-time optimization enforcing the 7-Step Decision Ladder to minimize code bloat, avoid over-engineering, and maintain radical conciseness.
- **Graphify**: Precomputed knowledge graph (`tools/graphify/graphify.py`) indexing 52 nodes and 30 edges across routes, screens, entities, and storage paths for instant, low-token context retrieval.
- **Dual-Mode Database Architecture (SQLite Dev / MySQL 8.4 Prod)**: Embedded SQLite (`tender_tracker.db`) provides instant, zero-setup local development and automated testing without requiring a local MySQL installation. Fully production-ready for MySQL 8.4 LTS via SQLAlchemy with zero code changes.
- **Local Disk Storage (HDD / SSD)**: Direct local server filesystem storage under `storage/tenders/{TDR-ID}/...` with streaming 1 MB chunk uploads and SHA-256 cryptographic hashing.

---

## 🔌 REST API Reference (v2.7.0)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/auth/login` | JWT authentication |
| `GET/POST` | `/api/tenders` | List / create tenders |
| `GET/PUT/DELETE` | `/api/tenders/{id}` | Tender CRUD |
| `POST` | `/api/tenders/{id}/archive` | Archive tender |
| `POST` | `/api/tenders/{id}/restore` | Restore archived tender |
| `GET/POST` | `/api/tenders/{id}/submission` | Legal submission proof ledger & stage lock |
| `GET/POST` | `/api/categories` | Corporate SOW category list & creation |
| `PUT/DELETE` | `/api/categories/{id}` | Update category / safe delete with usage check |
| `GET/POST` | `/api/settings` | Server system configuration (vault, SLA, SMTP) |
| `GET/POST` | `/api/chat/channels/{id}/messages` | Persistent channel discussion streams |
| `GET/POST` | `/api/tasks/tender/{id}` | Tender task list / create |
| `PATCH` | `/api/tasks/{id}` | Update task status/assignee |
| `GET/POST` | `/api/documents/tender/{id}` | Document vault list / upload |
| `GET` | `/api/documents/share/{token}` | Validate shared link token |
| `GET` | `/api/documents/download/{token}` | Download via share token |
| `GET/POST` | `/api/comments` | Comments list / create |
| `DELETE` | `/api/comments/{id}` | Delete comment |
| `GET` | `/api/dashboard/stats` | Executive KPI metrics |
| `GET` | `/api/dashboard/reports/analytics` | Win/loss analytics |
| `GET` | **`/api/alerts`** | **Live operational alerts** |
| `GET/POST` | `/api/permissions/...` | RBAC permission management |

---

## 🗄️ Database & Storage Engine Architecture (22 Tables)

| Environment | Database Engine | Setup Required | Notes |
| :--- | :--- | :--- | :--- |
| **Local Dev & Testing** | **SQLite 3** (`tender_tracker.db`) | **None (0 sec)** | Built directly into Python standard library. Runs all 29 tests and development without installing MySQL. |
| **Production Server** | **MySQL 8.4 LTS** | Set `.env` `DATABASE_URL` | Connects via `pymysql`. 22 normalized tables auto-generated via SQLAlchemy Base metadata. |
| **Document Vault** | **Local Disk (HDD / SSD)** | Configurable `STORAGE_ROOT` | Microsecond read/write, SHA-256 integrity manifests, 3-2-1 backup rotation sentinel. |

---

## ✅ Current Test Status

| Suite | Result |
| :--- | :--- |
| `test_api_integration.py` (11 tests) | ✅ 11/11 pass |
| `test_authorization_engine.py` (15 tests) | ✅ 15/15 pass |
| `test_sharing_and_isolation.py` (3 tests) | ✅ 3/3 pass |
| **Total** | **✅ 29/29 pass** |
| TypeScript `tsc -b` | ✅ 0 errors |
| Production `npm run build` | ✅ Clean |
| Knowledge graph | ✅ 49 nodes, 28 edges |

---

## 📄 Project Documentation

- **[Project History Ledger](file:///h:/Tender%20tracker%20v2/project%20history/project%20history.md)**: Full chronological changelog, versioning, and ADRs.
- **[Design Walkthrough](file:///h:/Tender%20tracker%20v2/project%20design/walkthrough.md)**: Feature walkthrough and build verification results.
- **[Knowledge Graph Index](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.md)**: Screen and schema mapping.
- **[Unified Test Runner](file:///h:/Tender%20tracker%20v2/run_all_tests.py)**: `python run_all_tests.py`
