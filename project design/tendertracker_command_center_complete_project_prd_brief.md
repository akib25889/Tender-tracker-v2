# Project Brief & Executive PRD: TenderTracker Command Center

**Product Name:** TenderTracker Procurement Core & Command Center  
**Version:** 2.6.0 (Enterprise Release)  
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
**TenderTracker** is an enterprise-grade Tender Command Center designed to govern the entire end-to-end tender lifecycle — from discovery and parsing through Go/No-Go evaluation, collaborative drafting, compliance matrix sign-off, portal submission, and post-award analytics.

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
| **Technical Solutions Lead** | Architect / Tech Lead | Scope breakdown, RFP technical compliance scoring, BOQ & Scope of Work (SOW) architecture, methodology drafting. | Tender Analysis Workspace, Task Board, Document Vault |
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
- **Stage 3 — Analysis & Go/No-Go Gate:** Scope breakdown, SLA viability, geometric radar scoring, and weighted multi-factor Go/No-Go decision matrix.
- **Stage 4 — Preparation:** Collaborative proposal workspace, document vault population, requirement checklist linking, and task boards.
- **Stage 5 — Review & Approval:** Sequential multi-department sign-offs (Technical, Financial, Legal/Compliance, Executive).
- **Stage 6 — Submission & Post-Award:** Receipt capture, SHA-256 timestamping, and win/loss post-mortem reason tracking.

---

## 4. System Architecture & Technical Specifications

Following the architecture specification (**DOCUMENT_11**), the platform leverages a secure, high-performance architecture optimized for internal enterprise teams (3–8 concurrent operators):

- **Frontend Core:** React 18+, Vite 8, TypeScript 5.5, Tailwind CSS with full Responsive/Theme token layers.
- **Backend API Core:** FastAPI 0.111, Python 3.13, Pydantic v2 schemas, and strict route isolation.
- **Dual-Mode Database Architecture:** Embedded zero-setup SQLite (`tender_tracker.db`) for rapid local development and automated CI/CD testing; fully production-ready for MySQL 8.4 LTS via SQLAlchemy with zero code changes.
- **Local Disk Storage Vault (HDD / SSD):** Local filesystem storage under `storage/tenders/{TDR-ID}/...` with 1 MB streaming uploads and SHA-256 cryptographic versioning.
- **Partner Collaboration & Cryptographic Tokens:** Dynamic share tokens with permission ceilings and isolated shared document viewer.

---

## 5. Screen Implementation Directory

All 17 core specification screens (**DOCUMENT_10, Section 83**) and executive support modules are implemented:

| # | Module / Page | Screen Title | Route | Core Value Delivered |
|:---|:---|:---|:---|:---|
| 1 | **Authentication** | *Login — Internal & Partner Portal* | `/login` | Dual-tab sign-in for internal teams and external consortium partners. |
| 2 | **Command Center** | *Tender Command Center Dashboard* | `/dashboard` | Executive KPIs ($48.5M active), 10-second health grid, urgent alerts. |
| 3 | **Personal Console** | *My Tasks — Cross-Tender Execution Console* | `/tasks/my-tasks` | Cross-tender unified task list categorized by urgency and status. |
| 4 | **Tender Registry** | *Tender List & Pipeline Registry* | `/tenders` | Searchable, multi-filtered registry with CSV/JSON batch import. |
| 5 | **Detail Workspace** | *Tender Detail & Proposal Workspace* | `/tenders/{id}` | Centralized operational hub with sub-navigation across bid facets. |
| 6 | **Tender Analysis** | *Tender Analysis & Scope Workspace* | `/tenders/{id}/analysis` | Multi-criteria radar chart, pWin forecasting, and Go/No-Go matrix. |
| 7 | **Compliance Matrix** | *Tender Requirements & Compliance Checklist* | `/tenders/{id}/requirements` | Clause-by-clause checklist mapped to verification evidence files. |
| 8 | **Task Management** | *Tender Task Management Board (Kanban)* | `/tenders/{id}/tasks` | Interactive board (To Do, In Progress, Review, Done) with dependencies. |
| 9 | **Document Vault** | *Tender Document Vault & Statutory Repository* | `/tenders/{id}/documents` | Categorized repository with versioning and cryptographic checksums. |
| 10 | **Team Allocation** | *Tender Team & Workload Allocation* | `/team` | Capacity heatmaps, role assignments, and bottleneck monitoring. |
| 11 | **Deadline Calendar**| *Tender Calendar & Deadline Schedule* | `/calendar` | Interactive monthly grid and chronological timeline views. |
| 12 | **Review & Sign-Off**| *Tender Review & Approvals Sign-Off Workflow* | `/tenders/{id}/review` | 4-tier approval gate with comment logs and audit signatures. |
| 13 | **Submission Ledger**| *Tender Submission & Result Ledger* | `/tenders/{id}/submission` | Portal upload proof, bank guarantee receipts, and submission timestamps. |
| 14 | **Result Tracking** | *Tender Submission & Result Ledger* (Post-Mortem) | `/tenders/{id}/result` | Award confirmation, financial reconciliations, and loss taxonomy logging. |
| 15 | **Analytics Suite** | *Reports & Win/Loss Analytics* | `/reports` | Win rate calculations (24%), category distribution, and margin trends. |
| 16 | **Notification Hub** | *Notification & Operational Alert Center* | `/notifications` | Live deadline breach alerts (≤48h), requirement blockers, and approvals. |
| 17 | **Configuration** | *Settings & System Configuration* | `/settings` | Storage vault paths, alert intervals, and SMTP email dispatcher setup. |
| — | **Decision Engine** | *Tender Go/No-Go Decision Matrix* | `/tenders/{id}/decision` | Weighted scoring matrix (Technical, Financial, Team, SLA feasibility). |
| — | **Board Export** | *Executive Board Presentation Export* | `/tenders/{id}/export` | Formatted executive brief for board approval packages. |
| — | **Resource Drilldown**| *Resource Consumption Deep Dive* | `/tenders/{id}/resources` | Detailed man-hour allocations and budget burn rates. |

---

## 6. Verification & Quality Acceptance Criteria

- **10-Second Rule Compliance**: Dashboard and individual workspaces present missing documents, deadlines, and responsible owners without drill-down delay.
- **Data Model Segregation**: Tender Status is cleanly separated from Go/No-Go decisions across all screens.
- **Cryptographic Traceability**: All approvals, submissions, and statutory document uploads feature SHA-256 audit trails.
- **Enterprise Design System**: Unified palette (Slate Navy `#0F172A`, Surface Light `#F8F9FF`, Semantic status tokens) and Plus Jakarta Sans typography applied consistently across all screens.
