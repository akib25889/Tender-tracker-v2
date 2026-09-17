# Walkthrough — TenderTracker Command Center (v2.22.0)

The Tender Command Center is an enterprise-grade procurement lifecycle management system built with **FastAPI**, **MySQL 8.4 LTS** / **SQLite**, and **React 18+ (Vite, TypeScript, Tailwind CSS)**, adhering strictly to **Ponytail** generation-time optimization and **Graphify** knowledge graph retrieval.

🌐 **Live Production Cloud URL**: [https://tendertracker-app.centralindia.cloudapp.azure.com](https://tendertracker-app.centralindia.cloudapp.azure.com)  
🔑 **Super Admin**: `admin@tendertracker.com` / `Admin@2026!`

---

## 1. What Was Built & Interactive Capabilities

### A. Centralized Reactive Engine ([`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx))
- **Persistent State:** Type-safe React Context backed by `localStorage` (`tendertracker_pipeline_v2`).
- **Zero Dummy Data:** Clean default states across all tables; no hardcoded demo fallbacks.
- **Production Authentication & Session Management:**
  - `currentUser`: Hydrated from backend `/api/auth/me` with JWT Bearer validation.
  - `logout`: Revokes token session and resets application state.
- **Complete CRUD Operations:**
  - `addTender`: Dynamic intake creating new opportunities or updating existing records in place without arbitrary budget defaults.
  - `updateTender`: Partial state updates with immediate localStorage persistence + FastAPI `PUT /api/tenders/{id}` sync.
  - `deleteTender`: Single tender deletion with interactive confirmation modal protection.
  - `deleteMultipleTenders`: Multi-row bulk deletion from the pipeline table with confirmation.
  - `updateTenderStage`: Transitions opportunities across the 5 operational gates (`DISCOVERED` ➔ `SCREENING` ➔ `UNDER_ANALYSIS` ➔ `PREPARATION` ➔ `SUBMITTED`).
  - `setTenderDecision`: Records formal Go/No-Go evaluation with weighted aggregate scores.
  - `addTask` & `moveTask`: Task board state changes dynamically adjusting tender readiness scores.
  - `assignTask`: Team deliverable assignment across team members.
  - `addComment` & `deleteComment`: Cross-functional collaboration remarks.
  - `toggleRequirementStatus`: Clause checklist cycling (`VERIFIED` / `PENDING` / `BLOCKER`).
  - `submitTenderProof`: Portal confirmation ID lock and submission workspace freezing.
  - `formatCurrency`: Dual-currency engine (USD & BDT) returning clean `"—"` when values are unannounced or zero.

### B. Two-Pane Tender Registry Console ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))
- **Collapsible Master-Detail Split Pane:** Filter and search active tenders on the left rail while editing all statutory, technical, and commercial parameters in the 5-tab editor on the right pane.
- **Deep-Link URL Synchronization:** Supports `/registry?id={id}` and `/registry?edit={id}` for instant direct editing from the pipeline table or workspace header.
- **Clean Blank Date Inputs:** No unwanted fallback dates — Clarification Deadline, Bid Opening Date, Contract Start, and Published Date stay clean and blank until entered.
- **Estimated Net Value Control:** Dedicated input fields in Tab 1 and Tab 2, with automatic elimination of default mock budgets.

### C. 30 Operational Modules & Screen Directory

1. **Login & Gateway ([`LoginPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/LoginPage.tsx))**: Corporate sign-in with password visibility toggle (Eye/EyeOff) and direct `/api/auth/login` token generation.
2. **Route Guard ([`ProtectedRoute.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/auth/ProtectedRoute.tsx))**: Intercepts unauthenticated navigation across all dashboard routes, redirecting unauthenticated users to `/login`.
3. **Corporate User Menu ([`UserMenu.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/UserMenu.tsx))**: Live user badge in Header, profile settings links, and secure sign-out.
4. **Tender Command Center Dashboard ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx))**: Real-time KPI ribbons, clickable gate breakdown cards leading into the filtered pipeline, and zero-money attention queue.
5. **Tender Registry & Data Entry ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))**: Full-page 5-tab console matching official RFP specifications.
6. **Pipeline Registry ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx))**: Multi-facet filter bar, direct row **Edit** and **Delete** actions, bulk delete bar, full JSON dataset export, and batch CSV/JSON ingestion.
7. **Bid Discovery Queue (`/tenders?stage=DISCOVERED`)**: Auto-filtered queue dedicated to incoming opportunities with quick discovery banners and active sidebar counts.
8. **Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx))**: Redesigned lifecycle workspace with 5-gate ribbon, 2x3 specification matrix, scope synopsis, Compliance Sentinel, and live team stream.
9. **Compliance Matrix ([`TenderRequirementsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderRequirementsTab.tsx))**: Clause status toggling, blocker alert banners, and direct vault document linking.
10. **Tender Task Board ([`TenderTasksTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderTasksTab.tsx))**: 4-column deliverable board (`To Do`, `In Progress`, `Under Review`, `Completed`) with inline assignee dropdown.
11. **Document Vault ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx))**: Category filtering, direct file download, custom folder lifecycle, and master library linking.
12. **JV Partner Collaboration Hub ([`TenderPartnersTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderPartnersTab.tsx))**: Time-bounded partner access duration controls (7–90 days), active expiry dates, and revoked access controls.
13. **Master Document Library ([`MasterDocumentVaultPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterDocumentVaultPage.tsx))**: Central corporate credential vault with 4-tier RBAC access control.
14. **Submission Ledger ([`TenderSubmissionTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderSubmissionTab.tsx))**: Portal reference confirmation and final workspace lock.
15. **Outcome & Debrief ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx))**: Contract won/lost debrief logger feeding the analytics suite.
16. **My Tasks ([`MyTasksPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MyTasksPage.tsx))**: Cross-tender personal deliverable checklist.
17. **Team Allocation ([`TeamAllocationPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TeamAllocationPage.tsx))**: Department workload capacity distribution.
18. **Calendar ([`CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx))**: Toggle between **Timeline** (chronological list with 7/14-day filters) and **Grid** (interactive monthly calendar with colour-coded deadline chips, prev/next navigation).
19. **Report & Analytics ([`ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx))**: 3-mode intelligence console (Basic, General, Advance) covering executive summaries, domain distribution, client capture telemetry, and extensible metric frameworks.
20. **Client Visitor & Scheduled Meetings Hub ([`ClientVisitsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ClientVisitsPage.tsx))**: Enterprise console for managing client delegations, pre-bid clarification sessions, and site visits with reception check-in/out workflows and Minutes of Meeting (MoM).
21. **Real-Time Alert Center ([`NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx))**: Live alerts from `/api/alerts` — critical deadline warnings (≤48h), requirement blockers, expired partner share links. Header bell shows live numbered badge.
22. **Permissions & Access Control Matrix ([`MasterPermissionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterPermissionsPage.tsx))**: 5-tab authorization control centre — Live Diagnostic Simulator, JV Partner Ceilings, Role Baselines, Security Blockers, Audit Trail.
23. **Joint Venture Partner Collaboration Portal ([`PartnerPortalPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/PartnerPortalPage.tsx))**: Comprehensive authenticated collaboration workspace for Joint Venture partners with Layer-2 hard security isolation, auditor re-upload workflows, and TOR checklist.
24. **Team Chat ([`ChatDiscussionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ChatDiscussionsPage.tsx))**: Cross-team channels and proposal-specific threads.
25. **Settings ([`SettingsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SettingsPage.tsx))**: Storage vault directory configuration and SLA thresholds.
26. **Archived Tenders ([`ArchivePage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ArchivePage.tsx))**: Repository of soft-deleted and archived bids with restore and permanent purge capabilities.
27. **Shared Document Vault Portal ([`SharedDocumentPortalPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SharedDocumentPortalPage.tsx))**: Tokenized external portal for single-document verification and download without dashboard login.
28. **Organizations Hierarchy & Catalog ([`OrganizationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/OrganizationsPage.tsx))**: Procuring entity master catalog, interactive parent-child hierarchy tree view, directory table view, and creation modal under the Tools & Addons module.
29. **404 Route Not Found Page ([`NotFoundPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/status/NotFoundPage.tsx))**: Dedicated catch-all error handling.
30. **403 Forbidden Access Page ([`AccessDeniedPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/status/AccessDeniedPage.tsx))**: RBAC violation warning page with return prompts.

---

## 2. Key Release Features (v2.20.0)

### A. Production Authentication & Route Protection
- **JWT Bearer Security Core:** Added `OAuth2PasswordBearer` and `get_current_user` FastAPI dependency. Authenticated endpoints for login, session check, and logout (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`).
- **Super Admin Infrastructure:** Real administrative user created (`admin@tendertracker.com` / `Admin@2026!`) with `SUPER_ADMIN` authority.
- **Corporate Login Page (`LoginPage.tsx`):** Clean blank forms, password reveal toggle (Eye / EyeOff), and direct backend authentication without demo shortcuts.
- **Route Guard (`ProtectedRoute.tsx`):** Intercepts all dashboard and operational screens, redirecting unauthenticated users to `/login`.
- **Corporate User Menu (`UserMenu.tsx`):** Integrated in `Header.tsx`, showing authenticated user identity, role badge, settings link, and secure sign-out.

### B. Complete Dummy Data Purge & Database Reset Sentinel
- **Zero Dummy Data Pipeline:** Stripped all mock tenders, mock documents, mock visits, and mock discussions from backend seeder and frontend context.
- **Automated Reset Tool (`backend/scripts/reset_production_db.py`):** 1-command reset script purging all mock data and re-seeding essential infrastructure across both local SQLite and live Azure MySQL databases.

### C. Public Procurement Governance Framework (Req #21)
- Full-stack persistence, API serialization, and multi-surface UI representation for 4 critical public procurement attributes: `tender_type`, `budget_type`, `source_of_fund`, and `procurement_method`.

### D. Status Pages & Error Boundaries
- `NotFoundPage.tsx` (`/not-found` & `*` catch-all) for missing URLs.
- `AccessDeniedPage.tsx` (`/forbidden`) for RBAC security ceiling violations.
- `RootErrorBoundary.tsx` global 500 crash boundary.

### E. Comprehensive CSS-Only Dark Mode Theme (WCAG AA Compliant)
- Structured surface elevation tokens (`--bg-canvas: #0B0F17`, `--bg-surface: #131B28`, `--bg-surface-raised: #1A2436`).
- High-contrast typography tokens meeting WCAG AA standards.

### F. Clean Blank Entry, Registry Console & Clauses UI Modernization (v2.22.0)
- **100% Clean Blank Intake:** New Opportunity modal and Tender Registry console open with zero pre-filled mock text, zero default budgets, and clean `-- Select ... --` placeholders across all procurement dropdowns.
- **Active Record Switcher:** Integrated tender selector in the Tender Registry header allowing seamless switching between existing records and a clean blank entry form.
- **Important Clauses Manager UI Redesign:** Replaced legacy dark slate blocks with a cohesive, high-contrast, light-themed card layout, light interactive preset chips, clean search/filter inputs, and styled empty states with full dark-mode responsiveness.
- **Countdown & Timezone Synchronization:** Aligned dynamic submission countdowns to true ISO 8601 offset strings and local Bangladesh Time (BST/UTC+6) with localized labels.
- **Production Cloud Verification:** Built with Vite/TypeScript (0 errors) and deployed live to Azure VM.

---

## 3. Backend REST API Directory

| Router | Prefix | Key Endpoints |
| :--- | :--- | :--- |
| `auth` | `/api/auth` | `POST /login`, `GET /me`, `POST /logout`, `GET /team` |
| `tenders` | `/api/tenders` | Full CRUD, archive, restore, stage, `POST /batch-import` |
| `tasks` | `/api/tasks` | Per-tender task CRUD + PATCH status/assignee |
| `documents` | `/api/documents` | Upload, download, share token validation, ZIP, `reusable-documents` |
| `company_credentials` | `/api/credentials` | Work Orders, Completion Certificates, Custom Fields CRUD |
| `company_profiles` | `/api/company-profiles` | Corporate entity identities, statutory data, banking credentials |
| `client_visits` | `/api/client-visits` | In-person delegations, clarification meetings, MoM notes |
| `permissions` | `/api/permissions` | 4-layer RBAC engine, partner ceilings, audit trail |
| `alerts` | `/api/alerts` | Live operational alerts (DEADLINE, BLOCKER, APPROVAL, VAULT) |
| `categories` | `/api/categories` | Master tender category management |
| `settings` | `/api/settings` | System settings, local storage directory paths |

---

## 4. Verification Results (v2.20.0)

```
python run_all_tests.py

  Gate 1/4 — Database Health Check ........ ✓ PASS
  Gate 2/4 — Backend Pytest Suite ......... ✓ PASS  44/44 passed
  Gate 3/4 — Frontend TypeScript Check .... ✓ PASS  0 errors
  Gate 4/4 — Knowledge Graph Sync ......... ✓ PASS  54 nodes, 32 edges

  Result: 4/4 gates passed
```

- **44/44 Pytest Tests Passing:** Full integration test suite passing on Python 3.13.
- **0 TypeScript Errors:** Strict type checking across Vite and TypeScript compiler (`tsc -b && vite build`).
- **Knowledge Graph In Sync:** 54 nodes and 32 edges correctly verified via Graphify.
- **Production Build Clean:** Vite tree-shaken and bundled with zero warnings.
- **Live Cloud Deployment Verified:** Running live on Azure VM at `https://tendertracker-app.centralindia.cloudapp.azure.com`.

