# TenderTracker Command Center (v2.4.0)

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4_LTS-4479A1?logo=mysql)](https://www.mysql.com/)

**TenderTracker Command Center** is an enterprise-grade procurement lifecycle management system designed for public and multilateral tenders (e-GP, UNDP, World Bank, ADB, JICA). It guides bid teams across the **6-gate tender lifecycle**, implements the **10-Second Attention Rule** for triage, and provides complete cryptographic document assurance.

---

## 🚀 Quick Start (Frontend)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be live at: **`http://127.0.0.1:5173/`**

---

## 🏛️ 6-Gate Tender Lifecycle

1. **Stage 1 — Bid Discovery**: Scanner intake and portal integration with confidence scoring.
2. **Stage 2 — Screening**: Entity jurisdiction check, debarment screening, and mandatory criteria.
3. **Stage 3 — Analysis & Go/No-Go**: Clause extraction, SLA viability, and weighted decision scoring (35% Tech, 30% Fin, 20% Team, 15% SLA).
4. **Stage 4 — Preparation**: Task board, statutory document vault population, and clause compliance checklist.
5. **Stage 5 — Review & Approval**: 4-tier sequential gatekeeper sign-off (Technical, Financial, Legal, Executive).
6. **Stage 6 — Submission & Outcome**: Portal proof verification, SHA-256 cryptographic locking, and win/loss debrief ledger.

---

## 🖥️ Screen & Route Directory (20 Modules)

| Screen ID | Screen Name | Route | Module |
| :--- | :--- | :--- | :--- |
| `screen:login` | Login — Enterprise Sign In | `/login` | `auth` |
| `screen:dashboard` | Tender Command Center Dashboard | `/dashboard` | `dashboard` |
| `screen:tender_registry` | Tender Registry & Data Entry Console | `/registry` | `registry` |
| `screen:tender_summary` | Formal 3-Page Tender Document Summary | `/registry/summary/{id}` | `registry` |
| `screen:tenders_list` | Tender List & Pipeline Registry | `/tenders` | `tenders` |
| `screen:bid_discovery` | Bid Discovery Queue (Filtered) | `/tenders?stage=DISCOVERED` | `tenders` |
| `screen:tender_detail` | Tender Detail & Proposal Workspace | `/tenders/{id}` | `tenders` |
| `screen:tender_analysis` | Tender Analysis & Scope Workspace | `/tenders/{id}/analysis` | `analysis` |
| `screen:tender_requirements` | Compliance & Requirements Matrix | `/tenders/{id}/requirements` | `compliance` |
| `screen:tender_tasks` | Tender Task Board | `/tenders/{id}/tasks` | `tasks` |
| `screen:tender_documents` | Tender Document Vault & Custom Folders | `/tenders/{id}/documents` | `documents` |
| `screen:master_documents` | Master Reusable Document Vault & Permissions | `/documents` | `documents` |
| `screen:tender_review` | Review & Sign-Off Workflow | `/tenders/{id}/review` | `review` |
| `screen:tender_submission` | Submission Ledger | `/tenders/{id}/submission` | `submission` |
| `screen:tender_result` | Outcome & Debrief Ledger | `/tenders/{id}/result` | `result` |
| `screen:my_tasks` | My Operational Deliverables (with Name Filter) | `/tasks/my-tasks` | `tasks` |
| `screen:chat_discussions` | Team Chat & Tender Discussions Hub | `/discussions` | `collaboration` |
| `screen:team_allocation` | Team Workload & RBAC Access Matrix | `/team` | `team` |
| `screen:calendar` | Tender Calendar & Deadline Schedule | `/calendar` | `calendar` |
| `screen:reports` | Reports & Win/Loss Analytics | `/reports` | `analytics` |
| `screen:archive` | Archived Non-Participating Records | `/archive` | `archive` |
| `screen:notifications` | Notification & Alert Center | `/notifications` | `notifications` |
| `screen:settings` | Settings & System Configuration | `/settings` | `settings` |

---

## ⚡ Architecture & Optimization Engines

- **Interactive Command Palette (`Ctrl + Shift + K` / `⌘⇧K`)**: Omnipresent modal indexing tenders, deliverables, vault files, team members, and system pages with keyboard auto-navigation.
- **Master Reusable Document Vault (`/documents`)**: Upload trade licenses, audited balance sheets, ISO certificates, and CVs once; reference them into any tender proposal with 1 click.
- **Role-Based Document Access Control**: Granular 4-tier document access permissions (`All Team`, `Management Only`, `Restricted Finance/Legal`, `Executive Board Only`) with download lock enforcement.
- **Custom Folder Lifecycle**: On-the-fly custom vault folder creation, inline document reassignment, and safe folder deletion with automated file safeguarding.
- **Real-Time Communications Hub (`/discussions`)**: Cross-team channels and tender proposal comment threads with user tagging (`@Name`) and instant workspace jumping.
- **Ponytail ("Lazy Senior Dev")**: Generation-time optimization enforcing the 7-Step Decision Ladder to minimize code bloat, avoid over-engineering, and maintain radical conciseness.
- **Graphify**: Precomputed knowledge graph (`tools/graphify/graphify.py`) indexing routes, screens, entities, and storage paths for instant, low-token context retrieval.
- **Universal Collaboration**: 4 organizational profiles (`Business Head`, `Executive Manager`, `Senior Manager`, `Tender Analyst`) with universal operational access, interactive deliverable assignment, and threaded commentary.
- **Deep-Link Registry Editing**: Click **Edit** on any tender to immediately load its full parameters in `/registry?id={id}`.

---

## 📄 Project Documentation

- **[Project History Ledger](file:///h:/Tender%20tracker%20v2/project%20history/project%20history.md)**: Full chronological changelog, versioning, and ADRs.
- **[Design & Walkthrough](file:///h:/Tender%20tracker%20v2/project%20design/walkthrough.md)**: Feature walkthrough and build verification results.
- **[Knowledge Graph Index](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.md)**: Screen and schema mapping.
