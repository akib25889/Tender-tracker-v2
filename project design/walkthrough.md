# Walkthrough — TenderTracker Command Center (v2.5.0)

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

### C. 21 Operational Modules & Screen Directory

1. **Tender Command Center Dashboard ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx))**: Real-time KPI ribbons, clickable 6-gate breakdown cards leading into the filtered pipeline, and zero-money attention queue.
2. **Tender Registry & Data Entry ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))**: Full-page 5-tab console matching official RFP specifications.
3. **Pipeline Registry ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx))**: Multi-facet filter bar, direct row **Edit** and **Delete** actions, bulk delete bar, and full JSON dataset export.
4. **Bid Discovery Queue (`/tenders?stage=DISCOVERED`)**: Auto-filtered queue dedicated to incoming opportunities with quick discovery banners and active sidebar counts.
5. **Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx))**: Interactive 6-gate progression bar, quick Edit/Delete actions, and conditionally hidden Estimated Net Value widget.
6. **Analysis & Scope ([`TenderAnalysisTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderAnalysisTab.tsx))**: Weighted Go/No-Go Decision Matrix (35% Tech, 30% Fin, 20% Team, 15% SLA).
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
20. **Team Chat ([`ChatDiscussionsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ChatDiscussionsPage.tsx))**: Cross-team channels and proposal-specific threads.
21. **Settings ([`SettingsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SettingsPage.tsx))**: Storage vault directory configuration and SLA thresholds.

---

## 2. Backend REST API

| Router | Prefix | Key Endpoints |
| :--- | :--- | :--- |
| `auth` | `/api/auth` | `POST /login` |
| `tenders` | `/api/tenders` | Full CRUD, archive, restore, reviews, stage |
| `tasks` | `/api/tasks` | Per-tender task CRUD + PATCH status/assignee |
| `documents` | `/api/documents` | Upload, download, share token validation, ZIP |
| `comments` | `/api/comments` | Threaded discussion CRUD |
| `dashboard` | `/api/dashboard` | `/stats`, `/reports/analytics` |
| `permissions` | `/api/permissions` | RBAC engine, partner orgs, audit trail |
| **`alerts`** | **`/api/alerts`** | **Live operational alerts (NEW v2.5.0)** |

### `/api/alerts` — Alert Categories
| Category | Source | Severity |
| :--- | :--- | :--- |
| `DEADLINE` | Active tenders `hours_remaining ≤ 48` | CRITICAL (≤24h) / WARNING |
| `BLOCKER` | `TenderRequirement.status = BLOCKER` | WARNING |
| `APPROVAL` | Review Tier 3/4 PENDING or ACTION_REQUIRED | INFO |
| `VAULT` | Expired `ResourceShare` not yet revoked | INFO |

---

## 3. QA Bug Fixes (v2.4.x → v2.5.0)

| ID | File | Fix |
| :--- | :--- | :--- |
| BUG-01 | `test_api_integration.py` | Added `setup_module()` so TestClient runs lifespan table creation |
| BUG-02 | `TenderContext.tsx` | Wired `addTender`/`updateTender` to `POST/PUT /api/tenders` |
| BUG-03 | `TenderDetailPage.tsx` + 8 tab files | Added `if (!tender) return null` early-return guards |
| BUG-04 | `schemas/tender.py` | Added `folders: List[FolderOut]` to `TenderOut` |
| BUG-05 | `routers/documents.py` | Enabled `ReusableDocument` lookup in share/download endpoints |
| BUG-06 | `services/storage.py` | Sanitised uploaded filenames via `Path(...).name` |
| BUG-07 | `tasks.py`, `comments.py`, `documents.py` | UUID hex PKs replacing collision-prone `.count() + 101` |
| BUG-08 | `routers/dashboard.py` | `(t.readiness_score or 0)` null-safety guard |
| BUG-09 | `routers/permissions.py` | 404 validation for `tender_id` in `assign_partner_to_tender` |
| BUG-10 | `exportUtils.ts`, `ReportsPage.tsx` | `(t.estimatedValue \|\| 0)` NaN guard |
| BUG-11 | All backend files | `datetime.utcnow()` → `datetime.now(timezone.utc)` |
| BUG-12 | `CommandPaletteModal.tsx`, `MyTasksPage.tsx`, `TeamAllocationPage.tsx` | `(t.tasks \|\| []).forEach` array null guards |
| BUG-13 | `models/tender.py`, `routers/tenders.py` | Orphan cascade cleanup + explicit `ResourceShare` deletion |

---

## 4. Verification Results (v2.5.0)

```
python run_all_tests.py

  Gate 1/4 — Database Health Check ........ ✓ PASS
  Gate 2/4 — Backend Pytest Suite ......... ✓ PASS  25/25 passed in 3.86s
  Gate 3/4 — Frontend TypeScript Check .... ✓ PASS  0 errors
  Gate 4/4 — Knowledge Graph Sync ......... ✓ PASS  46 nodes, 24 edges

  Result: 4/4 gates passed (12.4s)
```

```powershell
> npm run build
vite v8.2.2 building client environment for production...
✓ 1883 modules transformed.
dist/assets/index-Q5f72WvM.css   52.56 kB │ gzip: 10.19 kB
dist/assets/index-D67WqqZc.js   708.10 kB │ gzip: 179.01 kB
✓ built in 2.62s
```

- **25/25 pytest tests passing** — zero `datetime.utcnow()` deprecation warnings from project code
- **0 TypeScript errors** — strict `noUnusedLocals` + `noUnusedParameters` clean
- **0 bundling errors** — optimized, tree-shaken production bundle
- **Commit:** `ae2d644` on `origin/main`
