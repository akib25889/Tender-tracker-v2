# Walkthrough — TenderTracker Command Center (v2.6.0)

The Tender Command Center is an enterprise-grade procurement lifecycle management system built with **FastAPI**, **MySQL 8.4 LTS**, and **React 18+ (Vite, TypeScript, Tailwind CSS)**, adhering strictly to **Ponytail** generation-time optimization and **Graphify** knowledge graph retrieval.

---

## 1. What Was Built & Interactive Capabilities

### A. Centralized Reactive Engine ([`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx))
- **Persistent State:** Type-safe React Context backed by `localStorage` (`tendertracker_pipeline_v2`).
- **Complete CRUD Operations:**
  - `addTender`: Dynamic intake creating new opportunities or updating existing records in place without arbitrary budget defaults.
  - `updateTender`: Partial state updates with immediate localStorage persistence + FastAPI `PUT /api/tenders/{id}` sync.
  - `deleteTender`: Single tender deletion with interactive confirmation modal protection.
  - `deleteMultipleTenders`: Multi-row bulk deletion from the pipeline table with confirmation.
  - `updateTenderStage`: Transitions opportunities across the 6 gates (`DISCOVERED` ➔ `SCREENING` ➔ `UNDER_ANALYSIS` ➔ `PREPARATION` ➔ `INTERNAL_REVIEW` ➔ `SUBMITTED`).
  - `setTenderDecision`: Records formal Go/No-Go evaluation with weighted aggregate scores.
  - `addTask` & `moveTask`: Task board state changes dynamically adjusting tender readiness scores.
  - `assignTask`: Team deliverable assignment across team members.
  - `addComment` & `deleteComment`: Cross-functional collaboration remarks.
  - `signOffReviewTier`: 4-tier sequential gatekeeper approval with digital audit signature.
  - `toggleRequirementStatus`: Clause checklist cycling (`VERIFIED` / `PENDING` / `BLOCKER`).
  - `submitTenderProof`: Portal confirmation ID lock and submission workspace freezing.
  - `formatCurrency`: Dual-currency engine (USD & BDT) returning clean `"—"` when values are unannounced or zero.

### B. Two-Pane Tender Registry Console ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))
- **Collapsible Master-Detail Split Pane:** Filter and search active tenders on the left rail while editing all statutory, technical, and commercial parameters in the 5-tab editor on the right pane.
- **Deep-Link URL Synchronization:** Supports `/registry?id={id}` and `/registry?edit={id}` for instant direct editing from the pipeline table or workspace header.
- **Clean Blank Date Inputs:** No unwanted fallback dates — Clarification Deadline, Bid Opening Date, Contract Start, and Published Date stay clean and blank until entered.
- **Estimated Net Value Control:** Dedicated input fields in Tab 1 and Tab 2, with automatic elimination of default mock budgets.

### C. 22 Operational Modules & Screen Directory

1. **Tender Command Center Dashboard ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx))**: Real-time KPI ribbons, clickable 6-gate breakdown cards leading into the filtered pipeline, and zero-money attention queue.
2. **Tender Registry & Data Entry ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))**: Full-page 5-tab console matching official RFP specifications.
3. **Pipeline Registry ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx))**: Multi-facet filter bar, direct row **Edit** and **Delete** actions, bulk delete bar, full JSON dataset export, and batch CSV/JSON ingestion.
4. **Bid Discovery Queue (`/tenders?stage=DISCOVERED`)**: Auto-filtered queue dedicated to incoming opportunities with quick discovery banners and active sidebar counts.
5. **Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx))**: Interactive 6-gate progression bar, quick Edit/Delete actions, and conditionally hidden Estimated Net Value widget.
6. **Analysis & Scope ([`TenderAnalysisTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderAnalysisTab.tsx))**: Multi-criteria radar chart visualization, dynamic pWin (Probability of Win) calculation engine, and Gatekeeper Decision Recommendation with Go/No-Go score weighting.
7. **Compliance Matrix ([`TenderRequirementsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderRequirementsTab.tsx))**: Clause status toggling, blocker alert banners, and direct vault document linking.
8. **Tender Task Board ([`TenderTasksTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderTasksTab.tsx))**: 4-column deliverable board (`To Do`, `In Progress`, `Under Review`, `Completed`) with inline assignee dropdown.
9. **Document Vault ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx))**: Category filtering, direct file download, custom folder lifecycle, and master library linking.
10. **Master Document Library ([`MasterDocumentVaultPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterDocumentVaultPage.tsx))**: Central corporate credential vault with 4-tier RBAC access control.
11. **Review & Sign-Off ([`TenderReviewTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderReviewTab.tsx))**: 4-tier sequential gatekeeper workflow.
12. **Submission Ledger ([`TenderSubmissionTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderSubmissionTab.tsx))**: Portal reference confirmation and final workspace lock.
13. **Outcome & Debrief ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx))**: Contract won/lost debrief logger feeding the analytics suite.
14. **My Tasks ([`MyTasksPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MyTasksPage.tsx))**: Cross-tender personal deliverable checklist.
15. **Team Allocation ([`TeamAllocationPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TeamAllocationPage.tsx))**: Department workload capacity distribution.
16. **Calendar ([`CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx))**: Toggle between **Timeline** (chronological list with 7/14-day filters) and **Grid** (interactive monthly calendar with colour-coded deadline chips, prev/next navigation).
17. **Win/Loss Analytics Reports ([`ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx))**: Sector distribution progress bars and conversion rates.
18. **Real-Time Alert Center ([`NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx))**: Live alerts from `/api/alerts` — critical deadline warnings (≤48h), requirement blockers, pending Tier 3/4 executive sign-offs, expired partner share links. Refresh button, severity-coloured unread dots, category filter tabs. Header bell shows live numbered badge (polled every 60s).
19. **Master Permissions ([`MasterPermissionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterPermissionsPage.tsx))**: 5-tab authorization control centre — Live Diagnostic Simulator, JV Partner Ceilings, Role Baselines, Security Blockers, Audit Trail.
20. **Partner Portal ([`PartnerPortalPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/PartnerPortalPage.tsx))**: Token-authenticated, credential-less portal interface for Joint Venture partners to review allocated opportunities and contribute statutory documents.
21. **Team Chat ([`ChatDiscussionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ChatDiscussionsPage.tsx))**: Cross-team channels and proposal-specific threads.
22. **Settings ([`SettingsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SettingsPage.tsx))**: Storage vault directory configuration and SLA thresholds.

---

## 2. Key Release Features (v2.6.0)

### A. Scope of Work (SOW) Standard
- Full-form terminology **"Scope of Work (SOW)"** applied across all user interfaces, document vault tabs, compliance matrix headers, and technical specifications, eliminating ambiguous jargon.

### B. Partner Portal Login & Authentication
- Tokenized partner authentication via `/partner/login` and `/partner/portal?token=...`.
- Enables external Joint Venture (JV) collaborators to securely submit statutory credentials and view tender deliverables without requiring internal corporate directory access.

### C. Advanced Scoring & Bidability (Multi-Criteria Radar & pWin)
- Interactive polygon radar chart in `TenderAnalysisTab.tsx` measuring Technical Capability, Commercial Feasibility, Team Availability, and Past Performance.
- Dynamic pWin calculator with weighted confidence sliders.
- Formalized "Gatekeeper Decision Recommendation" replacing speculative AI evaluation with deterministic, auditable multi-factor decision modeling.

### D. SMTP Email Notification Dispatcher
- Robust email notification service in `backend/app/services/email_service.py` supporting TLS/SSL SMTP servers.
- Automatic email alerts for critical deadline cutoffs (≤48h) and pending executive sign-offs.
- Live test connection and dispatch endpoint: `POST /api/notifications/test-email`.

### E. Batch Pipeline Ingestion (CSV / JSON Import)
- High-throughput batch import endpoint `POST /api/tenders/batch-import` with automated schema mapping, field validation, and collision resistance.
- Interactive modal UI in `BatchImportModal.tsx` featuring file drag-and-drop, real-time preview table, and instant pipeline intake.

### F. AI Scope Extractor Archival
- Complete architectural blueprint and technical design documented for future implementation in [`docs/future_implementations/ai_scope_extraction_and_summarizer.md`](file:///h:/Tender%20tracker%20v2/docs/future_implementations/ai_scope_extraction_and_summarizer.md).
- Active codebase completely cleansed of speculative AI endpoints, buttons, and badges to ensure zero runtime dependencies or cognitive clutter.

---

## 3. Backend REST API Directory

| Router | Prefix | Key Endpoints |
| :--- | :--- | :--- |
| `auth` | `/api/auth` | `POST /login` |
| `tenders` | `/api/tenders` | Full CRUD, archive, restore, reviews, stage, **`POST /batch-import`** |
| `tasks` | `/api/tasks` | Per-tender task CRUD + PATCH status/assignee |
| `documents` | `/api/documents` | Upload, download, share token validation, ZIP |
| `comments` | `/api/comments` | Threaded discussion CRUD |
| `dashboard` | `/api/dashboard` | `/stats`, `/reports/analytics` |
| `permissions` | `/api/permissions` | RBAC engine, partner orgs, audit trail |
| `alerts` | `/api/alerts` | Live operational alerts (DEADLINE, BLOCKER, APPROVAL, VAULT) |
| **`notifications`** | **`/api/notifications`** | **`POST /test-email` (SMTP notification verification)** |

---

## 4. Verification Results (v2.6.0)

```
python run_all_tests.py

  Gate 1/4 — Database Health Check ........ ✓ PASS
  Gate 2/4 — Backend Pytest Suite ......... ✓ PASS  25/25 passed
  Gate 3/4 — Frontend TypeScript Check .... ✓ PASS  0 errors
  Gate 4/4 — Knowledge Graph Sync ......... ✓ PASS  46 nodes, 24 edges

  Result: 4/4 gates passed
```

- **25/25 Pytest Tests Passing:** Full integration test suite passing with zero deprecation warnings.
- **0 TypeScript Errors:** Strict type checking across Vite and TypeScript compiler.
- **Production Build Clean:** Vite tree-shaken and bundled with zero warnings.
