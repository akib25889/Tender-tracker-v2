# TenderTracker Command Center — Project History & Execution Ledger

**Project Name:** TenderTracker Procurement Core & Command Center  
**Repository:** [github.com/akib25889/Tender-tracker-v2](https://github.com/akib25889/Tender-tracker-v2)  
**Current Version:** 2.3.0  
**Stack:** FastAPI (Python 3.12+), MySQL 8.4 LTS, React 18+ (Vite, TypeScript, Tailwind CSS), Local SSD Storage  
**Optimization Engines:** Ponytail ("Lazy Senior Dev" code generation) & Graphify (Knowledge Graph retrieval)

---

## 1. Milestone Roadmap & Status

| Phase | Milestone | Status | Details |
| :--- | :--- | :--- | :--- |
| **M0** | **Product & Architecture Specs** | **Completed** | Full PRD, 17-screen specifications, backend storage spec, 17 interactive HTML prototypes. |
| **M1** | **Repository & Agent Tooling** | **Completed** | Git repository initialized, linked to GitHub, `.gitignore` & directory scaffolding, Ponytail & Graphify integration. |
| **M2** | **Backend Core & Database Schema** | *Pending* | FastAPI application structure, SQLAlchemy models, Alembic migrations, JWT/Argon2id authentication. |
| **M3** | **Storage Vault & Document Security** | *Pending* | Abstracted local filesystem storage engine (`storage/tenders/{TDR-ID}/...`), SHA-256 versioning, upload validation. |
| **M4** | **Frontend Foundation & Design System**| **Completed** | React + Vite + TypeScript scaffold, Tailwind theme (Plus Jakarta Sans, Inter, JetBrains Mono), collapsible shell, 18-screen routing. |
| **M5** | **Module Implementations (18 Screens)**| **Completed** | Reactive TenderContext with full CRUD (add, edit, delete, bulk delete), two-pane Tender Registry console (`/registry`), Bid Discovery queue, collaboration suite, and 18 operational screens. |
| **M6** | **E2E Testing & Production Hardening** | *Pending* | Integration test suite, 3-2-1 backup sentinel, Nginx reverse proxy configuration, production deployment. |

---

### [2026-09-04] — Tender Data Ingestion: ACRI Digital Ratings Platform (PRC0190428) & Dark Mode
- **Category:** Data Entry, Ingestion & Theming
- **Summary:**
  - **Tender Data Ingestion (`PRC0190428`):**
    - Inputted the complete tender record for **"Development of the African Credit and Investment Risk (ACRI) Digital Ratings Platform"** (UNDP, Reference `PRC0190428`) matching all photographed specifications.
    - Added full Basic Information table (Country: Ghana & Côte d'Ivoire, Portal: UNDP Quantum, Deadline: 15 Sep 2026, 23:59:59 ET, Estimated Value: unstated).
    - Added comprehensive Commercial, Technical, Software/Tech stack, and Operational requirements.
    - Added Key Eligibility criteria, JV/Consortium rules, and statutory Submission Documents (Form C through Form K).
    - Populated CV / Personnel Requirements table (4 key roles: Project & technical personnel, Software/Platform Experts, Data/AI/ML Experts, Financial/Credit/Investment Risk Experts).
    - Populated Key Risks / Important Points (with `[Tender Requirement]` and `[Analyst Observation]` badges) and Management Highlights.
    - Added automatic state synchronization in [`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx) to merge the new tender into existing local client storage.
  - **Tender Summary Document View (`/registry/summary/:id`):**
    - Implemented a high-fidelity document-style summary page matching the user's printed report photos.
    - Integrated with [`TenderSummaryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderSummaryPage.tsx) with print stylesheet, clean data tables, bullet points, and quick link to Workspace / Edit entry.
  - **Dark Theme / Night Mode:**
    - Implemented full dark mode theme system using CSS variable tokens (`--bg-canvas`, `--bg-surface`, `--text-primary`, `--border-default`).
    - Added `useTheme` hook with persistence in `localStorage` and system color scheme preference detection.
    - Added Moon/Sun toggle in the persistent global Header bar.
- **Relevant Files:**
  - `frontend/src/mock/tenders.ts`
  - `frontend/src/types/tender.ts`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/pages/TenderSummaryPage.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/AppLayout.tsx`
  - `frontend/src/hooks/useTheme.ts`
  - `frontend/src/index.css`

---

### [2026-09-03] — Tender Data Entry: Blank Dates Fallback Removal & Conditional Net Value
- **Category:** Form Ergonomics & UI Precision
- **Summary:**
  - **Blank Dates If Not Entered ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)):**
    - Removed arbitrary `new Date().toISOString()` fallbacks from `Clarification Deadline`, `Bid Opening Date`, `Expected Contract Start`, `Published Date`, and `Submission Deadline`.
    - Removed mandatory HTML `required` attributes from deadline dates and submission cutoff times so unannounced/discovery-stage tenders can be created and saved with blank dates.
    - Updated [`UrgencyBadge.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/UrgencyBadge.tsx) to display a neutral `"No Deadline"` badge when dates are omitted rather than triggering a false-positive critical alert.
  - **Estimated Net Value Field in Registry ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)):**
    - Added dedicated **"Estimated Net Value ($ USD)"** input field in both Tab 1 (Basic Information) and Tab 2 (Scope & Commercial).
    - Removed the hardcoded default fallback of `$1,000,000` (which previously forced all newly created tenders to display `৳12.20 Cr`).
  - **Conditional Estimated Net Value Display ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx), [`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx)):**
    - Updated Proposal Workspace header widget: if a tender has no entered estimated value (zero or undefined), the **"Estimated Net Value"** block is completely hidden, cleanly displaying only the SOW Category.
    - Updated `formatCurrency` to return a clean `"—"` dash when amounts are zero, null, or undefined.
- **Relevant Files:**
  - `frontend/src/pages/TenderRegistryPage.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/components/ui/UrgencyBadge.tsx`

---

### [2026-09-03] — UI Cleanup: Removed Dashboard Attention Rule Subtitle
- **Category:** Copywriting & Visual Cleanup
- **Summary:**
  - Removed the subtitle string *"Operational triage dashboard adhering to the 10-Second Attention Rule."* from the top header of [`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx).
- **Relevant Files:**
  - `frontend/src/pages/DashboardPage.tsx`

---

### [2026-09-03] — Tender Management: Added Direct Edit & Delete Capabilities
- **Category:** Core Pipeline Operations & CRUD
- **Summary:**
  - **Tender Pipeline Table ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)):**
    - Added **"Edit"** button to each row, linking directly to the full specification editor in `/registry?id={id}`.
    - Added **"Delete"** button to each row with an interactive confirmation modal protecting against accidental deletions.
    - Added **"Delete Selected ({count})"** button to the bulk action bar for multi-tender deletion.
  - **Tender Registry Integration ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)):**
    - Connected `useSearchParams` (`?id=` / `?edit=`) to auto-select and open the target tender for immediate editing.
    - Added a **"Delete"** action button in the editor header with confirmation.
  - **Workspace Header ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx)):**
    - Added **"Edit"** and **"Delete"** action buttons alongside the export action in the top header.
  - **Context Operations ([`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx)):**
    - Implemented and exposed `updateTender`, `deleteTender`, and `deleteMultipleTenders` with local storage persistence.
    - Updated `addTender` to update existing entries when matching IDs.
- **Relevant Files:**
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/pages/TenderListPage.tsx`
  - `frontend/src/pages/TenderRegistryPage.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`

---

### [2026-09-03] — Terminology Alignment: Replaced "Post-Mortem" with "Outcome & Debrief"
- **Category:** Copywriting & Domain Semantics
- **Summary:**
  - **Replaced "Post-Mortem" Across App & Tabs:**
    - Updated the Proposal Workspace tab label from `"Result Post-Mortem"` to **`"Outcome & Debrief"`** ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx)).
    - Updated the evaluation card header from `"Tender Award & Post-Mortem Taxonomy Ledger"` to **`"Tender Outcome & Debrief Ledger"`** ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx)).
    - Updated the evaluation submission button from `"Record Post-Mortem Evaluation"` to **`"Record Outcome Evaluation"`** ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx)).
    - Updated reports heading from `"Procurement Reports & Post-Mortem Analytics"` to **`"Procurement Reports & Win/Loss Analytics"`** ([`ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx)).
  - **Knowledge Graph Synchronization:**
    - Updated `screen:tender_result` in `tools/graphify/graphify.py` and regenerated [`knowledge_graph.json`](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.json) and [`knowledge_graph.md`](file:///h:/Tender%20tracker%20v2/tools/graphify/knowledge_graph.md).
- **Relevant Files:**
  - `frontend/src/pages/TenderDetailPage.tsx`
  - `frontend/src/pages/tender-tabs/TenderResultTab.tsx`
  - `frontend/src/pages/ReportsPage.tsx`
  - `tools/graphify/graphify.py`

---

### [2026-09-03] — Document Vault: Removed Document Sharing Capability
- **Category:** Governance & UI Simplification
- **Summary:**
  - **Removed Share Action ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx)):**
    - Removed the "Share" icon button from the Document Vault table rows, retaining a single, direct "Download" button for each file.
  - **Unmounted Share Modal ([`AppLayout.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/AppLayout.tsx)):**
    - Removed `ShareDocumentModal` and its state listener from the application layout, reducing JavaScript bundle size and eliminating external sharing workflows.
- **Relevant Files:**
  - `frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`
  - `frontend/src/components/layout/AppLayout.tsx`

---

### [2026-09-03] — Document Vault Clean-Up: Removed Folder Paths & Cryptographic Hashes
- **Category:** UI / UX Simplification
- **Summary:**
  - **Removed Technical Noise ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx)):**
    - Removed `Folder Path` column and raw `/{doc.folder}/` directories from both the document table and repository cards.
    - Removed `SHA-256 Checksum` column and copy hash interactions from the table, replacing them with clear, business-friendly columns: `Category` and human-readable `Size`.
    - Simplified section title and subtitle to *"Tender Document Vault"* and *"Centralized repository for RFP notices, statutory credentials, and proposal files"*.
  - **Security Modal Clean-Up ([`ShareDocumentModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/ShareDocumentModal.tsx)):**
    - Updated audit footer to plain English *"Verified Audit Trail Active"*.
- **Relevant Files:**
  - `frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`
  - `frontend/src/components/modals/ShareDocumentModal.tsx`

---

### [2026-09-03] — UI Polishing: Fixed Badge Text Wrapping for Urgency & Decision
- **Category:** UI / Typography & Layout Fixes
- **Summary:**
  - **Single-Line Urgency Badges ([`UrgencyBadge.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/UrgencyBadge.tsx)):**
    - Resolved awkward two-line text breaking (`37d \n left`, `🔴 2d \n left`) by adding strict `whitespace-nowrap shrink-0` and replacing wide monospace styling with standard typography and consistent padding.
  - **Streamlined Decision Badges ([`StatusBadge.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/StatusBadge.tsx)):**
    - Replaced the redundant, wordy `"DECISION PENDING"` label with a concise, modern `"Pending"` badge with `whitespace-nowrap`.
  - **Table Cell Whitespace Protection ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)):**
    - Added `whitespace-nowrap` to table headers and data cells for Stage, Decision, Urgency, Value, and Actions to guarantee columns never wrap or squeeze badges.
- **Relevant Files:**
  - `frontend/src/components/ui/UrgencyBadge.tsx`
  - `frontend/src/components/ui/StatusBadge.tsx`
  - `frontend/src/pages/TenderListPage.tsx`

---

### [2026-09-03] — Header Streamlining & Consolidation to Dedicated Registry Page
- **Category:** Architecture & UX Simplification
- **Summary:**
  - **Header Cleanup ([`Header.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Header.tsx)):**
    - Removed the redundant "Registry" button from the top header controls.
    - Updated the "+ New Opportunity" button to navigate directly to `/registry` via React Router `<Link>`.
  - **Removed Redundant Intake Modal ([`AppLayout.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/AppLayout.tsx)):**
    - Unmounted and removed `NewTenderModal` from global layout; all intake, metadata editing, and specification entry now flow exclusively through the dedicated full-page console at `/registry` ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)).
  - **Unified Action Links ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx), [`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)):**
    - Replaced all modal trigger buttons with direct links to `/registry`.
- **Relevant Files:**
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/AppLayout.tsx`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/TenderListPage.tsx`

---

### [2026-09-03] — Bid Discovery Navigation & Filtered Pipeline View
- **Category:** Navigation & Pipeline Filtering
- **Summary:**
  - **Sidebar Bid Discovery Link ([`Sidebar.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Sidebar.tsx)):**
    - Added dedicated **"Bid Discovery"** navigation item with a dynamic badge showing the count of new discovered tenders (`{newDiscoveredCount} New`).
    - Links directly to `/tenders?stage=DISCOVERED` with accurate active state matching.
  - **Dashboard Quick Access ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx)):**
    - Renamed stage 1 to `"1. Bid Discovery"` in the 6-gate breakdown and made all 6 gate cards clickable links leading directly into the filtered pipeline.
    - Added a quick action link under KPI 1: *"View Discovered Bids →"*.
  - **Pipeline Auto-Filter & Discovery Banner ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)):**
    - Synced `selectedStage` state with the `?stage=` URL query parameter using `useSearchParams`.
    - Added a **Bid Discovery Queue** header banner with count of new tenders, guidance, and a *"Show All Pipeline"* quick reset button.
    - Updated stage filter chips so clicking any stage updates the URL and state synchronously.
- **Relevant Files:**
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/TenderListPage.tsx`

---

### [2026-09-03] — Enterprise Collaboration Suite: RBAC, Task Assign, Document Share & Commenting
- **Category:** Collaboration, Security & Operational Governance
- **Summary:**
  - **Role-Based Access Control (RBAC) & Universal Permissions:**
    - Configured the 4 requested organizational roles: `BUSINESS_HEAD` ("Business Head"), `EXECUTIVE_MANAGER` ("Executive Manager"), `SENIOR_MANAGER` ("Senior Manager"), and `TENDER_ANALYST` ("Tender Analyst") ([`tender.ts`](file:///h:/Tender%20tracker%20v2/frontend/src/types/tender.ts), [`users.ts`](file:///h:/Tender%20tracker%20v2/frontend/src/mock/users.ts)).
    - Built [`UserRoleSwitcher.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/UserRoleSwitcher.tsx) mounted in the header, allowing instant profile and role switching with color-coded badges.
    - **Universal Permissions Activated:** Every role possesses full operational access (`canPerformAction` returns `true`). All members can advance/revert lifecycle stages, sign off reviews, assign tasks, share documents, and add/delete comments without restriction.
  - **Task Assignment:**
    - Added interactive Assignee selector to task Kanban cards ([`TenderTasksTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderTasksTab.tsx)).
    - Reassigns tasks dynamically across team members with instant state persistence via `assignTask()`.
  - **Document Sharing:**
    - Added a "Share" action button next to download/verify in Document Vault ([`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx)).
    - Built [`ShareDocumentModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/ShareDocumentModal.tsx) supporting granular permission levels (`View Only` vs. `Full Download`), recipient email, time-limited token links (7-day validity), and one-click copy.
  - **Team Commenting Thread:**
    - Created [`TenderCommentsSection.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/TenderCommentsSection.tsx) mounted in the Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx)).
    - Displays comment history with author name, role badges, timestamps, and delete actions for author/Director.
    - Enables posting new remarks authored under the active user's identity and role.
- **Relevant Files:**
  - `frontend/src/types/tender.ts`
  - `frontend/src/mock/users.ts`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/components/ui/UserRoleSwitcher.tsx`
  - `frontend/src/components/modals/ShareDocumentModal.tsx`
  - `frontend/src/components/ui/TenderCommentsSection.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/AppLayout.tsx`
  - `frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`
  - `frontend/src/pages/tender-tabs/TenderTasksTab.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`

---

### [2026-09-03] — Sidebar Minimizer, Dedicated Tender Registry Page & Monetary Analysis Removal
- **Category:** Core UX & Information Architecture
- **Summary:**
  - **Sidebar Minimizer:**
    - Added a prominent minimizer / collapse chevron button directly on the top branding bar of [`Sidebar.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Sidebar.tsx) and preserved the bottom toggle.
    - Added a header minimizer toggle button (`PanelLeftClose` / `PanelLeftOpen`) in [`Header.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Header.tsx) and wired it cleanly via `AppLayout.tsx`.
  - **Dedicated Tender Registry Page ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)):**
    - Created a standalone full-page Tender Registry console at `/registry` matching the design and all fields from `tender-dashboard.html`.
    - Features a 2-panel layout: left scrollable entry rail with live search and classification filters; right comprehensive tabbed editor for Basic Info, Scope & Commercial, Eligibility & JV, Staff & Hardware, Dates & Risks, and Notes.
    - Added search panel minimizer: allows collapsing the left list/search rail with one click (`PanelLeftClose`), expanding the data entry editor to full-width (12 columns), and restoring it via an expand toggle button (`PanelLeftOpen`).
    - Added "+ New Tender Entry", export actions (PDF, DOCX, MD, JSON), and direct link to Proposal Workspace.
    - Added "Tender Registry" link to [`Sidebar.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Sidebar.tsx) and [`router.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/router.tsx).
  - **Monetary Analysis Removal:**
    - Removed all dollar figures, currency calculations, and financial metrics from [`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx).
    - Converted KPI 1 from dollar net pipeline to operational "Active Opportunities" count and active drafting status.
    - Converted 6-Gate Breakdown to pure bid counts and pipeline percentages.
    - Replaced monetary values in the Attention Queue table with Category and Priority badges.
    - Removed the currency switcher from the application header.
- **Relevant Files:**
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/AppLayout.tsx`
  - `frontend/src/pages/TenderRegistryPage.tsx`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/router.tsx`

---

### [2026-09-03] — Multi-Format Export Engine (PDF, DOCX, Markdown, JSON)
- **Category:** Document Generation & Interoperability
- **Summary:**
  - Built comprehensive multi-format export utilities ([`exportUtils.ts`](file:///h:/Tender%20tracker%20v2/frontend/src/utils/exportUtils.ts)) supporting:
    - **PDF (`.pdf`):** Clean print-ready HTML stylesheet triggering browser PDF rendering with metadata badges, statutory tables, and signature fields.
    - **Word Document (`.docx` / `.doc`):** WordprocessingML XML/HTML format rendering styled tables, headings, and tender summaries compatible with Microsoft Word and Google Docs.
    - **Markdown Brief (`.md`):** Formatted GitHub-flavored markdown documents with tables, bulleted technical scopes, and financial breakdowns.
    - **Raw Data (`.json`):** Formatted JSON payload containing all tender domain models, tasks, checklists, and summary dictionaries.
  - Implemented reusable [`ExportDropdown.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/ExportDropdown.tsx) component with format icons, file extensions, and click-outside dismissal.
  - Deployed export actions across:
    - **Pipeline Registry ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)):** Bulk exports filtered active opportunities.
    - **Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx)):** Exports individual tender specification briefs.
    - **Analytics Reports ([`ReportsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ReportsPage.tsx)):** Exports pipeline board executive reports.
- **Relevant Files:**
  - `frontend/src/utils/exportUtils.ts`
  - `frontend/src/components/ui/ExportDropdown.tsx`
  - `frontend/src/pages/TenderListPage.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`
  - `frontend/src/pages/ReportsPage.tsx`

---

### [2026-09-03] — Comprehensive Tender Registration Fields from Tender-Dashboard Template
- **Category:** Domain Model Expansion & Opportunity Intake
- **Summary:**
  - Integrated all fields from [`tender-dashboard.html`](file:///h:/Tender%20tracker%20v2/tender-dashboard.html) into the New Tender Registration modal ([`NewTenderModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/NewTenderModal.tsx)), organized into 5 intuitive tabs:
    1. **Basic Info & Classification:** Domain classification pills (`SOFTWARE / IT RELATED`, etc.), Tender Title, Project Name, Tender ID, Reference No., Client / Donor, Portal, Country, SOW Category, Estimated Net Value (USD/BDT), Published Date, Submission Cutoff Date & Time, Priority.
    2. **Scope & Commercial Requirements:** Concept & Main Idea, Tender Security (EMD), Contract / Service Period, Document Price, Performance Security, dynamic Technical Requirements list, Software/Tech Stack mentioned, Operational & SLA service lines.
    3. **Eligibility & JV Guidelines:** General Experience, Similar Contracts Experience, Min Contract Value, Annual Turnover, Liquid Assets / Credit Line, Quality Certifications, Local Presence mandate, and JV / Consortium rules.
    4. **Submission Docs, Staffing & Hardware:** Submission Documents checklist, Key Personnel / CV Table (`position`, `qualification`, `experience`, `qty`), and Hardware & Equipment specifications Table (`equipment`, `purpose`).
    5. **Dates, Risks & Notes:** Clarification Deadline, Opening Date, Expected Contract Start, Key Risks / Points with Type tag (`Tender Requirement` vs `Analyst Observation`), Management Highlights, and Internal Notes.
  - Expanded TypeScript domain interfaces ([`tender.ts`](file:///h:/Tender%20tracker%20v2/frontend/src/types/tender.ts)) with `TenderExtendedSummary`, `TenderPersonnelReq`, `TenderHardwareReq`, and `TenderRiskPoint`.
  - Updated [`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx) to automatically seed compliance checklist requirements and tasks from registered summary documents.
  - Enhanced Proposal Workspace ([`TenderDetailPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderDetailPage.tsx)) to render the comprehensive Tender Summary, commercial securities, personnel mandates, and risk flags.
- **Relevant Files:**
  - `frontend/src/types/tender.ts`
  - `frontend/src/components/modals/NewTenderModal.tsx`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`

---

### [2026-09-03] — Currency Switcher (USD/BDT), AI Button Cleanup & Lifecycle Stage Revert
- **Category:** UI/UX & Functional Refinements
- **Summary:**
  - Implemented global **USD ($) / BDT (৳)** currency toggle in the top header with live conversion rate across all screens, tables, KPIs, and reports (`formatCurrency` helper in `TenderContext`).
  - Removed "AI Scope Assist" button from the top application header.
  - Added a **"Back to [Previous Stage]"** option on the Current Lifecycle Stage bar in the Proposal Workspace (`TenderDetailPage.tsx`), enabling bi-directional lifecycle stage navigation.
- **Relevant Files:**
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/TenderListPage.tsx`
  - `frontend/src/pages/CalendarPage.tsx`
  - `frontend/src/pages/ReportsPage.tsx`

---

### [2026-09-03] — Milestone 5: Module Implementations (17 Screens) Completed
- **Category:** Frontend Application Modules & Interactive State
- **Summary:**
  - Built centralized reactive state store ([`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx)) with `localStorage` persistence managing tender lifecycle transitions, weighted Go/No-Go decisions, task movements, vault uploads, and 4-tier approvals.
  - Implemented 4 native accessible modal dialogs: [`NewTenderModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/NewTenderModal.tsx), [`UploadDocumentModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/UploadDocumentModal.tsx), [`AddTaskModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/AddTaskModal.tsx), and [`SignOffModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/SignOffModal.tsx).
  - Connected and enhanced all 17 core screens and workspace sub-tabs with live interactivity:
    - **Dashboard**: Live KPI metrics (\$48.5M active, 7 closing this week, missing documents queue, attention triage).
    - **Pipeline Registry**: Search, multi-category and stage filters, batch item selection with bulk stage advance, JSON export.
    - **Proposal Workspace**: 6-gate lifecycle progression bar, scope summary, statutory checklist.
    - **Analysis & Scope**: Interactive sliders for Technical, Financial, Team, and SLA viability with weighted score calculation and formal Go/No-Go decision recording.
    - **Requirements Matrix**: Interactive clause status toggles (`VERIFIED` / `PENDING` / `BLOCKER`) with blocker alert banner and evidence attachment triggers.
    - **Task Kanban**: 4-column board with interactive task progression (`TODO` ➔ `IN_PROGRESS` ➔ `REVIEW` ➔ `DONE`) and task addition.
    - **Document Vault**: 6-folder hierarchy navigation, direct file upload triggers with automatic SHA-256 hash stamping, and one-click checksum clipboard copying.
    - **Review & Sign-Off**: Sequential 4-tier gatekeeper approval enforcement (Tier 4 locked until Tiers 1-3 approved) with digital signature audit log modal.
    - **Submission Ledger**: Electronic portal receipt capture, submission confirmation ID logging, and workspace lock confirmation.
    - **Result Post-Mortem**: Contract award logger and structured loss root-cause taxonomy recording.
    - **My Tasks, Team Allocation, Calendar, Reports, Notifications, Settings, Login**: Live cross-tender task completion, team capacity heatmaps, deadline schedules, category margin analytics, and persona switcher.
  - Production build verified: `npm run build` succeeds cleanly with 0 errors.
- **Relevant Files:**
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/components/modals/*`
  - `frontend/src/pages/*`
  - `frontend/src/pages/tender-tabs/*`

---

### [2026-09-03] — Environment Setup & Documentation Archival
- **Category:** Environment Configuration & Documentation
- **Summary:**
  - Configured frontend environment variables: created [`frontend/.env.example`](file:///h:/Tender%20tracker%20v2/frontend/.env.example) and local [`frontend/.env`](file:///h:/Tender%20tracker%20v2/frontend/.env) pointing to backend API route (`http://localhost:8000/api/v1`).
  - Archived [`project design/implementation_plan.md`](file:///h:/Tender%20tracker%20v2/project%20design/implementation_plan.md) and [`project design/walkthrough.md`](file:///h:/Tender%20tracker%20v2/project%20design/walkthrough.md) directly in version control.
  - Verified host Python 3.13.5 runtime ready for Milestone 2 backend environment scaffolding.
- **Relevant Files:**
  - `frontend/.env.example`, `frontend/.env`
  - `project design/implementation_plan.md`
  - `project design/walkthrough.md`

---

### [2026-09-03] — Milestone 4: Frontend Foundation & Design System Completed
- **Category:** Frontend Architecture & Design System
- **Summary:**
  - Initialized Vite + React 18 + TypeScript in `frontend/` with path aliasing (`@/*`).
  - Configured Tailwind CSS with custom theme matching `DESIGN.md` (Slate Navy `#0F172A`, Surface Light `#F8FAFC`, Plus Jakarta Sans display headers, Inter narrative body, JetBrains Mono monetary/code tokens).
  - Built the responsive App Shell (`AppLayout`, `Sidebar`, `Header`) featuring a collapsible dark navy sidebar (expanded 256px, collapsed 72px) and persistent top masthead with `⌘K` global search and alert ticker.
  - Built Ponytail-optimized core UI primitives: `StatusBadge` (lifecycle stages & Go/No-Go decisions), `UrgencyBadge` (pulsing deadline countdowns), `ReadinessBar` (color-graded progress indicators), and `Card` (Level 1 elevation).
  - Configured React Router hierarchy covering all 17 core screens and proposal workspace sub-tabs.
  - Implemented typed mock pipeline dataset (`$48.5M Net`, 24 active bids, UNDP, World Bank, ADB).
  - Verified production bundling: `npm run build` succeeds cleanly with 0 TypeScript/compilation errors.
- **Relevant Files:**
  - `frontend/src/App.tsx`, `frontend/src/router.tsx`
  - `frontend/src/components/layout/AppLayout.tsx`, `Sidebar.tsx`, `Header.tsx`
  - `frontend/src/components/ui/StatusBadge.tsx`, `UrgencyBadge.tsx`, `ReadinessBar.tsx`, `Card.tsx`
  - `frontend/src/pages/DashboardPage.tsx`, `TenderListPage.tsx`, `TenderDetailPage.tsx`, etc.
  - `frontend/src/mock/tenders.ts`, `frontend/src/types/tender.ts`

---

### [2026-09-03] — Milestone 1: Agent Optimization & GitHub Integration
- **Category:** Infrastructure & AI Tooling
- **Summary:**
  - Integrated **Ponytail** (`.agents/skills/ponytail/SKILL.md`) enforcing the 7-Step Decision Ladder to eliminate code bloat, premature abstractions, and redundant dependencies.
  - Integrated **Graphify** (`.agents/skills/graphify/SKILL.md` and `tools/graphify/graphify.py`), generating initial knowledge graphs (`knowledge_graph.json` and `knowledge_graph.md`) with 39 nodes and 21 architectural relationships.
  - Configured project-wide agent directives in `GEMINI.md` and `AGENTS.md`.
  - Initialized Git on `main` branch, created comprehensive `.gitignore`, and committed baseline design specifications and screen prototypes.
  - Linked local repository to remote GitHub: `https://github.com/akib25889/Tender-tracker-v2.git` and pushed all commits.
- **Relevant Files:**
  - `GEMINI.md`, `AGENTS.md`
  - `.agents/skills/ponytail/SKILL.md`
  - `.agents/skills/graphify/SKILL.md`
  - `tools/graphify/graphify.py`
  - `tools/graphify/knowledge_graph.json`
  - `tools/graphify/knowledge_graph.md`

---

### [2026-09-03] — Milestone 0: Design & Architectural Specifications
- **Category:** Architecture & Product Design
- **Summary:**
  - Defined Executive PRD and 6-gate tender lifecycle framework (`DISCOVERED` ➔ `SCREENING` ➔ `ANALYSIS` ➔ `PREPARATION` ➔ `REVIEW` ➔ `SUBMISSION`).
  - Authored Frontend & UX specification (2,678 lines) detailing the 10-Second Rule, dashboard KPIs, and screen requirements.
  - Authored Backend & Server specification (2,359 lines) defining the FastAPI architecture, MySQL relational schema, RBAC model, local SSD folder vault, and REST contracts.
  - Generated high-fidelity HTML prototypes, icons, web manifest, and design token specification (`DESIGN.md`) for all 17 core screens.
- **Relevant Files:**
  - `project design/tendertracker_command_center_complete_project_prd_brief.md`
  - `project design/Tender Tracker Dashboard – Web Design & Feature Specification.md`
  - `project design/Tender Tracker — Backend & Server Specification.md`
  - `project design/stitch_tender_lifecycle_command_center (2)/...`

---

## 3. Architecture Decision Records (ADR) Summary

- **ADR-001: Local SSD Storage for MVP**  
  *Context:* Small internal team (3–8 users).  
  *Decision:* Store tender documents directly on the server SSD under `storage/tenders/{TDR-ID}/...` with SHA-256 checksums rather than AWS S3 / Cloudflare R2 / MinIO.  
  *Impact:* Eliminates external cloud storage complexity, provides microsecond read latency, and simplifies initial deployment while maintaining a clean abstraction layer for future cloud migration.

- **ADR-002: Decoupled Lifecycle Status vs. Go/No-Go Decision Matrix**  
  *Context:* Traditional systems conflate workflow stage with executive evaluation.  
  *Decision:* Operational stages (`DISCOVERED`, `PREPARATION`, etc.) are tracked separately from governance outcomes (`GO`, `NO-GO`, `CONDITIONAL`, `PENDING`).  
  *Impact:* Eliminates status ambiguity and prevents disqualified tenders from advancing without formal recorded justification.

- **ADR-003: Ponytail & Graphify Dual Optimization Stack**  
  *Context:* AI coding agents tend to over-engineer (generation bloat) and perform repetitive file-tree greps (retrieval bloat).  
  *Decision:* Ponytail sets strict generation guardrails; Graphify maintains pre-indexed project knowledge graphs.  
  *Impact:* Halves token usage, speeds up agent navigation, and ensures clean, minimal, maintainable production code.

- **ADR-004: Dedicated Full-Page Tender Registry Console over Popup Modals**  
  *Context:* Tender intake requires capturing 5 comprehensive tabs of metadata (Classification, SOW, Eligibility, Staffing/Hardware, Dates/Risks). Rendering this in a floating popup modal cluttered the viewport and duplicated navigation.  
  *Decision:* Replaced modal-based intake with a dedicated full-page console at `/registry` ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)). Removed the 1,550-line modal from the application root.  
  *Impact:* Reduced JavaScript bundle by ~47 kB, improved data entry ergonomics, and enabled deep-link editing via `/registry?id={id}`.

- **ADR-005: Universal Operational Collaboration & Clean Procurement Semantics**  
  *Context:* Strict role lockouts impeded team collaboration, and legacy prototype terms like "Post-Mortem" and "Kanban" caused user confusion.  
  *Decision:* Mapped 4 organizational titles (`Business Head`, `Executive Manager`, `Senior Manager`, `Tender Analyst`) with universal operational access; replaced "Kanban" with "Task Board"; replaced "Post-Mortem" with "Outcome & Debrief".  
  *Impact:* Clear, unhindered operational flow with zero permission roadblocks and professional enterprise copy.

---

## 4. Current Application Screen & Route Directory (18 Screens)

| Screen ID | Screen Name | Route | Module |
| :--- | :--- | :--- | :--- |
| `screen:login` | Login - Enterprise Sign In | `/login` | `auth` |
| `screen:dashboard` | Tender Command Center Dashboard | `/dashboard` | `dashboard` |
| `screen:tender_registry` | Tender Registry & Data Entry | `/registry` | `registry` |
| `screen:tenders_list` | Tender List & Pipeline Registry | `/tenders` | `tenders` |
| `screen:bid_discovery` | Bid Discovery Queue (Filtered) | `/tenders?stage=DISCOVERED` | `tenders` |
| `screen:tender_detail` | Tender Detail & Proposal Workspace | `/tenders/{id}` | `tenders` |
| `screen:tender_analysis` | Tender Analysis & Scope Workspace | `/tenders/{id}/analysis` | `analysis` |
| `screen:tender_requirements` | Compliance & Requirements Matrix | `/tenders/{id}/requirements` | `compliance` |
| `screen:tender_tasks` | Tender Task Board | `/tenders/{id}/tasks` | `tasks` |
| `screen:tender_documents` | Tender Document Vault | `/tenders/{id}/documents` | `documents` |
| `screen:tender_review` | Review & Sign-Off Workflow | `/tenders/{id}/review` | `review` |
| `screen:tender_submission` | Submission Ledger | `/tenders/{id}/submission` | `submission` |
| `screen:tender_result` | Outcome & Debrief Ledger | `/tenders/{id}/result` | `result` |
| `screen:my_tasks` | My Tasks - Cross-Tender Console | `/tasks/my-tasks` | `tasks` |
| `screen:team_allocation` | Tender Team & Workload Allocation | `/team` | `team` |
| `screen:calendar` | Tender Calendar & Deadline Schedule | `/calendar` | `calendar` |
| `screen:reports` | Reports & Win/Loss Analytics | `/reports` | `analytics` |
| `screen:notifications` | Notification & Alert Center | `/notifications` | `notifications` |
| `screen:settings` | Settings & System Configuration | `/settings` | `settings` |


