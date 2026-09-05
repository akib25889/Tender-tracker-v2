# Walkthrough — TenderTracker Command Center (v2.8.0)

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

### C. 24 Operational Modules & Screen Directory

1. **Tender Command Center Dashboard ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx))**: Real-time KPI ribbons, clickable 6-gate breakdown cards leading into the filtered pipeline, and zero-money attention queue.
2. **Tender Registry & Data Entry ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))**: Full-page 5-tab console matching official RFP specifications.
3. **Pipeline Registry ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx))**: Multi-facet filter bar, direct row **Edit** and **Delete** actions, bulk delete bar, full JSON dataset export, and batch CSV/JSON ingestion.
4. **Bid Discovery Queue (`/tenders?stage=DISCOVERED`)**: Auto-filtered queue dedicated to incoming opportunities with quick discovery banners and active sidebar counts.
5. **Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx))**: Redesigned lifecycle workspace with 6-gate ribbon, 2x3 specification matrix, scope synopsis, Compliance Sentinel, and live team stream.
6. **Compliance Matrix ([`TenderRequirementsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderRequirementsTab.tsx))**: Clause status toggling, blocker alert banners, and direct vault document linking.
7. **Tender Task Board ([`TenderTasksTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderTasksTab.tsx))**: 4-column deliverable board (`To Do`, `In Progress`, `Under Review`, `Completed`) with inline assignee dropdown.
8. **Document Vault ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx))**: Category filtering, direct file download, custom folder lifecycle, and master library linking.
9. **Master Document Library ([`MasterDocumentVaultPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterDocumentVaultPage.tsx))**: Central corporate credential vault with 4-tier RBAC access control.
10. **Review & Sign-Off ([`TenderReviewTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderReviewTab.tsx))**: 4-tier sequential gatekeeper workflow.
11. **Submission Ledger ([`TenderSubmissionTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderSubmissionTab.tsx))**: Portal reference confirmation and final workspace lock.
12. **Outcome & Debrief ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx))**: Contract won/lost debrief logger feeding the analytics suite.
13. **My Tasks ([`MyTasksPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MyTasksPage.tsx))**: Cross-tender personal deliverable checklist.
14. **Team Allocation ([`TeamAllocationPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TeamAllocationPage.tsx))**: Department workload capacity distribution.
15. **Calendar ([`CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx))**: Toggle between **Timeline** (chronological list with 7/14-day filters) and **Grid** (interactive monthly calendar with colour-coded deadline chips, prev/next navigation).
16. **Report & Analytics ([`ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx))**: 3-mode intelligence console (Basic, General, Advance) covering executive summaries, domain distribution, client capture telemetry, and extensible metric frameworks.
17. **Real-Time Alert Center ([`NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx))**: Live alerts from `/api/alerts` — critical deadline warnings (≤48h), requirement blockers, pending Tier 3/4 executive sign-offs, expired partner share links. Refresh button, severity-coloured unread dots, category filter tabs. Header bell shows live numbered badge (polled every 60s).
18. **Master Permissions ([`MasterPermissionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterPermissionsPage.tsx))**: 5-tab authorization control centre — Live Diagnostic Simulator, JV Partner Ceilings, Role Baselines, Security Blockers, Audit Trail.
19. **Partner Portal ([`PartnerPortalPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/PartnerPortalPage.tsx))**: Token-authenticated, credential-less portal interface for Joint Venture partners to review allocated opportunities and contribute statutory documents.
20. **Team Chat ([`ChatDiscussionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ChatDiscussionsPage.tsx))**: Cross-team channels and proposal-specific threads.
21. **Settings ([`SettingsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SettingsPage.tsx))**: Storage vault directory configuration and SLA thresholds.
22. **Archived Tenders ([`ArchivePage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ArchivePage.tsx))**: Repository of soft-deleted and archived bids with restore and permanent purge capabilities.
23. **Shared Document Vault Portal ([`SharedDocumentPortalPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SharedDocumentPortalPage.tsx))**: Tokenized external portal for single-document verification and download without dashboard login.
24. **Organizations Hierarchy & Catalog ([`OrganizationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/OrganizationsPage.tsx))**: Procuring entity master catalog, interactive parent-child hierarchy tree view, directory table view, and creation modal under the Tools & Addons module.

---

## 2. Key Release Features (v2.8.0)

### A. Proposal Workspace Redesign
- Redesigned `/tenders/:id` implementing the `project design/stitch_tender_lifecycle_command_center (3)/` specification.
- **6-Gate Visual Pipeline:** Step-by-step progress ribbon showing status from Discovered to Submitted.
- **2x3 Specification Matrix:** Reference number, procurement portal, estimated net value, submission countdown, SOW category, and target entity.
- **Scope Synopsis & Technical Tags:** Statement of work synopsis with categorized requirement chips.
- **Compliance Sentinel Gatekeeper:** Tracks mandatory qualifications with dynamic cleared tally (e.g. `2 / 8 Cleared`), gatekeeper progress bar, and status pills.

### B. Tools & Addons Module & Organizations Hierarchy
- Dedicated `/tools/organizations` master directory for managing procuring authorities and partner agencies.
- Tree hierarchy view with recursive node toggle and tabular directory view.
- Re-architected sidebar navigation featuring an interactive collapsible accordion dropdown for Tools & Addons with route-aware active state and collapsed flyout.

### C. Master Permissions & Token Vault Sharing
- Enterprise RBAC control matrix (`/permissions`) with 5 diagnostic tabs.
- Reusable document vault share token portal (`/shared/:token`) allowing credential verification for external auditors.

### D. Deterministic Environment Hardening
- Complete `backend/requirements-lock.txt` pinning all transitive dependencies, compiler flags, and exact versions for zero-drift deployments.

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
| `notifications` | `/api/notifications` | `POST /test-email` (SMTP notification verification) |

---

## 4. Verification Results (v2.8.0)

```
python run_all_tests.py

  Gate 1/4 — Database Health Check ........ ✓ PASS
  Gate 2/4 — Backend Pytest Suite ......... ✓ PASS  29/29 passed
  Gate 3/4 — Frontend TypeScript Check .... ✓ PASS  0 errors
  Gate 4/4 — Knowledge Graph Sync ......... ✓ PASS  52 nodes, 30 edges

  Result: 4/4 gates passed
```

- **29/29 Pytest Tests Passing:** Full integration test suite passing with zero deprecation warnings.
- **0 TypeScript Errors:** Strict type checking across Vite and TypeScript compiler.
- **Knowledge Graph In Sync:** 52 nodes and 30 edges correctly verified.
- **Production Build Clean:** Vite tree-shaken and bundled with zero warnings.
