# Implementation Plan — Milestone 5: Module Implementations (17 Screens)

Milestone 5 elevates the frontend from structural scaffolding to a fully interactive, feature-complete enterprise Tender Command Center across all 17 core screens. It introduces a centralized reactive store ([`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx)) to orchestrate stage transitions, task execution, compliance validation, document vault uploads with SHA-256 generation, 4-tier approval sign-offs, and multi-filter pipelines.

---

## User Review Required

> [!IMPORTANT]
> **State Management Strategy (Ponytail-Compliant)**: Rather than adding heavy third-party state managers (Redux, MobX, Zustand), we implement a clean, type-safe React Context (`TenderContext`) with `localStorage` persistence. This provides full interactivity across all 17 screens with zero external dependencies and instant reactivity.

> [!NOTE]
> **Modal Architecture**: Native accessible modal dialogs (`New Tender`, `Add Task`, `Upload Document`, `Sign-Off Approval`, `Tender Decision`) will be implemented using Tailwind overlays, keyboard esc-listeners, and focus trapping.

---

## Proposed Changes

### 1. State Management & Lifecycle Engine

#### [NEW] [`frontend/src/context/TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx)
- Provides full operational state and reactive handlers:
  - `tenders`: List of all tenders with persistent CRUD.
  - `addTender(newTender)`: Creates new tender opportunities.
  - `updateTenderStage(id, stage)`: Transitions tenders through the 6-gate lifecycle (`DISCOVERED` ➔ `SCREENING` ➔ `ANALYSIS` ➔ `PREPARATION` ➔ `REVIEW` ➔ `SUBMISSION`).
  - `setTenderDecision(id, decision, score)`: Records formal Go/No-Go evaluation.
  - `toggleTask(tenderId, taskId)` / `addTask(tenderId, task)`: Manages cross-department tasks.
  - `addDocument(tenderId, doc)`: Simulates vault uploads with automated SHA-256 hash generation.
  - `signOffReview(tenderId, tierNumber, comments)`: Advances sequential review gates.
  - `notifications`: Reactive alerts system with unread tracking.

---

### 2. Interactive Modals & Dialog Primitives

#### [NEW] [`frontend/src/components/modals/NewTenderModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/NewTenderModal.tsx)
- Form modal capturing Tender Title, Issuing Authority (UNDP, World Bank, ADB, Sovereign), Category, Estimated Valuation ($), Submission Deadline, and Priority.

#### [NEW] [`frontend/src/components/modals/UploadDocumentModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/UploadDocumentModal.tsx)
- Drag-and-drop file upload dialog targeting specific vault folders (`01` through `06`) with mock SHA-256 checksum generation.

#### [NEW] [`frontend/src/components/modals/AddTaskModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/AddTaskModal.tsx)
- Task creation dialog specifying title, assignee (Sarah Jenkins, Dr. Marcus Vance, Elena Rostova, Tariq Al-Mansoor), column, and priority.

#### [NEW] [`frontend/src/components/modals/SignOffModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/SignOffModal.tsx)
- Review sign-off dialog with digital signature confirmation and gatekeeper audit comment logging.

---

### 3. Screen Enhancements (17 Modules)

#### [MODIFY] [`frontend/src/pages/DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx)
- Dynamic KPI metrics calculated from live `TenderContext`.
- Attention queue filters (Closing soon, Blockers, Pending Decisions).
- Interactive "Quick Stage Transition" and "Add Tender" modal hookup.

#### [MODIFY] [`frontend/src/pages/TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)
- Multi-filter toolbar (Stage, Category, Donor, Urgency).
- Batch action toolbar (export selected, bulk stage change).
- Modal trigger for creating new opportunities.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderAnalysisTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderAnalysisTab.tsx)
- Interactive Go/No-Go decision matrix scoring sliders (Technical, Financial, Team, SLA).
- Live calculation of weighted aggregate score.
- Formal "Record Go/No-Go Decision" action.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderRequirementsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderRequirementsTab.tsx)
- Interactive checklist status toggle (Verified / Pending / Blocker).
- Link requirements directly to uploaded evidence files in the vault.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderTasksTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderTasksTab.tsx)
- Interactive task movement between columns (To Do ➔ In Progress ➔ Review ➔ Completed).
- "Add Task" button triggering `AddTaskModal`.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx)
- Interactive folder browsing across the 6 vault categories.
- File upload trigger activating `UploadDocumentModal`.
- Version history audit popover with simulated SHA-256 download verification.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderReviewTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderReviewTab.tsx)
- Sequential gate unlocking (Tier 4 locked until Tiers 1-3 are verified).
- "Sign Off Tier" action with `SignOffModal`.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderSubmissionTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderSubmissionTab.tsx)
- Portal receipt capture action with immutable lock timestamping.
- Submission countdown lock state.

#### [MODIFY] [`frontend/src/pages/tender-tabs/TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx)
- Form to log contract award details or record loss post-mortem taxonomy.

#### [MODIFY] [`frontend/src/pages/MyTasksPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MyTasksPage.tsx)
- Interactive task completion checkmarks updating global pipeline readiness.

#### [MODIFY] [`frontend/src/pages/TeamAllocationPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TeamAllocationPage.tsx)
- Dynamic workload calculations based on active tasks and bids per member.

#### [MODIFY] [`frontend/src/pages/CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx)
- Timeline view of all active tender cutoff dates generated dynamically from state.

#### [MODIFY] [`frontend/src/pages/ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx)
- Dynamic win rate, pipeline valuation by donor category, and board export summary view.

#### [MODIFY] [`frontend/src/pages/NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx)
- "Mark All as Read" and filter by alert type (Deadline Urgent, Compliance Blocker, Gate Passed).

#### [MODIFY] [`frontend/src/pages/SettingsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/SettingsPage.tsx)
- Configurable alert threshold settings and RBAC permission viewer.

#### [MODIFY] [`frontend/src/pages/LoginPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/LoginPage.tsx)
- Role switcher (Super Admin, Technical Lead, Finance Officer) enabling testing across user personas.

---

## Verification Plan

### Automated Verification
- Run `npm run build` in `frontend/` to confirm zero TypeScript compile errors and successful Vite production bundling.
- Verify that `dist/` builds with 0 warnings.

### Manual & Interactive Verification
- Test creating a new tender via the `+ New Tender` header action.
- Test moving tasks across Kanban columns.
- Test uploading a document to the Document Vault and verifying the generated SHA-256 hash.
- Test signing off a review tier in the 4-tier approval flow.
- Test completing a task in `My Tasks` and observing the readiness score increase.
