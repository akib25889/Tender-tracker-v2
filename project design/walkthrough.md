# Walkthrough — TenderTracker Command Center (v2.3.0)

The Tender Command Center is an enterprise-grade procurement lifecycle management system built with **FastAPI**, **MySQL 8.4 LTS**, and **React 18+ (Vite, TypeScript, Tailwind CSS)**, adhering strictly to **Ponytail** generation-time optimization and **Graphify** knowledge graph retrieval.

---

## 1. What Was Built & Interactive Capabilities

### A. Centralized Reactive Engine ([`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx))
- **Persistent State:** Type-safe React Context backed by `localStorage` (`tendertracker_pipeline_v2`).
- **Complete CRUD Operations:**
  - `addTender`: Dynamic intake creating new opportunities or updating existing records in place without arbitrary budget defaults.
  - `updateTender`: Partial state updates with immediate localStorage persistence.
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

### C. 18 Operational Modules & Screen Directory
1. **Tender Command Center Dashboard ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx))**: Real-time KPI ribbons, clickable 6-gate breakdown cards leading into the filtered pipeline, and zero-money attention queue.
2. **Tender Registry & Data Entry ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx))**: Full-page 5-tab console matching official RFP specifications.
3. **Pipeline Registry ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx))**: Multi-facet filter bar, direct row **Edit** and **Delete** actions, bulk delete bar, and full JSON dataset export.
4. **Bid Discovery Queue (`/tenders?stage=DISCOVERED`)**: Auto-filtered queue dedicated to incoming opportunities with quick discovery banners and active sidebar counts.
5. **Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx))**: Interactive 6-gate progression bar, quick Edit/Delete actions, and conditionally hidden Estimated Net Value widget.
6. **Analysis & Scope ([`TenderAnalysisTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderAnalysisTab.tsx))**: Weighted Go/No-Go Decision Matrix (35% Tech, 30% Fin, 20% Team, 15% SLA).
7. **Compliance Matrix ([`TenderRequirementsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderRequirementsTab.tsx))**: Clause status toggling, blocker alert banners, and direct vault document linking.
8. **Tender Task Board ([`TenderTasksTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderTasksTab.tsx))**: 4-column deliverable board (`To Do`, `In Progress`, `Under Review`, `Completed`) with inline assignee dropdown.
9. **Document Vault ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx))**: Category filtering, direct file download, and clean business attributes.
10. **Review & Sign-Off ([`TenderReviewTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderReviewTab.tsx))**: 4-tier sequential gatekeeper workflow.
11. **Submission Ledger ([`TenderSubmissionTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderSubmissionTab.tsx))**: Portal reference confirmation and final workspace lock.
12. **Outcome & Debrief ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx))**: Contract won/lost debrief logger feeding the analytics suite.
13. **My Tasks ([`MyTasksPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MyTasksPage.tsx))**: Cross-tender personal deliverable checklist.
14. **Team Allocation ([`TeamAllocationPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TeamAllocationPage.tsx))**: Department workload capacity distribution.
15. **Calendar ([`CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx))**: Chronological submission cutoffs with timeline filters.
16. **Win/Loss Analytics Reports ([`ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx))**: Sector distribution progress bars and conversion rates.
17. **Notification Center ([`NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx))**: Mark all as read, click-to-read, and alert filters.
18. **Settings ([`SettingsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SettingsPage.tsx))**: Storage vault directory configuration and SLA thresholds.

---

## 2. Verification Results

```powershell
> tsc -b && vite build

vite v8.2.2 building client environment for production...
transforming...
✓ 1870 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.02 kB │ gzip:   0.55 kB
dist/assets/index-DLZdkuh_.css   35.97 kB │ gzip:   7.17 kB
dist/assets/index-DBFz-6NI.js   504.12 kB │ gzip: 135.59 kB

✓ built in 3.29s
```

- **0 TypeScript errors**: Strict `"noUnusedLocals": true` and `"noUnusedParameters": true` clean.
- **0 Bundling errors**: Optimized, tree-shaken production bundle.
