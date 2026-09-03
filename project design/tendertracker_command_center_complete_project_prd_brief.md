# Project Brief & Executive PRD: TenderTracker Command Center

**Product Name:** TenderTracker Procurement Core & Command Center  
**Version:** 2.1.0 (Production Release Alignment)  
**System Type:** Enterprise Tender Lifecycle Management System  
**Status:** Approved & Implemented  
**Author / Governance:** Bid Operations & Platform Architecture Team  

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement
Enterprise bidding and procurement operations across multilateral donors (e.g., UNDP, World Bank, ADB) and sovereign agencies are historically fragmented across disconnected spreadsheets, local network folders, and unstructured email threads. This lack of single-source orchestration leads to:
- **Disqualification risks** due to omitted statutory compliance documents or expiring tax/trade certifications.
- **Missed statutory cutoffs** caused by lack of multi-interval deadline warnings.
- **Unbalanced team capacity** and unclear task ownership across technical, legal, and financial departments.
- **Poor win/loss visibility**, preventing data-driven bidding strategy and accurate pipeline valuation.

### 1.2 Product Vision
**TenderTracker** is an enterprise-grade Tender Command Center designed to govern the entire end-to-end tender lifecycle — from scanner discovery and automated RFP parsing through Go/No-Go evaluation, collaborative drafting, compliance matrix sign-off, portal submission, and post-award analytics.

The platform embodies the **"10-Second Rule"**: within ten seconds of accessing the platform, any bid director or operator can pinpoint:
1. Which tenders require immediate executive intervention.
2. Approaching statutory deadlines and portal cutoff clocks.
3. Missing mandatory verification documents.
4. Active team capacity bottlenecks.
5. Overall submission readiness scores across the pipeline.

---

## 2. Target Personas & Stakeholders

| Persona | Role | Primary Objectives & Jobs to Be Done | Key Interfaces Used |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | Senior Bid Operations Director (Super Admin) | Pipeline health oversight, win probability optimization, Go/No-Go gate sign-off, board reporting. | Dashboard, Go/No-Go Decision, Win/Loss Analytics, Board Export |
| **Bid / Proposal Manager** | Operational Bid Lead | End-to-end coordination, cross-department task assignment, document compilation, readiness verification. | Tender Detail Workspace, Kanban Board, Requirements Matrix |
| **Technical Solutions Lead** | Architect / Tech Lead | Scope breakdown, RFP technical compliance scoring, BOQ/SOW architecture, methodology drafting. | Tender Analysis Workspace, Task Board, Document Vault |
| **Finance & Compliance Officer** | Finance & Legal Lead | Solvency certificates, bank guarantee releases, turnover checks, trade license verification, post-bid audits. | Requirements Checklist, Document Vault, Review Sign-Off |

---

## 3. The 6-Gate Tender Lifecycle Framework

TenderTracker enforces a rigorous stage-gate model separating operational lifecycle status from Go/No-Go governance decisions:

```
[1. DISCOVERED] ──> [2. SCREENING] ──> [3. ANALYSIS] ──> [4. PREPARATION] ──> [5. REVIEW] ──> [6. SUBMISSION]
       │                   │                  │                  │                 │                  │
Scanned / Manual       High-Level        Formal Go/No-Go     Task Kanban &     5-Stage Sign-off   e-GP / UNGM Upload,
 Intake ($48.5M)      Eligibility       Decision Engine      Doc Compilation   Gatekeeper QA      Receipt & Ledger
```

- **Stage 1 — Discovered:** Sourced via manual entry or the automated Tender Scanner module (with confidence scoring).
- **Stage 2 — Screening:** Entity jurisdiction check, country restrictions, and mandatory company threshold screening.
- **Stage 3 — Analysis & Go/No-Go Gate:** Clause extraction, AI suitability scoring, and weighted multi-factor Go/No-Go decision matrix.
- **Stage 4 — Preparation:** Collaborative proposal workspace, document vault population, requirement checklist linking, and task boards.
- **Stage 5 — Review & Approval:** Sequential multi-department sign-offs (Technical, Financial, Legal/Compliance, Executive).
- **Stage 6 — Submission & Post-Award:** Receipt capture, SHA-256 timestamping, and win/loss post-mortem reason tracking.

---

## 4. System Architecture & Technical Specifications

Following the architecture specification (**DOCUMENT_11**), the platform leverages a secure, high-performance architecture optimized for internal enterprise teams (3–8 concurrent operators):

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite + Tailwind               │
│                  (Plus Jakarta Sans Theme)              │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JWT (Argon2id)
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI 0.115 Backend                │
│             (Role-Based Authorization & Auditing)       │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼───────────────┐ ┌──────────▼─────────────┐
│       MySQL 8.4 Database     │ │   Local SSD Vault       │
│  (Metadata, RBAC, Tasks,    │ │  (/opt/tender-tracker/  │
│   Audit Logs, Checksums)    │ │   storage/tenders/...)  │
└─────────────────────────────┘ └────────────────────────┘
```

### Storage & Security Architecture
1. **Local Server SSD Storage**: High-speed, isolated file hierarchy (`storage/tenders/{TDR-ID}/...`) avoiding external cloud dependencies while maintaining strict path sanitization.
2. **Document Integrity & Immutability**: Full version history with automated SHA-256 checksums per revision.
3. **Backup Sentinel**: Automated 3-2-1 off-site replication with daily verified snapshots.
4. **Access Control (RBAC)**: 7 discrete permission tiers from Super Admin to Viewer with strict separation of financial and gate sign-off privileges.

---

## 5. Completed Screen Inventory & Route Directory

All 17 core specification screens (**DOCUMENT_10, Section 83**) and executive support modules are implemented:

| # | Module / Page | Screen Title | Route | Core Value Delivered |
|:---|:---|:---|:---|:---|
| 1 | **Authentication** | *Login — Enterprise Sign In* | `/login` | Streamlined, distraction-free corporate sign-in. |
| 2 | **Command Center** | *Tender Command Center Dashboard* | `/dashboard` | Executive KPIs ($48.5M active), 10-second health grid, urgent alerts. |
| 3 | **Personal Console** | *My Tasks — Cross-Tender Execution Console* | `/tasks/my-tasks` | Cross-tender unified task list categorized by urgency and status. |
| 4 | **Tender Registry** | *Tender List & Pipeline Registry* | `/tenders` | Searchable, multi-filtered registry with readiness indicators. |
| 5 | **Detail Workspace** | *Tender Detail & Proposal Workspace* | `/tenders/{id}` | Centralized operational hub with sub-navigation across bid facets. |
| 6 | **Tender Analysis** | *Tender Analysis & Scope Workspace* | `/tenders/{id}/analysis` | Scope breakdown, AI clause extraction, and eligibility validation. |
| 7 | **Compliance Matrix** | *Tender Requirements & Compliance Checklist* | `/tenders/{id}/requirements` | Clause-by-clause checklist mapped to verification evidence files. |
| 8 | **Task Management** | *Tender Task Management Board (Kanban)* | `/tenders/{id}/tasks` | Interactive board (To Do, In Progress, Review, Done) with dependencies. |
| 9 | **Document Vault** | *Tender Document Vault & Statutory Repository* | `/tenders/{id}/documents` | Categorized repository with versioning and cryptographic checksums. |
| 10 | **Team Allocation** | *Tender Team & Workload Allocation* | `/team` | Capacity heatmaps, role assignments, and bottleneck monitoring. |
| 11 | **Deadline Calendar**| *Tender Calendar & Deadline Schedule* | `/calendar` | Month, week, agenda views tracking pre-bid meetings and submission locks. |
| 12 | **Review & Sign-Off**| *Tender Review & Approvals Sign-Off Workflow* | `/tenders/{id}/review` | 4-tier approval gate with comment logs and audit signatures. |
| 13 | **Submission Ledger**| *Tender Submission & Result Ledger* | `/tenders/{id}/submission` | Portal upload proof, bank guarantee receipts, and submission timestamps. |
| 14 | **Result Tracking** | *Tender Submission & Result Ledger* (Post-Mortem) | `/tenders/{id}/result` | Award confirmation, financial reconciliations, and loss taxonomy logging. |
| 15 | **Analytics Suite** | *Reports & Win/Loss Analytics* | `/reports` | Win rate calculations (24%), category distribution, and margin trends. |
| 16 | **Notification Hub** | *Notification & Operational Alert Center* | `/notifications` | SLA breach alerts, reviewer pings, and statutory expiry notices. |
| 17 | **Configuration** | *Settings & System Configuration* | `/settings` | NVMe storage health, alert interval triggers, RBAC matrix, AI tuning. |
| — | **Decision Engine** | *Tender Go/No-Go Decision Matrix* | `/tenders/{id}/decision` | Weighted scoring matrix (Technical, Financial, Team, SLA feasibility). |
| — | **Board Export** | *Executive Board Presentation Export* | `/tenders/{id}/export` | Formatted executive brief for board approval packages. |
| — | **Resource Drilldown**| *Resource Consumption Deep Dive* | `/tenders/{id}/resources` | Detailed man-hour allocations and budget burn rates. |

---

## 6. Verification & Quality Acceptance Criteria

- **10-Second Rule Compliance**: Dashboard and individual workspaces present missing documents, deadlines, and responsible owners without drill-down delay.
- **Data Model Segregation**: Tender Status is cleanly separated from Go/No-Go decisions across all screens.
- **Cryptographic Traceability**: All approvals, submissions, and statutory document uploads feature SHA-256 audit trails.
- **Enterprise Design System**: Unified palette (Slate Navy `#0F172A`, Surface Light `#F8F9FF`, Semantic status tokens) and Plus Jakarta Sans typography applied consistently across all screens.
