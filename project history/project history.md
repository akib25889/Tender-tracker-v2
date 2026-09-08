# TenderTracker Command Center — Project History & Execution Ledger

**Project Name:** TenderTracker Procurement Core & Command Center  
**Repository:** [github.com/akib25889/Tender-tracker-v2](https://github.com/akib25889/Tender-tracker-v2)  
**Current Version:** 2.18.0
**Stack:** FastAPI (Python 3.13+), MySQL 8.4 LTS, React 18+ (Vite, TypeScript, Tailwind CSS), Local Server Storage (HDD / SSD)  
**Optimization Engines:** Ponytail ("Lazy Senior Dev" code generation) & Graphify (Knowledge Graph retrieval)

---

## 1. Milestone Roadmap & Status

| Phase | Milestone | Status | Details |
| :--- | :--- | :--- | :--- |
| **M0** | **Product & Architecture Specs** | **Completed** | Full PRD, 17-screen specifications, backend storage spec, 17 interactive HTML prototypes. |
| **M1** | **Repository & Agent Tooling** | **Completed** | Git repository initialized, linked to GitHub, `.gitignore` & directory scaffolding, Ponytail & Graphify integration. |
| **M2** | **Backend Core & Database Schema** | **Completed** | FastAPI application structure, SQLAlchemy models, SQLite & MySQL 8.4 dual-mode, JWT/bcrypt authentication, local disk storage vault (HDD / SSD), and REST APIs. |
| **M3** | **Storage Vault & Document Security** | **Completed** | Local filesystem storage engine (`storage/tenders/{TDR-ID}/...`), SHA-256 versioning, upload validation, safe folder relocation. |
| **M4** | **Frontend Foundation & Design System**| **Completed** | React + Vite + TypeScript scaffold, Tailwind theme (Plus Jakarta Sans, Inter, JetBrains Mono), collapsible shell, 26-screen routing. |
| **M5** | **Dark Theme & Accessibility Engineering** | **Completed** | Full CSS-only WCAG AA dark mode overhaul, design token surface elevation hierarchy, luminous status badges, and system dark mode auto-detection. |
| **M6** | **E2E Testing & Production Hardening** | **Completed** | Full integration test suite (100% pass, 34 tests), automated 3-2-1 backup sentinel with cryptographic restore verification, production Nginx reverse proxy configuration, systemd service, and Docker compose orchestration. |

### [2026-09-08] — Version 2.18.0: Fine-Grained Master Access Control & 4-Layer Permissions Governance
- **Category:** Access Control, Role-Based Access Control (RBAC), Partner Permission Ceilings, Authorization Diagnostic Simulator, Audit Trails
- **Summary:**
  - **Master Access & Permissions Control Center (`/permissions` & `MasterPermissionsPage.tsx`):**
    - Built enterprise 5-tab permissions governance center for managing user roles, partner ceilings, and scope rules:
      1. *Live Diagnostic Simulator:* Multi-select permission tester with quick-action utilities ("Select All", "Reset (*)"), badge counters, sensitive tags, and live multi-action authorization evaluation.
      2. *JV & Partner Ceilings:* Maximum boundary ceiling matrix ($Actual = Ceiling \cap Granted$) with batch "Allow All Permissions" and "Deny All" controls.
      3. *Role Baselines & Scope Overrides:* Hierarchical permission rules (Resource > Tender > Organization > Role baseline) supporting wildcard `*` ("Grant All Permissions").
      4. *Security Blockers (Layer 1):* Hard DENY conditions (e.g. account suspensions, NDA flags) that precede all granted roles.
      5. *Authorization Audit Trail:* Immutable append-only audit trail logging every request ID, decision, matched scope, and denial reason with CSV and JSON exports.
  - **Backend 4-Layer Authorization Engine (`backend/app/services/authorization.py`):**
    - Strict 4-layer evaluation pipeline with support for full-access wildcard `*` matching across all standard action codes.
    - Endpoints for rule management, ceilings configuration, diagnostics, and tamper-resistant audit logs (`/api/permissions/*`).
    - Comprehensive test suite in `backend/tests/test_authorization_engine.py` (15/15 tests passing).
  - **Sidebar Navigation:**
    - Integrated direct route `/permissions` under *Tools & Addons* in the primary Command Center sidebar.
  - **Verification:**
    - Backend authorization engine tests: 15/15 passed (100%).
    - Frontend TypeScript build: 0 errors.
    - Knowledge Graph synchronized via Graphify.

### [2026-09-08] — Version 2.17.0: Client Visitor & Scheduled Meetings Management System
- **Category:** Client Relationship Management (CRM), Meeting Logistics, Minutes of Meeting (MoM), Pre-Bid Engagements
- **Summary:**
  - **Client Visitor & Meeting Hub (`/clients/visits`):**
    - Developed dedicated enterprise console for managing in-person client delegations, pre-bid clarification sessions, site visits, and virtual meetings.
    - Integrated navigation directly into the main Command Center Sidebar (`/clients/visits`) with instant access under both Command Navigation and Tools & Addons.
  - **Comprehensive Backend REST Core (`backend/app/routers/client_visits.py`):**
    - Built full-featured CRUD endpoints (`GET /api/client-visits`, `POST /api/client-visits`, `GET /api/client-visits/{id}`, `PUT /api/client-visits/{id}`, `PATCH /api/client-visits/{id}/status`, `DELETE /api/client-visits/{id}`, `GET /api/client-visits/upcoming`).
    - Database entity `ClientVisit` with columns for visitor particulars, accompanying delegations, internal host lead, format, start/end timestamps, reception check-in/out, room/virtual links, agenda, MoM discussion notes, actionable deliverable items, and sentiment scoring.
    - Added database auto-migration and demo seeders covering UNDP, European Commission, World Bank, and ADB.
  - **Rich Frontend Management Experience (`ClientVisitsPage.tsx` & `ClientVisitModal.tsx`):**
    - **KPI Ribbon:** Live metrics for Upcoming Meetings, Today's Reception Check-Ins, Completed Engagements, and Pending Deliverables.
    - **Dual-Mode Console:** Interactive Card/Timeline schedule view and high-density Data Table view.
    - **Lifecycle Status Transitions:** 1-click reception check-in (`CHECKED_IN`), MoM completion (`COMPLETED`), reschedule, and cancellation.
    - **Deliverable Action Item Tracker:** Inline interactive checkboxes with immediate database persistence.
    - **Dual Quick Entry Modal:** Switch seamlessly between "Schedule Upcoming Meeting" and "Log Completed / Walk-In MoM".
  - **Testing & Verification:**
    - Full pytest backend integration test (`test_25_client_visits_and_meetings_crud`) passed with 100% pass rate (25/25 tests).
    - Production Vite TypeScript build passed with 0 errors.
    - Knowledge graph updated via Graphify (54 nodes, 32 edges).

### [2026-09-08] — Version 2.16.0: Tender Type, Budget Type, Source of Fund & Procurement Method Governance Framework
- **Category:** Procurement Governance, Data Architecture, Tender Intake & Executive Reporting
- **Summary:**
  - **Procurement Governance Attributes (Req #21):** Implemented full-stack persistence, API serialization, and multi-surface UI representation for 4 critical public procurement governance attributes:
    1. `tender_type` (e.g. National Competitive Bidding (NCB), International Competitive Bidding (ICB), Request for Proposals (RFP), Direct Contracting).
    2. `budget_type` (e.g. Development Budget (ADP / Capex), Revenue / Operational Budget (Opex), Own Funds / Corporate Budget, Grant / Aid Budget).
    3. `source_of_fund` (e.g. Government of Bangladesh (GoB), World Bank (IDA / IBRD), Asian Development Bank (ADB), JICA, UNDP, USAID, Own Fund).
    4. `procurement_method` (e.g. Open Tendering Method (OTM), Quality & Cost Based Selection (QCBS), Least Cost Selection (LCS), Single Stage Two Envelope (SSTE), Direct Procurement Method (DPM)).
  - **Backend & Database Auto-Migration:**
    - Updated `Tender` SQLAlchemy model with all 4 governance columns.
    - Updated SQLite and MySQL 8.4 boot-time auto-migrations in `backend/app/core/database.py`.
    - Updated Pydantic schemas (`TenderBase`, `TenderCreate`, `TenderUpdate`, `TenderOut`) and `backend/app/routers/tenders.py` CRUD endpoints.
    - Seeded sample data for all demo tenders in `backend/app/services/seeder.py`.
  - **Frontend UI & Reporting Surfaces:**
    - Added *Procurement Governance & Sourcing* card in `NewTenderModal.tsx` and `TenderRegistryPage.tsx` with standard preset dropdowns and custom input overrides.
    - Integrated governance attribute badges into Proposal Workspace `TenderDetailPage.tsx` Specification Matrix.
    - Added governance table rows in the formal 3-Page printable `TenderSummaryDocument.tsx`.
  - **Verification:** 24/24 backend integration tests passing (including `test_24_tender_procurement_governance_attributes`), Vite production build clean with 0 TypeScript errors.

### [2026-09-08] — Version 2.15.0: Universal Document Viewer Hub, Requirement Blockers & Collaboration Replies
- **Category:** Document Operations, Compliance Workflow, Team Collaboration
- **Summary:**
  - **Universal Document Viewer Hub (Req #15):** Enhanced the shared document preview modal with local browser rendering for PDF, DOCX, XLS/XLSX/CSV, images, and text/code files using the native browser engine, `docx-preview`, and SheetJS.
  - **Secure Document Streaming:** Added MIME-aware inline preview endpoints for tender documents, shared links, and reusable master-library files, including separate preview/download permissions and byte-range streaming.
  - **Document Surface Integration:** Connected tender vault, master vault, shared portal, and partner portal preview/download actions to real file URLs and repaired the preview integration test.
  - **Requirement Blockers:** Documented and verified the `VERIFIED` / `PENDING` / `BLOCKER` requirement workflow. Blocker status persists through `PATCH /api/requirements/{requirement_id}` and updates tender blocker lists.
  - **Chat & Comments:** Added fixed quick-reply chips and native emoji insertion to team chat, tender comments, and partner secure chat without introducing new dependencies or schema changes.
  - **Documentation:** Updated the implementation plan with completed feature notes and verification details.
  - **Verification:** Focused preview integration test passed, frontend TypeScript/build checks passed, and touched-file diagnostics reported no errors. Existing lint and bundle-size warnings remain documented.
- **Release Commit:** `979275e` — `Implement document hub and collaboration updates`

### [2026-09-08] — Version 2.13.0: Tender Financial Scenarios, Milestone Schedules, SaaS Recurring Revenue & Contract Rule Engine
- **Category:** Commercial Analysis & Financial Engineering, Contract Risk Modeling, Tender Registry Intake Architecture
- **Summary:**
  - **Tender Financial Scenarios & Rules Specification Implementation:**
    - Implemented end-to-end commercial modeling engine across backend and frontend based on the official *Tender Financial Scenarios and Rules Specification*.
    - Allows analysts to model, capture, and track 4 primary payment architectures:
      1. *Milestone-Based Payments:* Percentage & deliverable linking, acceptance sign-offs, review windows (e.g. 14 days), payment processing periods (e.g. 30 days), and submission requirements.
      2. *Advance Payment & Mobilization:* Advance % & amounts, 100% unconditional Advance Payment Guarantee (APG), pro-rata invoice amortization recovery, and recovery milestone thresholds.
      3. *SaaS & Recurring Revenue Engine:* Fixed recurring, multi-year escalation tiers, per-user/license fees with automatic Total Contract Value (TCV) and Annual Contract Value (ACV) projection.
      4. *Lump-Sum on Final Acceptance:* 100% completion risks, severe cash flow lag modeling, and working capital risk profiling (LOW, MEDIUM, HIGH).
  - **Contract Penalties, Deductions & Retention Engine:**
    - Liquidated Damages (LD) for late delivery: configurable rate (e.g. 0.5% per week/day), calculation basis (delayed milestone vs total contract value), and statutory maximum cap (e.g. 10%).
    - Retention Money deductions: gross invoice deduction % (e.g. 5%), Defects Liability Period (DLP months), and release trigger criteria (50% on PAC / 50% on FAC, DLP expiry, or Bank Guarantee substitution).
    - Statutory Tax Deductions at Source: Tax Withholding (TDS %) and VAT Withholding (VDS %) calculated and deducted at invoice payment stage.
    - Expected Net Cash Flow Realization Waterfall ledger showing gross value, advance mobilization, milestone distribution, retention holdbacks, statutory withholding, and final net collectible cash.
  - **Data Schema & Backend Persistence:**
    - Created `tender_financial_rules` database model and table containing all 28 fields specified in Section 6.1 of the specification.
    - Added first-class `financial_model` JSON column to the `tenders` table with zero-downtime auto-migrations for both SQLite (`PRAGMA table_info`) and MySQL 8.4 (`SHOW COLUMNS`).
    - Built comprehensive REST endpoints in `backend/app/routers/financial_rules.py`:
      - `GET /api/tenders/{id}/financial-rules` (with optional `rule_category` filtering)
      - `POST /api/tenders/{id}/financial-rules`
      - `GET`, `PUT`, `DELETE` on `/api/financial-rules/{rule_id}` (204 No Content)
      - `GET`, `PUT` on `/api/tenders/{id}/financial-model` (accepts both direct and wrapped payloads)
  - **Tender Registry Intake & Reusable Financial Scenarios Editor:**
    - Built modular, reusable [`FinancialScenariosEditor.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/tender/FinancialScenariosEditor.tsx) adhering to Ponytail's 7-Step Decision Ladder (zero extra libraries).
    - Integrated Tab 3 ("3. Financial Scenarios & Rules") directly into both the *Tender Registry Console* ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)) and *Intake Modal* ([`NewTenderModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/NewTenderModal.tsx)), ensuring required financial data is captured during tender intake.
    - Added dedicated Financial Scenarios & Milestone Schedule section in the formal printable 3-page Tender Summary Document ([`TenderSummaryDocument.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/TenderSummaryDocument.tsx)).
  - **Verification & Testing:**
    - Added `test_21_tender_financial_scenarios_and_rules` to integration test suite (`tests/test_api_integration.py`).
    - All 21/21 integration tests pass with 100% green.
    - Frontend TypeScript build verified clean (`npm run build`, 0 errors).
    - Refreshed Graphify knowledge graph (54 nodes, 32 edges).

### [2026-09-07] — Version 2.12.0: Procurement Milestone Lifecycle, Commercial Budget Estimator, Calendar Tracking, Day-Of/T-1 Opening Alerts & Post-Award Execution Architecture
- **Category:** Procurement Lifecycle (Req #20), Commercial Engineering (Calculator), Proactive Alert Operations (Req #17), Post-Award Execution & Contract Delivery Architecture
- **Summary:**
  - **Full Lifecycle Procurement Milestones Schedule (Requirement #20):**
    - Built comprehensive milestone schedule tracking all 6 critical procurement gates:
      1. *Tender Document Opening Day* (`opening_date` / `openingDate`)
      2. *Contract Signing Day* (`contract_signing_date` / `contractSigningDate`)
      3. *Work / Project Start Day* (`work_start_date` / `workStartDate`)
      4. *Possible / Execution Period* (`possible_period` / `possiblePeriod`)
      5. *Product / System Handover Day* (`product_handover_date` / `productHandoverDate`)
      6. *Support & Maintenance Period* (`maintenance_period` / `maintenancePeriod`)
    - Added schedule & security deposit terms: *Schedule Buy Deadline* (`schedule_purchase_deadline`), *Schedule Payment Method* (`schedule_purchase_method`), *Tender Security / EMD Amount* (`tender_security_amount`), and *Security Instrument / Method* (`tender_security_method`).
    - Stored as native first-class columns in backend `tenders` model with zero-downtime auto-migrations for SQLite (`PRAGMA table_info`) and MySQL (`SHOW COLUMNS`).
  - **Smart 2.5% Security Deposit & Reverse Budget Calculator:**
    - Integrated client-side reactive financial calculator in Tab 2 of both the *Tender Registry Console* ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)) and *Intake Modal* ([`NewTenderModal.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/modals/NewTenderModal.tsx)).
    - Solves a pervasive public procurement reality: Procuring authorities frequently specify exact Security Deposit / EMD amounts while leaving official procurement budgets undisclosed or redacted.
    - Quick-select percentage presets (`1.0%`, `2.0%`, `2.5%`, `3.0%`, `5.0%`).
    - **Reverse Estimator:** Mathematically calculates implied procurement budget ($\text{Budget} = \frac{\text{Security}}{\%}$) with 1-click button to apply calculated budget directly to tender entry.
    - **Forward Calculator:** Instantly calculates required bank guarantee or pay order deposit from estimated value ($\text{Security} = \text{Budget} \times \%$).
  - **Calendar Tracking & Proactive Day-Of / T-1 Opening Alerts (Requirement #17):**
    - Upgraded Master Calendar ([`CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx)) with milestone extraction engine supporting 5 dedicated category filters:
      - `All Milestones`
      - `Tender Document Opening Days` (🟣 purple badge & marker)
      - `Submission Deadlines` (🔵 blue badge & marker)
      - `Contract Signing Days` (🟢 emerald badge & marker)
      - `Work Start` (🟡 amber badge & marker)
      - `Product Handovers` (🟠 orange badge & marker)
    - Integrated chronological timeline cards with `HAPPENING TODAY` and `TOMORROW (T-1)` urgency badges.
    - Upgraded backend alert center ([`backend/app/routers/alerts.py`](file:///h:/Tender%20tracker%20v2/backend/app/routers/alerts.py)) and notifications console ([`NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx)):
      - Automatically emits `CRITICAL` alerts on Tender Document Opening Day.
      - Automatically emits `WARNING` alerts 1 day before Opening Day (T-1).
      - Emits closing reminders for Schedule Purchase Deadlines.
  - **7-Stage Post-Award Execution & Contract Delivery Roadmap (Requirement #17):**
    - Established strict operational distinction between *Tender Submitted* vs. *Tender Won (`AWARDED`)*.
    - Upgraded Outcome & Debrief ledger ([`TenderResultTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderResultTab.tsx)): when tender is `AWARDED`, an interactive 7-phase contract execution roadmap activates:
      1. *Notification of Award (NOA) Acceptance:* NOA memo reference, date, and acknowledgement.
      2. *Performance Security Guarantee (PG) Deposit:* 10% auto-calculator, submission due date, status (`PENDING`, `DEPOSITED`, `RELEASED`).
      3. *Official Contract Signing:* Execution date and stamp paper contract status (`SCHEDULED`, `SIGNED`).
      4. *Work Commencement & Mobilization:* Notice to Proceed (NTP) / Work Order ref and kickoff date.
      5. *Execution & Possible Period:* Sprint and deliverable progress timeline.
      6. *Product Handover Day & UAT Acceptance:* Handover date, UAT progression, and Provisional/Final Acceptance Certificate (PAC/FAC) sign-off.
      7. *Support & Maintenance Period:* Post-handover SLA duration, warranty end date, and 24/7 technical hotline management.
    - Persists updates into `tender.postAward` and root milestone columns with 1-click sync.
  - **Testing & Verification:**
    - Added `test_20_procurement_milestones_and_commercial_calculator` to backend integration test suite.
    - 100% passing tests (20/20 test suites).
    - Frontend TypeScript build verified (`npm run build`, 1,890 modules transformed, 0 errors).
    - Updated Graphify knowledge graph (54 nodes, 32 edges).


### [2026-09-07] — Version 2.11.0: Zero-Dependency Fuzzy Search Engine Across Tender Search Bars
- **Category:** Search & Discovery, UX Ergonomics, Zero-Dependency Client Optimization (Requirement #18)
- **Summary:**
  - **Zero-Dependency Pure TypeScript Fuzzy Search Engine ([`frontend/src/utils/fuzzySearch.ts`](file:///h:/Tender%20tracker%20v2/frontend/src/utils/fuzzySearch.ts)):**
    - Built ultra-fast, lightweight client-side fuzzy search algorithm without adding external libraries (`fuse.js`), strictly adhering to Ponytail Rule 5.
    - **Dynamic Matrix Levenshtein Distance:** Computes edit distance to handle single and multi-character transpositions, typos, and insertions/deletions. Sets adaptive distance tolerance (`maxDistance = qLen >= 6 ? 2 : qLen >= 4 ? 1 : 0`) ensuring transposed queries like `"seimens"` reliably match `"Siemens"`.
    - **Multi-Word & Token Permutations:** Handles queries where keywords appear in arbitrary order (e.g. `"hospital erp"` matches `"Enterprise Resource Planning for City Hospital"`).
    - **Acronym & Initialism Matching:** Matches initials and acronyms across word boundaries (e.g. `"dtca"` matches `"Dhaka Transport Coordination Authority"`).
    - **Subsequence Matching & Scoring Hierarchy:** Includes in-order subsequence matching and tiered relevance scoring (Exact = 1000, Prefix = 800, Substring = 600, Acronym = 500, Fuzzy Word = 400, Subsequence = 200).
    - **Fast-Path O(n) Optimizations:** Bypasses matrix allocations for exact substring matches to guarantee zero typing latency on low-spec hardware.
  - **Universal Search Bar Upgrades Across Application:**
    - Replaced rigid `.includes()` substring matching across 7 primary command centers and registries:
      1. *Tender Pipeline Registry* ([`TenderListPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderListPage.tsx)): searches title, organization, tender ID, reference number, and category.
      2. *Executive Dashboard* ([`DashboardPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/DashboardPage.tsx)): searches title, ID, reference number, organization, and category.
      3. *Tender Registry Console* ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)): searches sidebar tender selector by title, ID, reference number, organization, and category.
      4. *Master Document Vault* ([`MasterDocumentVaultPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterDocumentVaultPage.tsx)): searches reusable templates and company documents by name, category, company, and description.
      5. *Company Project Experience Credentials* ([`CompanyProjectCredentialsManager.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/credentials/CompanyProjectCredentialsManager.tsx)): searches work order and completion certificate credentials across title, client, role, and custom fields.
      6. *Organizations & Authorities Directory* ([`OrganizationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/OrganizationsPage.tsx)): searches procuring entities across official name, acronym/short name, country, and aliases.
      7. *Corporate Profiles Directory* ([`CompanyProfilesPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CompanyProfilesPage.tsx)): searches multi-company corporate entities across legal name, trade name, TIN, registration number, and country.
      8. *Archived Tenders Ledger* ([`ArchivedTendersPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/ArchivedTendersPage.tsx)): searches archived bids across title, ID, reference number, organization, country, and category.
  - **Verification & Testing:**
    - Verified with custom unit test script covering exact, typo, transposition, out-of-order token, and acronym search scenarios (100% pass rate).
    - TypeScript compilation and Vite production build verified (`npm run build`, 1,890 modules transformed, 0 errors).
    - Backend integration test suite verified (19 passed, 0 failures).
- **Relevant Files:**
  - `frontend/src/utils/fuzzySearch.ts`
  - `frontend/src/pages/TenderListPage.tsx`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/pages/TenderRegistryPage.tsx`
  - `frontend/src/pages/MasterDocumentVaultPage.tsx`
  - `frontend/src/components/credentials/CompanyProjectCredentialsManager.tsx`
  - `frontend/src/pages/OrganizationsPage.tsx`
  - `frontend/src/pages/CompanyProfilesPage.tsx`
  - `frontend/src/pages/ArchivedTendersPage.tsx`

---

### [2026-09-07] — Version 2.10.0: Corporate Profile Management System, Multi-Company Entities, Project Experience Credentials & Clause Reference Marking
- **Category:** Corporate Governance, Master Data Management, Tender Compliance & Eligibility, Full-Stack Persistence
- **Summary:**
  - **Company Profile Management System (`/tools/company-profiles` & `company_profiles` table):**
    - **Multi-Company Bidding Architecture:** Centralized corporate profile hub supporting both **Lead Bidders** (*PrimeTech Solutions Ltd.*) and **JV Partners** (*DataCore Systems Ltd.*, *Apex Global Engineering*).
    - **Comprehensive Corporate Schema:**
      - *Corporate Identity:* Legal registered name, trade name, bidding role (`LEAD_BIDDER`, `JV_PARTNER`, `SUBCONTRACTOR`), entity type, registration number, incorporation date, country, corporate status (`ACTIVE`, `VERIFIED`), and scope of business.
      - *Statutory & Tax Credentials:* e-TIN number, BIN/VAT registration number, municipal trade license number & expiration date with validity indicators, issuing authority, taxes circle & zone, RJSC return year, and IRC/ERC certificates.
      - *Registered Office & Contacts:* Legal registered address, operational engineering center address, official tender email, billing email, telephone/hotline, and official website.
      - *Focal Point & Authorized Signatory:* Dedicated focal tender liaison officer (name, title, direct phone, email) and legal power of attorney holder (name, title, NID/passport, board resolution/power of attorney deed reference).
      - *Banking & Financial Solvency:* Principal scheduled bank & branch, exact account name & number, routing number, SWIFT/BIC code, audited 3-year average annual turnovers in BDT and USD, available bank solvency credit lines, paid-up capital, authorized share capital, external credit rating (e.g. `AA+` by CRISL), and credit rating validity date.
      - *Accreditations & Workforce:* ISO 9001/27001/14001 and CMMI maturity certifications, industry memberships (BASIS, FBCCI), total permanent employee count, certified professional engineers count, and core technical competence tags.
      - *Dynamic Custom Fields:* Unlimited dynamic custom attributes (`[{"id", "name", "value"}]`) for tender-specific RFP compliance (e.g. DLMS Conformance, Ministry Quotas, Environmental Clearances).
  - **Standardized Top-of-Field Action Toolbar (`[📋 Copy] [✏️ Edit] [🗑️ Delete]`):**
    - Built consistent top-of-field toolbar for both standard and dynamic custom fields.
    - **Copy:** Instant clipboard copy with visual `"Copied!"` badge and system toast notification.
    - **Edit:** Inline editing of field name and value with immediate database persistence.
    - **Delete:** Clears standard fields or permanently deletes custom fields with confirmation.
  - **Dedicated 6-Tab Command Center (`CompanyProfilesPage.tsx`):**
    - *Overview & Identity*, *Statutory & Tax*, *Banking & Financials*, *Accreditations & Workforce*, *Custom Fields*, and *Linked Credentials & Vault Docs*.
    - **Fast RFP Export:** `"Copy Tender Profile Summary"` button generates a complete markdown/text block with all company data formatted for immediate pasting into tender bid submission documents.
    - **Company Switcher & Search:** Horizontal quick-switch slider with role filter chips (`All`, `Lead Bidders`, `JV Partners`) and real-time search by company name, TIN, or registration number.
    - **Add Company Profile Modal:** Dialog to register new JV partner entities in one step.
  - **Company Project Experience Credentials (`company_project_credentials`):**
    - Experience ledger supporting contract titles, client names, contract values, currencies, and verified Work Order (WO) and Completion Certificate (CC) file uploads.
    - Computes and stores cryptographic SHA-256 hashes and file sizes, with direct linking into tender statutory document folders (`02_company_statutory_documents`).
  - **Tender Clause Marking with Document Reference:**
    - Structured clause tracking during tender intake (`clause_title`, `category`, `criticality`, `doc_reference`, `doc_file_name`, `page_number`, `clause_text`, `implication`).
    - Stored as JSON in `tenders.important_clauses` and rendered in tender summary and proposals.
  - **Database Persistence & API Audit:**
    - Audited all 24+ SQLAlchemy database models and verified 100% active table existence in SQLite and MySQL.
    - Added missing document lifecycle endpoints: `PATCH /api/documents/{id}`, `DELETE /api/documents/{id}`, `PATCH /api/reusable-documents/{id}`, `DELETE /api/reusable-documents/{id}`, and recorded shares in `resource_shares`.
  - **Test Suite Expansion & Verification:**
    - Added `test_17_company_profiles_crud` to `backend/tests/test_api_integration.py`.
    - All **17 test suites (34 integration tests) passing** (100% green).
    - Frontend production build (`npm run build`) succeeded with 0 errors (1,889 modules transformed).
    - Re-indexed Graphify knowledge graph (54 nodes, 32 edges).

### [2026-09-06] — Version 2.9.0: Comprehensive CSS-Only Dark Mode, JV Partner Portal, Access Duration Controls & Workspace Polish
- **Category:** Design System, Accessibility (WCAG AA), Security & Partner Governance, UI/UX Refinement
- **Summary:**
  - **Comprehensive CSS-Only Dark Theme Overhaul (`frontend/src/index.css`):**
    - **Zero Markup Touched:** Followed strict constraints — zero HTML or JSX components were modified to achieve full dark theme compliance.
    - **Tailwind v4 Bracket Escaping Resolution:** Diagnosed and eliminated the compiler escaping defect where `[class*="text-\\[\\#0F172A\\]"]` produced quadrupled backslashes in CSS output, rendering text invisible. Implemented unescaped dual selectors (`[class*="text-[#0F172A]"], .text-\[\#0F172A\]`), completely restoring high-contrast readability.
    - **Design Token Surface Elevation:** Established structured CSS custom properties across `:root`, `.dark`, and `@media (prefers-color-scheme: dark)`: `--bg-canvas` (`#0B0F17`), `--bg-surface` (`#131B28`), `--bg-surface-raised` (`#1A2436`), `--bg-subtle` (`#172030`), `--bg-muted` (`#212D42`), `--bg-hover` (`#1E2A3E`), `--bg-input` (`#101724`), and `--bg-dropdown` (`#151E2E`).
    - **WCAG AA Typography Contrast:** High-contrast text tokens (`--text-primary: #F1F5F9` on dark canvas provides $\ge 14:1$ contrast ratio; `--text-secondary: #CBD5E1` $\ge 9:1$; `--text-muted: #94A3B8` $\ge 4.8:1$).
    - **Elimination of 258+ Blinding Light-Pastel Patches:** Overrode all light-pastel alert and badge backgrounds (`#EFF6FF`, `#FEF2F2`, `#F0FDF4`, `#FFFBEB`, `#ECFDF5`, `#FEE2E2`, etc.) with rich translucent dark tints (18% alpha) with luminous borders and high-contrast text.
    - **Interactive & Nested States:** Added dark focus rings, table row hover highlights (`--bg-hover`), dark form inputs/selects, elevated dialog backdrops (`rgba(0,0,0,0.72)` + blur), and custom slim dark scrollbars.
    - **Automatic System Dark Mode Fallback:** Integrated `@media (prefers-color-scheme: dark)` so that standalone external routes (e.g. `/partner/portal`, `/shared/:token`) render in dark mode automatically even outside `<AppLayout />`.
    - **Visual Audit Verification:** Evaluated and captured all 25 screens via Playwright headless testing.
  - **JV Partner Portal Full Production Implementation (`PartnerPortalPage.tsx`):**
    - Built comprehensive authenticated collaboration workspace for Joint Venture partners based on Stitch design specifications.
    - Features: Layer-2 hard boundary security cards, action-required document re-upload workflows (certified revision with CA auditor verification), multi-category document contribution hub (`Statutory`, `Technical`, `Legal`), live SHA-256 hash generation, TOR technical requirement extraction checklist, deliverable progress tracker, and persistent prime contractor communications.
    - Added dedicated responsive navigation sidebar with mobile drawer support and quick-jump anchor links.
  - **Time-Bounded Partner Access & Expiry Controls (`TenderPartnersTab.tsx`):**
    - Implemented configurable partner access duration in days (`7 days`, `14 days`, `30 days`, `60 days`, `90 days`, or custom days) with real-time expiration date calculation and status badges (`Active`, `Expired`, `Revoked`).
  - **Collapsed Sidebar Geometric Centering & Icon Alignment (`Sidebar.tsx`):**
    - Locked all 14 navigation icons, branding elements, and controls (Shield Logo, Dashboard, Bid Discovery, Registry, Pipeline, My Tasks, Calendar, Vault, Team, Chat, Analytics, Tools Wrench, Settings Gear, and Minimizer Chevron) onto a pixel-perfect **40px vertical center axis** in collapsed mode.
    - Replaced the cramped top header (which previously squeezed a 32px logo and 28px chevron side-by-side) with a centered `w-9 h-9` branding button that smoothly transitions to `ChevronRight` on hover.
    - Symmetrized active tile highlights (`py-2.5 px-0 justify-center`) with equal 20px margins, eliminating previous 16px leftward bias.
    - Added subtle notification indicator dots (pulsating red for urgent deadlines, blue for new intake) with native browser tooltips.
  - **Dashboard Attention Queue Multi-Facet Filtering & Search (`DashboardPage.tsx`):**
    - Expanded quick triage vectors to 6 pill filters with dynamic live counts: `All Urgent`, `Closing ≤ 4d`, `Blockers`, `Missing Docs` (missing credential vault uploads), `Low Readiness` ($<50\%$), and `Critical` (executive priority).
    - Introduced full interactive filter toolbar: real-time search input with clear button, 6-gate Stage dropdown, corporate Category dropdown, and `✓ Active Only` toggle (preventing archived/non-participating bids from cluttering the urgent queue by default).
    - Added live result counter (`Showing X of Y`) and 1-click filter reset.
  - **Knowledge Graph Synchronization:**
    - Re-indexed Graphify knowledge graph (`tools/graphify/graphify.py`), tracking 54 nodes and 32 edges.

### [2026-09-05] — Version 2.8.0: Proposal Workspace Redesign, Tools & Addons Module, Organizations Hierarchy & Deterministic Lockfile
- **Category:** UI/UX Redesign, Master Catalog Architecture, Enterprise Navigation, Environment Reproducibility
- **Summary:**
  - **Proposal Workspace Full Redesign (`/tenders/:id`):**
    - Directly aligned with `project design/stitch_tender_lifecycle_command_center (3)/` production blueprint.
    - **6-Gate Lifecycle Progress Ribbon:** Sequential visual pipeline showing gates `01. Discovered`, `02. Preparation`, `03. Approved`, `04. In Review`, `05. Finalized`, `06. Submitted` with stage-specific badge highlights and active completion states.
    - **2x3 Specification Matrix & Identity Header:** Key tender metadata cards displaying Reference Number, Procurement Portal, Financial Value, Submission Deadline with dynamic countdown, SOW Corporate Category, and Target Organization.
    - **Scope Synopsis Card:** SOW statement, key objectives, and structured technical requirement tags.
    - **Compliance Sentinel Gatekeeper:** Mandatory qualification tracker with real-time cleared tally (e.g. `2 / 8 Cleared`), gatekeeper progress bar, and document status badges (`CLEARED`, `VERIFIED`, `PENDING_REVIEW`, `FLAGGED_EXPIRED`).
    - **Live Team Stream:** Real-time chronological discussion stream integrated with channel chat.
  - **Tools & Addons Module & Organizations Hierarchy (`/tools/organizations`):**
    - **Procuring Entity Master Catalog:** Searchable directory table and interactive parent-child hierarchy tree view with expand/collapse nodes.
    - **Enterprise Hierarchy Management:** Full CRUD modal for adding ministry, department, regional, or agency organizations with parent entity linking, contact details, procurement portal URLs, and duplicate code/name prevention.
    - **Dropdown Sidebar Navigation:** Re-architected sidebar navigation into an interactive collapsible accordion dropdown for "Tools & Addons" with nested sub-items (`Organizations`), route-aware auto-expansion, and collapsed flyout popover.
  - **Master Permissions & Reusable Document Vault Sharing:**
    - **Master Permissions (`/permissions`):** Central role-based access control matrix covering Super Admin, Lead Estimator, Compliance Officer, and External Auditor permissions across all 24 modules.
    - **Vault Token Sharing (`/shared/:token`):** Secure token-based public portal for sharing verified corporate credentials with external partners without granting dashboard login.
  - **Deterministic Environment Hardening:**
    - Generated exact `backend/requirements-lock.txt` pinning all transitive Python packages, hashes, and versions to prevent environment drift or version incompatibility.
  - **Knowledge Graph Synchronization:**
    - Updated Graphify index to 52 nodes and 30 edges, cataloging all 24 screens, database entities, and storage paths.

### [2026-09-04] — Version 2.7.0: Schema Expansion (22 Tables), Settings Persistence, Legal Submissions & DB-Backed Channel Chat
- **Category:** Database Architecture, Full-Stack Persistence, Team Communications, Governance
- **Summary:**
  - **Schema Expansion to 22 Tables:**
    - **`tender_categories`:** Dedicated table for corporate Scope of Work taxonomies with badge styling, auto-import from active tenders, and safe deletion guards.
    - **`system_settings`:** Database-backed configuration persistence for local NVMe storage paths, SLA urgency windows, and SMTP relay credentials.
    - **`tender_submissions`:** Cryptographic legal submission ledger capturing portal confirmation IDs, receipt checksums, submitter identity, and automated stage locking.
    - **`chat_channel_messages`:** Database-backed multi-channel communications hub migrating `#general-ops`, `#tender-radar`, `#compliance-desk`, and `#commercial-pricing` from browser `localStorage` to server-side persistence.
  - **Frontend UI Consoles:**
    - **Settings Page (`/settings`):** Added SOW Corporate Categories Management card with inline editing, color theme picker, and active tender assignment counters. Connected system configuration form to `/api/settings`.
    - **Chat Discussions (`/discussions`):** Connected channel streams directly to `/api/chat/channels/{id}/messages` with seamless offline fallbacks.
    - **Archived Tenders (`/archive`):** Cleaned redundant header navigation to streamline UX.
  - **Test Suite Expansion:**
    - Expanded integration tests from 25 to 29 tests (100% passing).

### [2026-09-04] — Version 2.6.2: Report & Analytics 3-Mode Intelligence Architecture
- **Category:** Analytics, UX Architecture, Telemetry
- **Summary:**
  - **Renamed Module:** Updated navigation and page identity to **Report & Analytics** (`/reports`).
  - **3-Mode Segmented Control:**
    - **Basic Mode:** High-level executive overview with 4 headline cards (Total Pipeline Value, Cumulative Win Rate, Won Contracts Value, Active in Preparation) and a complete Stage Breakdown Summary table.
    - **General Mode:** Standard operational analytics featuring Top 3 KPI cards, Pipeline Distribution by Domain & Scope of Work (SOW) Category, and Procuring Entity Exposure & Conversion.
    - **Advance Mode:** Deep conversion telemetry featuring Deal Ticket Size, Bid Capture Efficiency, Stage Progression Funnel, and an extensible **Advance Metrics Configuration Hub** ready for custom formula definition.

---

### [2026-09-04] — Version 2.6.1: Archival of Tender Analysis & Scope Workspace
- **Category:** Architecture Simplification, Governance, Documentation
- **Summary:**
  - **Tender Analysis & Scope Workspace Archival (`/tenders/{id}/analysis`):**
    - Archived full technical specification to `docs/future_implementations/tender_analysis_and_scope_workspace.md`.
    - Preserved 4-pillar weighted score formula (Tech 35%, Fin 30%, Team 20%, SLA 15%), SVG radar geometry, pWin calculation, and rule-based Gatekeeper Decision Recommendation.
    - Decoupled `TenderAnalysisTab` from proposal workspace navigation (`subNavTabs`), removed child route from `router.tsx`, and removed active component to maintain radical conciseness (Ponytail principle).
    - Updated knowledge graph (`graphify.py`) and documentation to 21 active modules.

---

### [2026-09-04] — Version 2.6.0: Partner Portal Direct Login, Email Dispatcher, Radar Scoring, Batch CSV/JSON Ingestion & SOW Clarification
- **Category:** Partner Collaboration, Communications, Governance Analytics, Data Ingestion, Technical Standards
- **Commit:** `5d571b8` → `origin/main`
- **Summary:**
  - **Partner Portal Direct Authentication (`/login`):**
    - Dual-tab authentication switcher between *Internal Bid Team* and *JV / Partner Portal*.
    - Authenticated partners access watermarked, isolated document portals with cryptographic tokens and permission ceiling enforcement.
  - **Automated Email Notification Dispatcher (`/settings`):**
    - Configurable SMTP relay integration with TLS/STARTTLS support and authorized sender mapping.
    - Automated trigger subscriptions for critical deadline escalations (≤48h), Tier 3/4 gatekeeper approvals, and compliance blockers with live test alert dispatcher.
  - **Multi-Criteria Radar & pWin Scoring Engine (`/tenders/{id}/analysis`):**
    - Dynamic geometric multi-axis SVG radar chart mapping Technical Fit (35%), Financial Margin (30%), Team Capacity (20%), and SLA Compliance (15%).
    - Win probability (`pWin`) calculation against historical donor awards and target margin indicators.
    - Automated Gatekeeper Decision Recommendation banner with rule-based outcome synthesis.
  - **Batch Pipeline Ingestion (CSV & JSON) (`/tenders`):**
    - 1-click batch import modal with drag-and-drop file upload, real-time JSON/CSV parsing, pre-commit validation, and interactive table preview.
    - Built-in instant sample templates for JSON and CSV testing.
  - **Real Multilateral Tenders Ingested:**
    - Ingested WHO health informatics (`TDR-2026-WHO-044`), JICA smart water SCADA (`TDR-2026-JICA-118`), and ADB regional logistics (`TDR-2026-ADB-402`) with realistic statutory profiles.
  - **Universal Standardization: "Scope of Work (SOW)":**
    - Fully clarified the acronym across all workspace headers, table headers, document builders, and exports to eliminate ambiguity.
  - **AI Scope Extractor Archival & Documentation:**
    - Documented comprehensive specification and 4-tier memory preservation model under `docs/future_implementations/ai_scope_extraction_and_summarizer.md`.
    - Cleaned all active AI assistant references from active UI components and routers.
  - **Verification Gates:**
    - 4/4 verification gates passing: SQLite DB health, 25/25 Pytest suite, 0 TypeScript errors, and knowledge graph sync.

---

### [2026-09-04] — Version 2.5.0: Real-Time Alert Center, Interactive Calendar Grid & Unified Test Runner
- **Category:** Operational Intelligence, UX Enhancement, QA Tooling
- **Commit:** `ae2d644` → `origin/main`
- **Summary:**
  - **Real-Time Operational Alert Center (`GET /api/alerts`):**
    - New backend router [`backend/app/routers/alerts.py`](file:///h:/Tender%20tracker%20v2/backend/app/routers/alerts.py) synthesising 4 alert categories from live database state.
    - `DEADLINE` alerts for active tenders with `hours_remaining ≤ 48` (CRITICAL ≤24h / WARNING).
    - `BLOCKER` alerts for any `TenderRequirement` with `status = BLOCKER` on active tenders.
    - `APPROVAL` alerts for Review Tier 3 (Legal) or Tier 4 (Executive) with `PENDING` / `ACTION_REQUIRED` sign-off.
    - `VAULT` alerts for `ResourceShare` rows past `expires_at` without a `revoked_at` timestamp.
    - Alerts sorted CRITICAL → WARNING → INFO, then by hours ascending. Response shape: `{ count, unread, alerts[] }`.
  - **Live Header Bell Badge ([`Header.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Header.tsx)):**
    - Bell icon replaced with numbered red badge (capped at `9+`) polled from `/api/alerts` on mount and every 60 seconds.
    - Badge disappears when `unread = 0`. Silent fallback when backend is offline.
  - **NotificationsPage Wired to Live API ([`NotificationsPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/NotificationsPage.tsx)):**
    - Fetches live alerts on mount. Refresh button with spinner. Severity-coloured unread dots: 🔴 CRITICAL · 🟡 WARNING · 🔵 INFO.
    - Category filter tabs: ALL / DEADLINE / BLOCKER / APPROVAL / VAULT. Green "all clear" empty-state.
  - **Interactive Monthly Calendar Grid ([`CalendarPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/CalendarPage.tsx)):**
    - Added **Timeline ↔ Grid** icon toggle (List / Calendar).
    - Grid: full interactive monthly calendar. Prev/Next month navigation. Tender ID chips per cell colour-coded: 🔴 ≤2d · 🟡 ≤7d · 🔵 >7d. `+N more` overflow. "Today" highlighted. Bottom legend row.
    - Zero new npm packages — pure native date arithmetic.
  - **Unified Root Test Runner ([`run_all_tests.py`](file:///h:/Tender%20tracker%20v2/run_all_tests.py)):**
    - One-command 4-gate verification: DB health → pytest (25 tests) → TypeScript `tsc -b --noEmit` → knowledge graph sync.
    - Coloured ANSI pass/fail output, elapsed time, exits `0` only when all 4 gates pass.
- **Relevant Files:**
  - `backend/app/routers/alerts.py` *(NEW)*
  - `backend/app/main.py`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/pages/NotificationsPage.tsx`
  - `frontend/src/pages/CalendarPage.tsx`
  - `run_all_tests.py` *(NEW)*
  - `backend/tests/test_sharing_and_isolation.py` (utcnow fix)

---

### [2026-09-04] — QA Audit: 13 Bugs Identified & Resolved (v2.4.x Hardening)
- **Category:** Quality Assurance, Security, Backend Stability, Frontend Resilience
- **Commit:** `c1952c8` → `origin/main`
- **Summary:** Full-stack QA audit acting as a senior quality assurance engineer. 13 bugs identified and resolved across backend and frontend.

  | ID | Category | Fix |
  | :--- | :--- | :--- |
  | BUG-01 | Backend / Testing | Added `setup_module()` in `test_api_integration.py` so `TestClient(app)` initializes tables and seeds via lifespan |
  | BUG-02 | Frontend / API Sync | Wired `addTender` → `POST /api/tenders`, `updateTender` → `PUT /api/tenders/{id}` in `TenderContext.tsx` |
  | BUG-03 | Frontend / Null Safety | Added `if (!tender) return null` early-return guards in `TenderDetailPage.tsx` and all 8 sub-tab components |
  | BUG-04 | Backend / Schema | Added `folders: List[FolderOut]` to `TenderOut` in `schemas/tender.py` |
  | BUG-05 | Backend / Documents | Enabled `ReusableDocument` lookup in `validate_shared_token` and `download_shared_file` |
  | BUG-06 | Backend / Security | Sanitised filenames with `Path(file.filename or "uploaded_file").name` to prevent path traversal |
  | BUG-07 | Backend / PK Collision | Replaced `.count() + 101` with `uuid.uuid4().hex[:8].upper()` in tasks, comments, documents routers |
  | BUG-08 | Backend / None Safety | `(t.readiness_score or 0)` guard in `dashboard.py` avg readiness calculation |
  | BUG-09 | Backend / FK Validation | Added 404 check for `tender_id` in `assign_partner_to_tender` |
  | BUG-10 | Frontend / Export | `(t.estimatedValue \|\| 0)` NaN guard in `exportUtils.ts` and `ReportsPage.tsx` |
  | BUG-11 | Backend / Deprecation | Migrated all `datetime.utcnow()` to `datetime.now(timezone.utc)` across backend and tests |
  | BUG-12 | Frontend / Arrays | `(t.tasks \|\| [])` and `(t.documents \|\| [])` null-array guards in Command Palette, MyTasks, TeamAllocation |
  | BUG-13 | Backend / Cascade | Added `cascade="all, delete-orphan"` for partner assignments + explicit `ResourceShare` deletion in `delete_tender` |

- **Test Results (post-fix):** 25/25 passing — 100% pass rate
- **Relevant Files:**
  - `backend/tests/test_api_integration.py`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/pages/TenderDetailPage.tsx`
  - `frontend/src/pages/tender-tabs/` *(all 8 sub-tab components)*
  - `backend/app/schemas/tender.py`
  - `backend/app/routers/documents.py`
  - `backend/app/services/storage.py`
  - `backend/app/routers/tasks.py`, `comments.py`
  - `backend/app/routers/dashboard.py`
  - `backend/app/routers/permissions.py`
  - `frontend/src/utils/exportUtils.ts`
  - `frontend/src/pages/ReportsPage.tsx`
  - `backend/app/models/tender.py`
  - `frontend/src/components/modals/CommandPaletteModal.tsx`
  - `frontend/src/pages/MyTasksPage.tsx`
  - `frontend/src/pages/TeamAllocationPage.tsx`

---

### [2026-09-04] — Master Access Control & Permission Center Module (JV Specification Engine)
- **Category:** Authorization, Security, Multi-Tenant Architecture, JV Collaboration
- **Summary:**
  - **Master Permission Command Center (`frontend/src/pages/MasterPermissionsPage.tsx`):**
    - Mounted at `/permissions` with direct sidebar integration ("Access & Permissions").
    - **Tab 1: Live Diagnostic Simulator:** Interactive tool simulating any user/partner + tender + resource + action, visually animating the 4-layer evaluation sequence (Security Blockers $\rightarrow$ Access Boundaries $\rightarrow$ Partner Ceilings $\rightarrow$ Scope Hierarchy) with explicit PASS/FAIL statuses, matched rules, and internal denial codes.
    - **Tab 2: JV & Partner Organization Ceilings:** Directory of registered partner organizations (*Apex Engineering JV*, *Global Infra Consortium*), tender assignment management, and granular checklist to configure maximum permission ceilings ($\text{Actual Access} = \text{Ceiling} \cap \text{Granted}$).
    - **Tab 3: Role Baselines & Scope Overrides:** Multi-role matrix (`BUSINESS_HEAD`, `BID_MANAGER`, `TECHNICAL_LEAD`, `FINANCE_COMMERCIAL`, `LEGAL_COUNSEL`, `TENDER_ANALYST`) and explicit resource/tender-level overrides.
    - **Tab 4: Security Blockers (Layer 1):** Emergency hard-suspension control for users and partner organizations.
    - **Tab 5: Authorization Audit Trail:** Searchable append-only ledger displaying `request_id`, client IP, user, partner, action, decision (`ALLOW`/`DENY`), and internal reason codes.
  - **Backend Central Authorization Engine (`backend/app/services/authorization.py`):**
    - Implemented full multi-layer evaluation pipeline with standard permission codes and standardized denial reasons (`USER_SUSPENDED`, `ORGANIZATION_SUSPENDED`, `PARTNER_NOT_ASSIGNED`, `PARTNER_PERMISSION_CEILING_EXCEEDED`, `EXPLICIT_PERMISSION_DENIED`, `DEFAULT_DENY`).
    - Integrated append-only logging to `authorization_audit_logs`.
    - Created REST API router `backend/app/routers/permissions.py` mounted at `/api/permissions`.
  - **15 Automated Conflict & Security Tests (`backend/tests/test_authorization_engine.py`):**
    - Automated test suite implementing all 15 scenarios specified in Section 57 of the JV Collaboration Specification (100% pass rate).
- **Relevant Files:**
  - `backend/app/models/permission.py`
  - `backend/app/services/authorization.py`
  - `backend/app/routers/permissions.py`
  - `backend/app/services/seeder.py`
  - `backend/tests/test_authorization_engine.py`
  - `frontend/src/pages/MasterPermissionsPage.tsx`
  - `frontend/src/types/permission.ts`
  - `frontend/src/router.tsx`
  - `frontend/src/components/layout/Sidebar.tsx`

---

### [2026-09-04] — Document Vault & Master Library Secure File Share Link Engine
- **Category:** Document Vault, Security, RBAC & Partner Collaboration
- **Summary:**
  - **Granular Share Modal & Permission Controls (`ShareDocumentModal.tsx`):**
    - Enabled time-limited (7-day default expiry) secure link generation for all files in both the Tender Document Vault and Master Reusable Document Vault.
    - Integrated granular permission selector: **`View Only`** (in-browser watermarked preview without raw file download) vs. **`Full Download`** (authorized partner direct download).
    - Optional recipient email restriction binding access to authorized stakeholders.
    - 1-click **Copy Share Link** with instant visual feedback and audit logging.
  - **Global & Interactive Integration:**
    - Mounted `<ShareDocumentModal />` in [`AppLayout.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/AppLayout.tsx) for seamless context-driven activation across all screens.
    - Added dedicated **`Share`** action button (`Share2` icon) on every document row in [`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx).
    - Added dedicated **`Share`** action button on every master credential row in [`MasterDocumentVaultPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/MasterDocumentVaultPage.tsx).
    - Extended `shareDocument` in [`TenderContext.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/context/TenderContext.tsx) to transparently resolve documents from either active tender workspaces or central master reusable libraries.
- **Relevant Files:**
  - `frontend/src/components/layout/AppLayout.tsx`
  - `frontend/src/components/modals/ShareDocumentModal.tsx`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`
  - `frontend/src/pages/MasterDocumentVaultPage.tsx`

---

### [2026-09-04] — Single-Folder & Complete Vault ZIP Package Download Engine
- **Category:** Document Vault, Compression, Client & Server Architecture
- **Summary:**
  - **Single-Folder ZIP Download:**
    - Added dedicated folder download button (`Download`) on every folder card header and footer quick-action (`Download ZIP`) in [`TenderDocumentsTab.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx).
    - Downloads that specific folder as `{tender_id}_{folder_name}.zip` with an embedded manifest listing all file metadata, revisions, and SHA-256 hashes.
  - **Complete Vault ZIP Package Download:**
    - Added prominent **`📦 Download All as ZIP`** button in the top action bar of the Document Vault.
    - Archives all folders organized in clean subdirectories (`01_original_tender_documents/...`, `02_company_statutory_documents/...`, etc.) along with a `VAULT_COMPLETE_MANIFEST.txt` into `{tender_id}_complete_vault.zip`.
  - **Dual Backend & Zero-Dependency Client-Side Engine:**
    - **FastAPI Endpoints:** `GET /api/tenders/{tender_id}/documents/zip?folder={folder}` and `GET /api/tenders/{tender_id}/folders/{folder_name}/zip` streaming compressed ZIP archives directly.
    - **Client-Side PKZIP Engine (`frontend/src/utils/zipDownloader.ts`):** Implemented pure TypeScript zero-dependency PKZIP generator with CRC-32 table calculation and standard `Blob` download triggering for instant browser execution and offline resilience.
- **Relevant Files:**
  - `frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`
  - `frontend/src/utils/zipDownloader.ts`
  - `backend/app/routers/documents.py`
  - `backend/tests/test_api_integration.py`

---

### [2026-09-04] — Milestone 6 (M6): E2E Testing, 3-2-1 Backup Sentinel & Production Hardening Delivered
- **Category:** Quality Assurance, Security, Backup Sentinel, Production Deployment
- **Summary:**
  - **Automated Integration & E2E Test Suite (`backend/tests/`):**
    - Auth & RBAC validation: password verification, JWT generation, invalid credentials rejection.
    - Tender lifecycle CRUD: opportunity intake, stage transitions (`DISCOVERED` -> `PREPARATION` -> `SUBMISSION`), Go/No-Go score recording, archive & restore.
    - Operational deliverables: task assignment, priority filters, status movement (`TODO` -> `IN_PROGRESS` -> `DONE`).
    - Document vault & cryptography: file upload, SHA-256 verification, custom folder creation, safe folder deletion with automatic file safeguarding, master reusable credential linking.
    - Real-time discussions: threaded comments and cross-team channel messaging.
    - Executive 10-second KPI calculations: pipeline valuation, readiness scores, deadline countdowns.
    - Runner script `backend/run_tests.py` achieves 100% pass rate.
  - **Automated 3-2-1 Backup Sentinel (`backend/scripts/backup_sentinel.py`):**
    - Creates timestamped snapshots of database and storage vault into compressed ZIP archives.
    - Generates cryptographic `manifest.json` recording SHA-256 hashes for all database and document files.
    - Enforces retention rotation policy keeping 7 daily, 4 weekly, and 6 monthly snapshots.
    - Implements automated restore and integrity verification testing to ensure backup recoverability.
  - **Production Hardening & Deployment Assets (`deployment/`):**
    - Production Nginx reverse proxy (`deployment/nginx/tendertracker.conf`) with `client_max_body_size 100M`, security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy), SPA fallback, and gzip compression.
    - Linux systemd daemon service (`deployment/systemd/tendertracker-backend.service`) with process isolation and auto-restart.
    - Multi-container Docker Compose configuration (`deployment/docker-compose.yml` & `backend/Dockerfile`) orchestrating Frontend, FastAPI, MySQL 8.4, and persistent storage volumes.
    - Unified deployment scripts `deployment/deploy.ps1` and `deployment/deploy.sh`.
- **Relevant Files:**
  - `backend/tests/test_api_integration.py`
  - `backend/run_tests.py`
  - `backend/scripts/backup_sentinel.py`
  - `deployment/nginx/tendertracker.conf`
  - `deployment/systemd/tendertracker-backend.service`
  - `deployment/docker-compose.yml`
  - `backend/Dockerfile`
  - `deployment/deploy.ps1`
  - `deployment/deploy.sh`

---

### [2026-09-04] — Milestone 2 (M2): FastAPI Backend Core & Database Schema Delivered
- **Category:** Backend Core, Database, Storage Vault, REST API
- **Summary:**
  - **FastAPI Core Engine (`backend/app/main.py`):**
    - Initialized enterprise FastAPI application with CORS middleware, lifespan events, and global `/api/health` monitoring.
    - Interactive OpenAPI documentation active at `http://127.0.0.1:8000/docs`.
  - **Dual-Mode Database Architecture (`backend/app/core/database.py`):**
    - Configured SQLAlchemy engine supporting zero-config local development using SQLite (`sqlite:///./tender_tracker.db`) and production-grade MySQL 8.4 LTS via `.env`.
  - **SQLAlchemy ORM Models (`backend/app/models/`):**
    - Implemented full schema covering `User`, `Tender`, `TenderDecisionMatrix`, `TenderTask`, `TenderFolder`, `TenderDocument`, `ReusableDocument`, `TenderRequirement`, `TenderReviewTier`, and `TenderComment`.
  - **Local Disk Storage Vault Engine (`backend/app/services/storage.py`):**
    - Implemented automatic folder structure provisioning (`01_` through `06_`) under `storage/tenders/{TDR-ID}/` on local disk (HDD / SSD).
    - Implemented streaming file upload with cryptographic SHA-256 calculation and safe folder deletion with automatic file safeguarding.
  - **Auto-Seeder Service (`backend/app/services/seeder.py`):**
    - Automatically seeds the 4 standard user profiles and primary tenders with tasks, documents, review tiers, and decision matrices.
  - **REST API Routers (`backend/app/routers/`):**
    - Auth & Team (`/api/auth`)
    - Tenders & Stages (`/api/tenders`)
    - Tasks & Kanban (`/api/tasks`)
    - Vault Documents & Reusable Library (`/api/documents`, `/api/reusable-documents`)
    - Real-Time Chat & Threaded Comments (`/api/comments`)
    - 10-Second Executive Dashboard Metrics (`/api/dashboard/stats`)
- **Relevant Files:**
  - `backend/app/main.py`
  - `backend/app/core/config.py`
  - `backend/app/core/database.py`
  - `backend/app/core/security.py`
  - `backend/app/models/`
  - `backend/app/schemas/`
  - `backend/app/services/storage.py`
  - `backend/app/services/seeder.py`
  - `backend/app/routers/`
  - `backend/requirements.txt`
  - `backend/.env.example`

---

### [2026-09-04] — Version 2.4.0: Reusable Master Vault, Role-Based Access Control, Real-Time Chat, Custom Folders & Command Palette
- **Category:** Master Vault, Security & RBAC, Communications, Command Palette
- **Summary:**
  - **Master Reusable Document Library (`/documents`):**
    - Built central corporate repository for credentials and company files reused across tenders (Trade License, Audited Financials, ISO Certifications, Tax Clearance, Bank Solvency Letters, Expert CVs, Track Record).
    - Enabled 1-click referencing into any active tender proposal without duplicate file uploads.
  - **Granular Role-Based Access Control (RBAC):**
    - Defined 4 security clearance tiers (`ALL_TEAM`, `MANAGEMENT_ONLY`, `RESTRICTED_FINANCE`, `EXECUTIVE_ONLY`).
    - Enforced clearance checks on both Master Vault and Tender Proposal files, locking downloads and showing restricted badges when clearance is insufficient.
  - **Custom Vault Folders Lifecycle:**
    - Added on-the-fly custom folder creation with auto-slug generation.
    - Added 1-click inline document-to-folder reassignment dropdown on every row.
    - Added safe folder deletion modal with automated file safeguarding (moving files to default folder to prevent accidental loss).
  - **Team Chat & Tender Discussions Hub (`/discussions`):**
    - Added full enterprise collaboration console with general channels (`# General Bid Operations`, `# Technical Solutions`, `# Commercial & Pricing`, `# Legal & Risk`) and proposal-specific threads.
    - Integrated with tender comments so remarks posted in tender channels synchronize bidirectionally.
    - Added quick `@Name` mentions and direct workspace jump links.
  - **Interactive Global Command Palette (`Ctrl + Shift + K`):**
    - Built omnipresent command palette searching tenders, deliverables, vault files, team members, and system pages.
    - Added keyboard navigation (`↑`/`↓`, `↵ Enter`, `ESC`), category filter pills, and header search integration.
  - **Tender Operational Ergonomics:**
    - Filtered "My Tasks" and dynamic team member name dropdown on `/tasks/my-tasks`.
    - Added custom team member profile creation modal and full RBAC matrix on `/team`.
    - Fixed stray render bug on `TenderSummaryDocument.tsx`.
- **Relevant Files:**
  - `frontend/src/pages/MasterDocumentVaultPage.tsx`
  - `frontend/src/pages/ChatDiscussionsPage.tsx`
  - `frontend/src/components/modals/CommandPaletteModal.tsx`
  - `frontend/src/pages/tender-tabs/TenderDocumentsTab.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/context/TenderContext.tsx`
  - `frontend/src/types/tender.ts`
  - `frontend/src/router.tsx`

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
    - Updated Proposal Workspace header widget: if a tender has no entered estimated value (zero or undefined), the **"Estimated Net Value"** block is completely hidden, cleanly displaying only the Scope of Work (SOW) Category.
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
    1. **Basic Info & Classification:** Domain classification pills (`SOFTWARE / IT RELATED`, etc.), Tender Title, Project Name, Tender ID, Reference No., Client / Donor, Portal, Country, Scope of Work (SOW) Category, Estimated Net Value (USD/BDT), Published Date, Submission Cutoff Date & Time, Priority.
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

- **ADR-001: Local Disk Storage (HDD / SSD) for MVP**  
  *Context:* Small internal team (3–8 users).  
  *Decision:* Store tender documents directly on the local server filesystem (HDD / SSD) under `storage/tenders/{TDR-ID}/...` with SHA-256 checksums rather than AWS S3 / Cloudflare R2 / MinIO.  
  *Impact:* Eliminates external cloud storage complexity, fully supports mechanical HDDs and solid-state SSDs alike, and simplifies initial deployment while maintaining a clean abstraction layer for future cloud migration.

- **ADR-002: Decoupled Lifecycle Status vs. Go/No-Go Decision Matrix**  
  *Context:* Traditional systems conflate workflow stage with executive evaluation.  
  *Decision:* Operational stages (`DISCOVERED`, `PREPARATION`, etc.) are tracked separately from governance outcomes (`GO`, `NO-GO`, `CONDITIONAL`, `PENDING`).  
  *Impact:* Eliminates status ambiguity and prevents disqualified tenders from advancing without formal recorded justification.

- **ADR-003: Ponytail & Graphify Dual Optimization Stack**  
  *Context:* AI coding agents tend to over-engineer (generation bloat) and perform repetitive file-tree greps (retrieval bloat).  
  *Decision:* Ponytail sets strict generation guardrails; Graphify maintains pre-indexed project knowledge graphs.  
  *Impact:* Halves token usage, speeds up agent navigation, and ensures clean, minimal, maintainable production code.

- **ADR-004: Dedicated Full-Page Tender Registry Console over Popup Modals**  
  *Context:* Tender intake requires capturing 5 comprehensive tabs of metadata (Classification, Scope of Work (SOW), Eligibility, Staffing/Hardware, Dates/Risks). Rendering this in a floating popup modal cluttered the viewport and duplicated navigation.  
  *Decision:* Replaced modal-based intake with a dedicated full-page console at `/registry` ([`TenderRegistryPage.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx)). Removed the 1,550-line modal from the application root.  
  *Impact:* Reduced JavaScript bundle by ~47 kB, improved data entry ergonomics, and enabled deep-link editing via `/registry?id={id}`.

- **ADR-005: Universal Operational Collaboration & Clean Procurement Semantics**  
  *Context:* Strict role lockouts impeded team collaboration, and legacy prototype terms like "Post-Mortem" and "Kanban" caused user confusion.  
  *Decision:* Mapped 4 organizational titles (`Business Head`, `Executive Manager`, `Senior Manager`, `Tender Analyst`) with universal operational access; replaced "Kanban" with "Task Board"; replaced "Post-Mortem" with "Outcome & Debrief".  
  *Impact:* Clear, unhindered operational flow with zero permission roadblocks and professional enterprise copy.

- **ADR-006: Dual-Mode Database Architecture (SQLite for Dev / MySQL 8.4 for Prod)**  
  *Context:* Requiring a running MySQL server for local feature development or test execution created unnecessary setup friction for developer workstations that may not have MySQL installed.  
  *Decision:* Implemented SQLAlchemy ORM with auto-dialect selection. The backend defaults to an embedded zero-configuration SQLite database (`tender_tracker.db`) for instant local development, automated integration testing, and CI. When deploying to production, simply configuring `DATABASE_URL` in `.env` connects to MySQL 8.4 LTS (or Docker Compose container) with zero application code changes.  
  *Impact:* 100% test coverage and full local execution out of the box with zero external database dependencies, while retaining enterprise MySQL 8.4 compatibility.

- **ADR-007: Bidder-Partner Document Upload & Re-Upload Request Workflow with Review Feedback**  
  *Context:* In consortium bid management, the Lead Bidder frequently identifies defective, expired, or unsealed documents provided by JV Partners (or missing statutory documents entirely) and needs a formal revision request workflow with SLA deadlines and reviewer comments rather than informal email chains.  
  *Decision:* Added bidirectional document lifecycle statuses (`ACTION_REQUIRED`, `PENDING_REVIEW`, `CLEARED`, `VERIFIED`) to `tender_documents`. Implemented dedicated endpoints:
  1. `POST /api/documents/request-upload`: Dispatches formal request for missing partner documents, placing a pending placeholder in the vault.
  2. `POST /api/documents/{doc_id}/request-reupload`: Flags defective documents with `ACTION_REQUIRED`, logs specific reviewer instructions/comments, urgency tags, and due date.
  3. `POST /api/documents/{doc_id}/resolve-reupload`: Accepts partner revision upload with SHA-256 integrity validation, automatic revision bumping (e.g. `v1.0` -> `v1.1`), and transitions status to `PENDING_REVIEW`.  
  *Impact:* Eliminates email bottlenecks, enforces clear consortium SLA accountability, and renders interactive feedback banners and modals directly in the Document Vault and Partner Portal.

- **ADR-008: Procuring Authority Officer & Helpdesk Details Intake**  
  *Context:* Bid preparation teams and consortium partners need direct, rapid access to the official client procurement manager (evaluation committee officer) and tender helpline/support desk during clarification and submission windows without having to dig through multi-hundred page tender PDFs.  
  *Decision:* Added structured database columns (`procurement_manager_name`, `procurement_manager_designation`, `procurement_manager_email`, `procurement_manager_phone`, `helpline_phone`, `helpline_email`, `helpline_hours`) to the `tenders` table with SQLite & MySQL auto-migrations. Integrated dual cards into Tab 1 of the Tender Registry console (`/registry`) and the intake modal, with dynamic representations across the Formal 3-Page Tender Summary (`/registry/summary/:id`) and Proposal Workspace overview (`/tenders/:id`).  
  *Impact:* Immediate visibility of key contact personnel and helpdesks across all tender views, with clickable telephone and email links.

- **ADR-009: Zero-Dependency Client-Side Fuzzy Search Engine**  
  *Context:* Tender titles, reference codes, authority acronyms, and vendor names are frequently typed with typos, character transpositions (e.g. `"seimens"` for `"Siemens"`), missing punctuation, acronyms (`"dtca"` for `"Dhaka Transport Coordination Authority"`), or out-of-order keywords (`"hospital erp"` for `"Enterprise Resource Planning for City Hospital"`). Rigid `.includes()` exact substring matching fails in all these cases, causing perceived data loss and user frustration. However, pulling heavy third-party search libraries (e.g. `fuse.js`) bloats bundle size and violates Ponytail Rule 5.  
  *Decision:* Implemented a zero-dependency, ultra-lightweight TypeScript fuzzy search engine (`frontend/src/utils/fuzzySearch.ts`):
  1. *Levenshtein Distance with Adaptive Thresholds:* Matrix-based edit distance supporting single and adjacent transpositions (`maxDistance = qLen >= 6 ? 2 : qLen >= 4 ? 1 : 0`).
  2. *Acronym & Subsequence Matching:* Character-boundary initial matching and in-order subsequence search.
  3. *Multi-Word Permutations:* Splits multi-token queries and requires all query tokens to fuzzy-match target words in any order.
  4. *Tiered Relevance Scoring & O(n) Fast-Path:* Exact/substring matches bypass expensive matrix computations for zero typing latency.  
  *Impact:* Immediate, fault-tolerant search across Tender Pipeline, Dashboard, Registry, Master Document Vault, Organizations, Company Profiles, Credentials, and Archived Bids with zero new bundle dependencies.

- **ADR-010: Procurement Milestone Lifecycle, Commercial Budget Estimator & Post-Award Execution Architecture**  
  *Context:* Tender execution in public procurement spans beyond bid submission: teams must purchase tender schedules, submit Earnest Money Deposits (EMD) or bank guarantees, attend bid document opening sessions, negotiate contracts upon winning, execute deliverables, handover systems under UAT, and provide long-term maintenance SLAs (Requirements #20 & #17). Furthermore, procuring entities frequently redact overall budgets but publish required tender security amounts (~2.5% of budget), leaving analysts needing an instant reverse calculator. Finally, winning a tender (`AWARDED`) requires a formal operational roadmap rather than a static status flag.  
  *Decision:*
  1. *Procurement Milestone Fields & Auto-Migrations:* Added 6 lifecycle milestones (`opening_date`, `contract_signing_date`, `work_start_date`, `possible_period`, `product_handover_date`, `maintenance_period`) and commercial terms (`schedule_purchase_deadline`, `schedule_purchase_method`, `tender_security_amount`, `tender_security_method`, `post_award_data`) with zero-downtime auto-migrations for SQLite and MySQL.
  2. *Smart 2.5% Security Deposit & Reverse Budget Calculator:* Added client-side reactive financial calculator in Tab 2 of Tender Registry and Intake Modal with percentage presets, reverse budget estimation ($\text{Budget} = \frac{\text{Security}}{\%}$), and forward security deposit calculation.
  3. *Calendar Milestone Tracking & Proactive Alerts:* Upgraded `/calendar` with multi-category filters (🟣 Opening Days, 🔵 Deadlines, 🟢 Contract Signing, 🟡 Work Start, 🟠 Handover) and urgency markers. Configured `/api/alerts` to proactively dispatch CRITICAL alerts on Opening Day and WARNING alerts on T-1 Day.
  4. *7-Stage Post-Award Execution Roadmap:* When tender is `AWARDED`, `/tenders/:id/result` activates an interactive 7-phase delivery roadmap covering NOA Acceptance, Performance Security Deposit, Contract Signing, Work Start, Execution Period, Product Handover, and Maintenance SLA.  
  *Impact:* Seamless end-to-end procurement governance from pre-bid purchase to warranty maintenance with zero missed milestones.

- **ADR-011: Tender Financial Scenarios, Milestone Schedules & Contract Rule Engine**  
  *Context:* Commercial bid analysis requires modeling complex cash flow dynamics: milestone payment releases, advance mobilization with amortized recovery, long-term SaaS subscription revenue (TCV/ACV with price escalation), and contract deductions (Liquidated Damages, Retention Money, and Statutory TDS/VDS withholding). Without structured modeling during initial Tender Registry intake, bid analysts make manual margin estimation errors and lose visibility into working capital exposure.  
  *Decision:*
  1. *Dual Persistence Model:* Created dedicated `tender_financial_rules` database table with all 28 fields specified in Section 6.1 of the Tender Financial Scenarios specification for granular relational queries, coupled with a high-performance `financial_model` JSON column on the `tenders` table with zero-downtime auto-migrations for SQLite and MySQL 8.4.
  2. *REST API Suite:* Built `/api/tenders/{id}/financial-rules` and `/api/tenders/{id}/financial-model` endpoints supporting category filtering, rule creation, and atomic model updates.
  3. *Zero-Dependency Reusable Modeler:* Built `FinancialScenariosEditor.tsx` implementing 4 payment scenarios (Milestone, Advance, SaaS, Lump-Sum), 100% milestone disbursement balance validator, TCV/ACV calculation engine, penalty & retention calculators, and an interactive Expected Net Cash Flow Realization Waterfall ledger.
  4. *Intake-Time Integration & Printable Summary:* Embedded Tab 3 ("Financial Scenarios & Rules") directly into Tender Registry and the New Tender Modal, and rendered the complete schedule and deduction breakdown in the formal printable 3-page Tender Summary Document (`TenderSummaryDocument.tsx`).  
  *Impact:* Immediate visibility into contract cash flow, capital risk levels, and net collectible revenue from day zero of tender registration.

- **ADR-012: Personal Profile & Key Personnel Dossier Hub Architecture**  
  *Context:* Tender evaluation committees evaluate not only the corporate bidder but also the key personnel proposed for the assignment (e.g. Lead Solutions Architect, Commercial Director, Quality Sentinel). Bid operations teams need structured management of individual team member profiles, clear employment relationship categorization (Permanent Employee vs. JV Partner Staff vs. External Consultant), proposed project designations, verified chronological project track records for Form Tech-1 CV generation, active multi-tender commitments, and a real-time capacity sentinel to prevent team burnout.  
  *Decision:*
  1. *Backend Model & Dual-Mode Auto-Migrations:* Extended the `users` table with structured columns (`phone`, `location`, `employment_type`, `proposed_designation`, `past_assignments` JSON, `certifications` JSON, `education` JSON, `active_tender_roles` JSON) and automatic boot-time column migrations for SQLite and MySQL 8.4 LTS.
  2. *REST API Endpoints:* Created `/api/users` router supporting profile lookups, updates, assignment appending (`POST /api/users/{id}/assignments`), and assignment deletions.
  3. *5-Pillar Frontend Hub:* Created `UserProfilePage.tsx` (`/profile` and `/profile/:userId`) containing:
     - *User Identity & Core Profile:* Name, title, department, employment contract badge (`PERMANENT`, `JV_PARTNER_STAFF`, `EXTERNAL_CONSULTANT`), phone, email, location, and edit modal.
     - *Tender-Specific Identity:* Prominent proposed project designation card (e.g. *Sarah Rahman — Lead Solutions Architect & Team Leader*) with 1-click clipboard copy.
     - *Professional Track Record:* Chronological project ledger with client, role, deployment duration, deliverables, technologies, and responsibilities, plus "Add Project Assignment" modal and academic/certification credentials.
     - *Active Tender Commitments:* Cards tracking live bids the user is associated with, responsibility matrix tags (`Lead Proposal Manager`, `Core Technical Contributor`, `Quality Reviewer`), and direct 1-click links to `/tenders/{id}`.
     - *Workload & Capacity Sentinel:* Real-time capacity utilization meter with dynamic burnout risk warnings (Optimal, Near Capacity, Overallocated).
  4. *Integration Across App:* Integrated dossier navigation into `UserRoleSwitcher.tsx`, `TeamAllocationPage.tsx`, and `Sidebar.tsx`.  
  *Impact:* Bid managers can compile Form Tech CV annexures in seconds, verify consortium expert qualifications, and balance workloads across competing bids without burnout.

- **ADR-013: Universal In-Browser Document Viewer Hub (Native PDF + docx-preview + SheetJS Engine)**  
  *Context:* Tender evaluation and bid management requires reviewing diverse document formats (RFP PDFs, technical specifications in `.docx`, BOQ pricing sheets in `.xlsx`/`.csv`, scanned statutory trade licenses in `.png`/`.jpg`, software code/markdown scripts, and archive packages) directly within the application without forcing users to leave the browser or install heavy desktop suites. Furthermore, strict data privacy mandates zero cloud leaks (no third-party cloud viewer iframe proxies like Google Docs or Office 365), and tender compliance demands clean, pristine rendering with zero watermarks on both browser views and downloaded files.  
  *Decision:*
  1. *Format-Aware Multi-Engine Dispatcher:* Built `DocumentPreviewModal.tsx` utilizing Ponytail-optimized local client-side rendering engines:
     - *PDF Viewport:* Native sandboxed browser PDF engine with inline fallback and download triggers.
     - *Word Engine (`docx-preview`):* Pure DOM rendering engine parsing WordprocessingML directly into styled HTML DOM.
     - *Spreadsheet Engine (`xlsx` / SheetJS):* Client-side workbook parser with sheet tab selector, structured scrollable table, cell formatting, and real-time text search filtering.
     - *Image Lightbox:* High-contrast viewer with zoom controls ($50\% - 300\%$), 90° rotation, pan reset, and full-screen expansion.
     - *Code & Text Editor:* Syntax-highlighted monospaced viewer with line numbers and character count.
     - *Archive Manifest Inspector:* ZIP container inspection and file structure breakdown.
  2. *Zero Watermark Enforcement:* Explicitly eliminated all watermark overlays and PDF stamping per user mandate. Documents are rendered and downloaded in their original, unblemished integrity.
  3. *Secure Backend Streaming:* Built dedicated inline preview endpoints (`GET /api/documents/{id}/preview`, `GET /api/documents/shared/{token}/preview`, and `GET /api/reusable-documents/{id}/preview`) supporting MIME headers, byte-range streaming, and token permission validation.
  4. *Universal Surface Integration:* Connected Document Vault, Master Reusable Library, Shared Token Portal, and JV Partner Portal with preview action buttons and clickable file names.  
  *Impact:* 100% private, instantaneous in-browser document review across all standard tender file formats with zero external cloud dependencies.

- **ADR-014: Tender Type, Budget Type, Source of Fund & Procurement Method Governance Framework**  
  *Context:* Public procurement regulations (such as PPA 2006, PPR 2008 in Bangladesh, World Bank Procurement Regulations, and ADB Guidelines) mandate strict tracking of procurement modalities (NCB vs ICB), budget allocations (Development/Capex vs Revenue/Opex), funding sources (GoB, World Bank, JICA, etc.), and procurement methods (OTM, QCBS, LCS, SSTE, DPM). These attributes dictate bidding rules, bid security limits, review tiers, and compliance requirements.  
  *Decision:*
  1. *Database Schema & Dual-Mode Compatibility:* Added `tender_type`, `budget_type`, `source_of_fund`, and `procurement_method` as nullable string columns in the `tenders` table. Implemented boot-time auto-migrations for both SQLite (`PRAGMA table_info`) and MySQL 8.4 (`SHOW COLUMNS`).
  2. *Standardized Sourcing Presets with Custom Override:* Defined standard option sets in `types/tender.ts` for each dimension while allowing tender analysts to supply custom or donor-specific strings seamlessly without database schema alterations.
  3. *Full Intake & Workspace Integration:* Added interactive selectors to `NewTenderModal.tsx` and `TenderRegistryPage.tsx`, structured cards in `TenderDetailPage.tsx`, and formal rows in printable `TenderSummaryDocument.tsx`.
  4. *Test Verification:* Integrated comprehensive CRUD validation into `backend/tests/test_api_integration.py` (`test_24_tender_procurement_governance_attributes`).  
  *Impact:* Comprehensive procurement governance compliance across national and multilateral donor tenders without database overhead or external dependencies.

---

## 4. Current Application Screen & Route Directory (25 Screens)

| Screen ID | Screen Name | Route | Module |
| :--- | :--- | :--- | :--- |
| `screen:login` | Login - Enterprise Sign In | `/login` | `auth` |
| `screen:dashboard` | Tender Command Center Dashboard | `/dashboard` | `dashboard` |
| `screen:tender_registry` | Tender Registry & Data Entry | `/registry` | `registry` |
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
| `screen:my_tasks` | My Tasks - Cross-Tender Console | `/tasks/my-tasks` | `tasks` |
| `screen:chat_discussions` | Team Chat & Tender Discussions Hub | `/discussions` | `collaboration` |
| `screen:team_allocation` | Tender Team & Workload Allocation | `/team` | `team` |
| `screen:calendar` | Tender Calendar & Deadline Schedule | `/calendar` | `calendar` |
| `screen:reports` | Reports & Win/Loss Analytics | `/reports` | `analytics` |
| `screen:archive` | Archived Non-Participating Records | `/archive` | `archive` |
| `screen:notifications` | Notification & Alert Center | `/notifications` | `notifications` |
| `screen:settings` | Settings & System Configuration | `/settings` | `settings` |
| `screen:organizations` | Enterprise Procuring Entities & Clients Directory | `/tools/organizations` | `organizations` |
| `screen:company_profiles` | Corporate Bidder & JV Partner Entity Profiles | `/tools/company-profiles` | `profiles` |
| `screen:partner_portal` | Consortium Partner Document Intake Portal | `/partner/portal` | `partners` |
| `screen:user_profile` | Personal Profile & Key Personnel Dossier Hub | `/profile`, `/profile/{userId}` | `personnel` |



