# Tender Tracker Command Center — Tender Registry Field Specifications & Data Dictionary

**Document Version:** 2.0.0  
**Status:** Canonical Reference Specification  
**Scope:** Complete Data Intake Schema, UI Field Dictionary, Selection Options, Valuation Engines, and Governance Rules for Tender Registration (`TenderRegistryPage.tsx`, `FinancialScenariosEditor.tsx`, `ImportantClausesManager.tsx`).

---

## 1. Executive Summary & Architecture Overview

The **Tender Registry** is the central data intake and commercial underwriting gateway in TenderTracker. It provides tender analysts, bid managers, and executive leadership with an exhaustive, multi-dimensional profile of every public and private tender opportunity.

### Core Architectural Principles
1. **The 10-Second Rule**: The interface immediately exposes critical bid parameters (submission cutoff, financial commitment, bid security, liquid assets, and blockers) within 10 seconds.
2. **Segregation of Status vs. Decision Matrix**: Operational progress (`stage`) is segregated from the strategic `GO` / `NO-GO` decision matrix (`decision`).
3. **Dual-Mode Database Compatibility**: Fully normalized across SQLite local development (`tender_tracker.db`) and MySQL 8.0/8.4 production database servers with zero code adjustments.
4. **Local Vault Storage Integration**: Automatically scaffolds local storage directories (`storage/tenders/{TDR-ID}/...`) with SHA-256 revision tracking.

---

## 2. Global Category & Tab Navigation Index

The Tender Registry contains **7 operational categories / tabs**:

| Tab # | Tab Identifier | Tab Label | Primary Purpose |
|:---:|:---|:---|:---|
| **1** | `BASIC` | **1. Basic Information** | Core identity, issuing authority, timestamps, multi-timezone system, currency & valuation, statutory procurement governance, and contacts. |
| **2** | `SCOPE` | **2. Scope & Commercial** | SOW narrative, tender schedule purchase terms, tender security (EMD) with 2.5% reverse budget calculator, and SLA periods. |
| **3** | `FINANCIAL` | **3. Financial Scenarios & Rules** | 4 cash flow disbursement scenarios, mobilization advance terms, milestone payment builder, SaaS TCV/ACV modeler, penalties, and tax withholdings. |
| **4** | `ELIGIBILITY` | **4. Eligibility & JV** | Financial turnover, single project value thresholds, liquid assets, ISO certifications, and Joint Venture (JV) / consortium equity rules. |
| **5** | `STAFFING` | **5. Staff & Hardware** | Mandatory submission documents checklist, key personnel dossier table (CV requirements), and key hardware/infrastructure tables. |
| **6** | `RISKS` | **6. Dates, Risks & Notes** | Complete procurement milestone schedule (Req #20), categorized risk point matrix, management talking points, and debrief notes. |
| **7** | `CLAUSES` | **7. Important Clauses** | High-criticality tender clauses with verbatim citations, page references, source PDF links, and commercial/legal risk implications. |

---

## 3. Tab 1: Basic Information (`BASIC`)

### 3.1. Tender Domain Classification
- **Field Name:** `classification`
- **UI Label:** `Tender Domain Classification`
- **Component Type:** Single-Select Button Chip Group
- **Default Value:** `SOFTWARE / IT RELATED`
- **Selection Options:**
  - `SOFTWARE / IT RELATED` (Core software engineering, ERP, web/mobile apps, portal development)
  - `PARTIALLY SOFTWARE / IT RELATED` (Hardware supply + custom software, IoT turnkey, IT infrastructure)
  - `NOT SOFTWARE / IT RELATED` (Pure civil works, non-IT physical commodities, mechanical supply)
  - `UNCLEAR` (Tender notice requires further RFP document review)

---

### 3.2. Tender Identity & Procurement Portal
| Field Name | UI Label | Input Type | Required? | Options / Allowed Values / Format | Description & Behavior |
|:---|:---|:---|:---:|:---|:---|
| `tenderTitle` | `Tender Title` | Single-line Text | **Yes** | Free text (e.g., `Design, Development & Implementation of National Single Window System`) | Official tender package title as published in notice. |
| `projectName` | `Project Name` | Single-line Text | No | Free text (e.g., `Digital Bangladesh Public Finance Modernization Project`) | Umbrella government project or donor development scheme. |
| `tenderId` | `Tender ID` | Monospaced Text | **Yes** | Auto-generated or custom code (e.g., `TDR-2026-9412`, `e-GP-1092834`) | Unique system identifier. Auto-generates `TDR-YYYY-XXXX` if left blank. |
| `referenceNo` | `Reference No.` | Monospaced Text | No | Official Tender/Package No. (e.g., `GD-14/DTCA/2026-01`, `Memo-88.02.0000`) | Official gazette or reference number issued by the client authority. |
| `portal` | `Procurement Portal` | Single-line Text | No | Free text with preset examples: `e-GP (eprocure.gov.bd)`, `UNDP Procurement Notice`, `World Bank STEP`, `UNGM` | Online portal or procurement platform where tender is published. |
| `country` | `Country / Jurisdiction` | Single-line Text | **Yes** | Free text (e.g., `Bangladesh`, `Regional`, `International`) | Procuring country or governing legal jurisdiction. |
| `client` | `Client / Issuing Authority` | Single-line Text | **Yes** | Free text (e.g., `Dhaka Transport Coordination Authority (DTCA)`, `BTRC`, `UNDP Bangladesh`) | Issuing procuring entity or government ministry/agency. |
| `category` | `Scope of Work (SOW) Category` | Dynamic Select + Custom Input | **Yes** | Dynamic list from DB + Custom override toggle (`+ New Category` / `← Choose Existing`) | High-level market vertical. Stored in `tender_categories` master table. |

#### Standard SOW Categories in System:
- `IT & Cloud Infrastructure`
- `Software & Web Application Development`
- `Industrial IoT & SCADA Systems`
- `Cybersecurity & SOC Operations`
- `Data Center & Network Hardware`
- `Digital Governance & Citizen Services`
- `Telecom & Billing Systems`
- `Custom User-Added Categories...`

---

### 3.3. Notice & Cutoff Timestamps (Multi-Timezone Engine)
The system supports **38 global timezones** to accurately track international development bank (World Bank, ADB, JICA, UNGM) and domestic e-GP deadlines without timezone confusion.

| Field Name | UI Label | Input Type | Default | Options / Range |
|:---|:---|:---|:---:|:---|
| `publishedDate` | `Notice / Published Date` | Date Picker (`YYYY-MM-DD`) | Current Date | Valid calendar date. |
| `publishedHour` | `Published Hour` | Dropdown Select | `09` | `00` to `23` (24-hour format). |
| `publishedMinute` | `Published Minute` | Dropdown Select | `00` | `00` to `59` (60-minute intervals). |
| `publishedTimezone` | `Published Timezone` | Dropdown Select | `BST` | 38 Global Timezones (see list below). |
| `lastDate` | `Last Date (Submission Deadline)` | Date Picker (`YYYY-MM-DD`) | Required | Valid calendar date. |
| `closeHour` | `Cutoff Hour` | Dropdown Select | `14` | `00` to `23` (24-hour format). |
| `closeMinute` | `Cutoff Minute` | Dropdown Select | `00` | `00` to `59` (60-minute intervals). |
| `closeTimezone` | `Cutoff Timezone` | Dropdown Select | `BST` | 38 Global Timezones (see list below). |
| `submissionTime` | `Submission Cutoff Time Display` | Auto-calculated Display | Dynamic | Formatted string (e.g., `02:00 PM BST`). |

#### Standard 38 Timezones Supported (`STANDARD_TIMEZONES`):
1. **South Asia & Primary Hubs:** `BST` (UTC+06:00 - Bangladesh), `IST` (UTC+05:30 - India/Sri Lanka), `PKT` (UTC+05:00 - Pakistan), `NPT` (UTC+05:45 - Nepal), `BTT` (UTC+06:00 - Bhutan), `MMT` (UTC+06:30 - Myanmar), `MVT` (UTC+05:00 - Maldives).
2. **Universal & Western Europe:** `UTC` (UTC+00:00 - Universal), `GMT` (UTC+00:00 - London), `WEST` (UTC+01:00 - UK BST/Portugal), `CET` (UTC+01:00 - Central Europe / Paris / Berlin), `CEST` (UTC+02:00 - Central Europe Summer), `EET` (UTC+02:00 - Athens / Cairo), `EEST` (UTC+03:00 - Eastern Europe Summer), `MSK` (UTC+03:00 - Moscow).
3. **Middle East & Central Asia:** `AST` (UTC+03:00 - Riyadh / Doha), `IRST` (UTC+03:30 - Tehran), `GST` (UTC+04:00 - Dubai / Abu Dhabi), `AFT` (UTC+04:30 - Kabul), `UZT` (UTC+05:00 - Tashkent), `ALMT` (UTC+05:00 - Almaty).
4. **Africa (UN / AfDB Tenders):** `WAT` (UTC+01:00 - Lagos), `CAT` (UTC+02:00 - Harare / Johannesburg), `EAT` (UTC+03:00 - Nairobi).
5. **Southeast & East Asia:** `ICT` (UTC+07:00 - Bangkok / Jakarta / Hanoi), `SGT` (UTC+08:00 - Singapore), `MYT` (UTC+08:00 - Kuala Lumpur), `PHT` (UTC+08:00 - Manila), `HKT` (UTC+08:00 - Hong Kong), `CST_CN` (UTC+08:00 - Beijing), `JST` (UTC+09:00 - Tokyo), `KST` (UTC+09:00 - Seoul).
6. **Oceania & Pacific:** `AWST` (UTC+08:00 - Perth), `ACST` (UTC+09:30 - Darwin), `AEST` (UTC+10:00 - Sydney), `AEDT` (UTC+11:00 - Sydney Summer), `NZST` (UTC+12:00 - Wellington), `NZDT` (UTC+13:00 - Wellington Daylight), `FJT` (UTC+12:00 - Fiji).
7. **Americas:** `EST` (UTC-05:00 - New York/DC), `EDT` (UTC-04:00 - Eastern Daylight), `CST` (UTC-06:00 - Chicago), `CDT` (UTC-05:00 - Central Daylight), `MST` (UTC-07:00 - Denver), `MDT` (UTC-06:00 - Mountain Daylight), `PST` (UTC-08:00 - Los Angeles), `PDT` (UTC-07:00 - Pacific Daylight), `AKST` (UTC-09:00 - Alaska), `HST` (UTC-10:00 - Hawaii), `AST_CA` (UTC-04:00 - Halifax), `COT` (UTC-05:00 - Bogotá), `PET` (UTC-05:00 - Lima), `CLT` (UTC-04:00 - Santiago), `BRT` (UTC-03:00 - São Paulo), `ART` (UTC-03:00 - Buenos Aires).

---

### 3.4. AI Collaboration & Knowledge Sharing Link
| Field Name | UI Label | Input Type | Description & Behavior |
|:---|:---|:---|:---|
| `aiChatShareLink` | `AI Chat & Document Knowledge Link (ChatGPT / Claude / NotebookLM / Gemini)` | URL (`type="url"`) | External share link to an AI notebook or thread pre-loaded with the tender RFP and TOR documents. Features a one-click **"Test Link"** button to open the workspace. |

---

### 3.5. Currency & Valuation Matrix
Provides real-time multi-currency valuation with live conversion to Bangladesh Taka (BDT) and automatic Crore / Lakh notation preview.

| Field Name | UI Label | Input Type | Default | Options / Constraints |
|:---|:---|:---|:---:|:---|
| `tenderCurrency` | `Tender Currency` | Select Dropdown | `USD` | `USD ($)`, `BDT (৳)`, `EUR (€)`, `GBP (£)`, `JPY (¥)`, `OTHER` |
| `estimatedValue` | `Net Value ({tenderCurrency})` | Numeric (Decimal) | Empty | Float > 0 (Leave blank if unannounced/classified). |
| `exchangeRateToBdt` | `Rate vs BDT (At that time)` | Numeric (Decimal) | `122.00` | Auto-set to `1.0` and disabled if currency is `BDT`. Defaults: USD=122.00, EUR=133.50, GBP=158.00, JPY=0.82. |
| `exchangeRateDate` | `Rate Fixation Date` | Date Picker | Published Date | Official date at which foreign currency exchange rate was locked. |
| `liveBdtValue` | `Total Equivalent (BDT)` | Computed (Read-Only) | Auto | Formula: `estimatedValue * (currency === 'BDT' ? 1.0 : exchangeRateToBdt)`. Formats into `৳X.XX Crore` or `৳X.XX Lakh`. |

---

### 3.6. Procurement Governance & Sourcing Framework (Req #21)
Statutory compliance attributes governed by standard public procurement rules (PPA 2006 / PPR 2008 / World Bank Guidelines).

| Field Name | UI Label | Component | Presets & Selection Options | Custom Mode Available? |
|:---|:---|:---|:---|:---:|
| `tenderType` | `Tender Type` | Select / Text | `Request for Proposals (RFP)`, `Expression of Interest (EOI)`, `Request for Quotation (RFQ)`, `Open Tendering Process (OTP)`, `Open Tendering Method (OTM)`, `National Competitive Bidding (NCB)`, `International Competitive Bidding (ICB)`, `Limited Tendering Method (LTM)`, `Direct Contracting / Single Source`, `Framework Agreement / Call-off`, `Pre-Qualification (PQ)`, `Other / Custom Modality` | **Yes** (`+ Custom Type`) |
| `parentEoiId` | `Originating EOI (2-Stage Procurement)` | Contextual Select | Active only when `tenderType === 'Request for Proposals (RFP)'`. Displays all existing EOI tenders marked `SHORTLISTED` to synchronize client, country, category, and officers. | N/A |
| `budgetType` | `Budget Type` | Select / Text | `Development Budget (ADP / Capex)`, `Revenue / Operational Budget (Opex)`, `Own Funds / Corporate Budget`, `Grant / Aid Budget`, `Capital Budget` | **Yes** (`+ Custom Budget`) |
| `sourceOfFund` | `Source of Fund (Financier)` | Select / Text | `Government of Bangladesh (GoB)`, `World Bank (IDA / IBRD)`, `Asian Development Bank (ADB)`, `JICA (Japan International Cooperation Agency)`, `UNDP / UN Agencies`, `USAID`, `EU (European Union)`, `KFW / AFD / EIB`, `Organization's Own Fund`, `Private / Client Equity` | **Yes** (`+ Custom Source`) |
| `procurementMethod` | `Procurement Method` | Select / Text | `Open Tendering Method (OTM)`, `Single Stage One Envelope (SSOE)`, `Single Stage Two Envelope (SSTE)`, `Two Stage Tendering Method (TSTM)`, `Direct Procurement Method (DPM)` | **Yes** (`+ Custom Method`) |
| `evaluationMethod` | `Evaluation Method` | Select / Text | `Least Cost Selection (LCS)`, `Quality & Cost Based Selection (QCBS)`, `Quality Based Selection (QBS)`, `Fixed Budget Selection (FBS)` | **Yes** (`+ Custom Method`) |

---

### 3.7. Procuring Authority Contact & Helpdesk Information
| Field Name | UI Label | Input Type | Description |
|:---|:---|:---|:---|
| `procurementManagerName` | `Officer Full Name` | Text Input | Official procurement officer / project director (e.g. `Engr. Rafiqul Islam`). |
| `procurementManagerDesignation` | `Official Designation / Title` | Text Input | Title (e.g. `Superintending Engineer (Procurement) & Project Director`). |
| `procurementManagerPhone` | `Direct Phone / Mobile` | Text Input | Official direct phone or mobile (e.g. `+880 1711-234567`). |
| `procurementManagerEmail` | `Official Email` | Email Input | Official procuring email (e.g. `pd@dtca.gov.bd`). |
| `helplinePhone` | `Helpline Number / Hotline` | Text Input | Portal / helpdesk support number (e.g. `+880 2 9568741 or 16123`). |
| `helplineEmail` | `Support Desk Email` | Email Input | Helpdesk email (e.g. `helpdesk@eprocure.gov.bd`). |
| `helplineHours` | `Desk Operating Hours` | Text Input | Support window (e.g. `09:00 AM - 05:00 PM BST (Sun-Thu)`). |

---

### 3.8. Lifecycle Stage & Operational Priority
| Field Name | UI Label | Component | Options & Descriptions |
|:---|:---|:---|:---|
| `stage` | `Lifecycle Stage / Status` | Select Dropdown | - `DISCOVERED`: 1. Bid Discovery & Ingestion<br>- `SCREENING`: 2. Initial Assessment & Pre-Qualification<br>- `UNDER_ANALYSIS`: 3. Under Analysis & Go/No-Go Decision Matrix<br>- `PREPARATION`: 4. Proposal Authoring & Envelope Assembling<br>- `SUBMITTED`: 5. Formally Submitted to Authority<br>- `AWARDED`: 6. Won / Contract Awarded<br>- `LOST`: Closed: Lost / Bid Rejected<br>- `DECLINED`: Closed: Declined / No-Go Decision Executed<br>- `ARCHIVED`: Archived for historical records |
| `priority` | `Operational Priority` | Select Dropdown | - `CRITICAL`: Urgent Action Required (< 48h to deadline or Gate blocker)<br>- `HIGH`: High Value / Strategic Priority<br>- `MEDIUM`: Standard Tender Routine<br>- `LOW`: Low Impact / Long Deadline |

---

## 4. Tab 2: Scope & Commercial (`SCOPE`)

### 4.1. Scope Narrative & Objectives
| Field Name | UI Label | Input Type | Description |
|:---|:---|:---|:---|
| `mainIdea` | `Main Idea & Scope Objectives` | Multiline Textarea (3 rows) | High-level synthesis of project objectives, key architectural deliverables, and commercial scope of work. |

---

### 4.2. Tender Schedule / Form Purchase Terms
| Field Name | UI Label | Input Type | Selection Options / Presets | Description |
|:---|:---|:---|:---|:---|
| `schedulePurchaseDeadline` | `Schedule Buy Deadline` | Date Picker | Valid calendar date | Cutoff date for purchasing official tender schedule/form. |
| `tenderDocPrice` | `Tender Document / Form Fee` | Text Input | Text (e.g. `৳2,000`, `৳5,000`, `Free on e-GP`, `$100 USD`) | Statutory fee to purchase tender documents. |
| `schedulePurchaseMethod` | `Schedule Payment Method` | Select Dropdown | - `ONLINE_EGP` (Online e-GP Payment Gateway)<br>- `PAY_ORDER` (Pay Order / Demand Draft)<br>- `BANK_DEPOSIT` (Direct Bank Deposit / Transfer)<br>- `TREASURY_CHALLAN` (Treasury Challan - Sonali Bank) | Payment instrument accepted by procuring entity. |

---

### 4.3. Tender Security (Earnest Money Deposit - EMD) & Smart 2.5% Reverse Budget Calculator
In public bidding (e.g., e-GP, World Bank), procuring authorities frequently publish the exact **Tender Security Amount** while intentionally withholding the official budget. Since standard procurement guidelines fix tender security at **2.0% – 3.0%** (benchmark: **2.5%**), TenderTracker includes an interactive bidirectional estimator.

| Field Name | UI Label | Input Type | Description |
|:---|:---|:---|:---|
| `tenderSecurityAmount` | `Security Deposit Amount ({tenderCurrency})` | Numeric (Decimal) | Absolute earnest money amount specified in tender notice. |
| `tenderSecurityMethod` | `Security Instrument / Method` | Select Dropdown | - `BANK_GUARANTEE` (Bank Guarantee - BG)<br>- `PAY_ORDER` (Pay Order - PO / Demand Draft)<br>- `ONLINE_PORTAL` (Online Portal Security Deposit)<br>- `TREASURY_CHALLAN` (Treasury Challan) |
| `tenderSecurity` | `Security Description / Specific Bank Requirements` | Text Input | Specific terms (e.g., `Irrevocable unconditional Bank Guarantee valid for 148 days from opening`). |
| `securityPercent` | `Security Percentage Benchmark` | Interactive Chips | Selectable percentage chips: `1.0%`, `2.0%`, `2.5%`, `3.0%`, `5.0%`. Default: `2.5%`. |

#### Calculator Operation Modes:
1. **Reverse Estimator (From Security → Estimated Budget):**
   $$\text{Implied Procurement Budget} = \frac{\text{Tender Security Amount}}{\text{Security \%} / 100}$$
   *Includes a 1-click **"⚡ Set Estimated Budget"** action button.*
2. **Forward Estimator (From Budget → Implied Security):**
   $$\text{Implied Security Deposit} = \text{Estimated Net Value} \times (\text{Security \%} / 100)$$
   *Includes a 1-click **"Set Security Amount"** action button.*

---

### 4.4. Contract Terms & Guarantees
| Field Name | UI Label | Input Type | Example Values |
|:---|:---|:---|:---|
| `contractPeriod` / `possiblePeriod` | `Execution / Contract Period` | Text Input | `180 Days`, `12 Months`, `24 Months` |
| `maintenancePeriod` | `Support & Maintenance Period` | Text Input | `36 Months 24/7 SLA & Comprehensive Warranty (O&M)` |
| `performanceSecurity` | `Performance Security` | Text Input | `10% of Contract Value in BG format valid for 18 months` |
| `estimatedValue` | `Estimated Net Value ({tenderCurrency})` | Numeric Input | Bounded contract ceiling or financial bid amount. |

---

### 4.5. Technical Requirements List
- **Field Name:** `technicalReqs` (Array of Strings)
- **UI Label:** `Technical Requirements`
- **Component:** Dynamic line-by-line list with `+ Add line` and individual delete actions.
- **Purpose:** Key functional capabilities, tech stack mandates (e.g., PostgreSQL, Microservices, Kubernetes), or mandatory technical features.

---

## 5. Tab 3: Financial Scenarios & Rules (`FINANCIAL`)

Operated via [`FinancialScenariosEditor.tsx`](file:///f:/Tender%20tracker%20v2/frontend/src/components/tender/FinancialScenariosEditor.tsx). It models comprehensive cash flow projections, working capital exposure, payment triggers, and net financial realization.

### 5.1. Working Capital Risk & Payment Scenarios
- **Working Capital Risk Selector:** Radio Button Chips (`LOW`, `MEDIUM`, `HIGH`)
- **4 Disbursement Scenario Cards:**

| Scenario Key | Scenario Title | Description | Working Capital Exposure |
|:---|:---|:---|:---|
| `MILESTONE_BASED` | **Milestone-Based** | Payment released in phased tranches upon client approval of specified deliverables. | **Medium Risk:** Dependent on client turnaround speed for reviews. |
| `ADVANCE_AND_MILESTONES` | **Advance + Milestones** | 10%–20% mobilization advance against Bank Guarantee, amortized pro-rata across milestone invoices. | **Low Risk:** Upfront liquidity significantly reduces financing costs. |
| `ACCEPTANCE_BASED` | **Acceptance-Based** | Payments tied strictly to formal UAT or Final Acceptance Certificate (FAC) review signoffs. | **Medium-High Risk:** Vulnerable to bureaucratic acceptance delays. |
| `LUMP_SUM_FINAL` | **Final Lump-Sum Only** | 100% payment deferred until full project delivery and final handover. | **High Risk:** Contractor must self-finance entire contract duration. |

---

### 5.2. Mobilization Advance Terms & Recovery
| Field Name | UI Label | Input Type | Options / Range | Description |
|:---|:---|:---|:---|:---|
| `advancePayment.enabled` | `Enable Mobilization Advance` | Checkbox Toggle | `true` / `false` | Enables advance payment modeling section. |
| `advancePayment.percentage` | `Advance Percentage (%)` | Numeric (Step: 0.5) | `0%` to `100%` (Typical: 10% – 20%) | Percentage of total contract paid upfront. |
| `advancePayment.amount` | `Advance Amount ({curSymbol})` | Numeric | Currency amount | Auto-calculated from percentage or manual override. |
| `advancePayment.recoveryType` | `Advance Recovery Method` | Select Dropdown | - `PRO_RATA_INVOICE` (Pro-Rata Invoice Deduction)<br>- `INTERIM_CERTIFICATES` (Interim Milestone Deduction)<br>- `BALLOON_RECOVERY` (Balloon Recovery at Final Phase) | Amortization schedule to claw back advance. |
| `advancePayment.recoveryPercentagePerInvoice` | `Recovery % per Invoice` | Numeric (Step: 0.5) | `0%` to `100%` | Percentage deducted from each billing invoice until advance is fully recovered. |
| `advancePayment.bankGuaranteeRequired` | `Mandatory Advance Bank Guarantee` | Checkbox | `true` / `false` | Procuring entity requirement to supply Advance Bank Guarantee. |
| `advancePayment.bankGuaranteeType` | `Guarantee Instrument Format / Specifics` | Text Input | Free text (e.g., `Unconditional First Demand Bank Guarantee valid for 180 days`) | Legal format required for advance guarantee. |

---

### 5.3. Milestone Payment Schedule Builder
A dynamic ledger for defining phased milestone tranches with real-time percentage sum validation (must equal **100%**).

#### Header Toolbar Actions:
- **Sum Indicator:** Visual badge showing `Sum: X% (Needs 100%)` (Amber) vs `100% Balanced` (Emerald).
- **`Sync Amounts` Button:** Recalculates milestone currency amounts based on the tender's current estimated net value.
- **`Auto-Balance` Button:** Evenly divides 100% across all created milestones.
- **`Add Milestone` Button:** Appends a new milestone tranche.

#### Milestone Item Attributes (`MilestonePaymentItem`):
| Attribute Name | UI Label | Component | Options / Values |
|:---|:---|:---|:---|
| `milestoneNumber` | `#` | Badge | Auto-numbered sequence (1, 2, 3...). |
| `name` | `Milestone Name / Phase` | Text Input | e.g. `Milestone 1: Inception & SRS Sign-off`, `Milestone 2: Beta UAT`. |
| `deliverable` | `Linked Deliverable / Work Product` | Text Input | e.g. `Approved System Architecture & SRS Document`. |
| `percentage` | `Share %` | Numeric Input | Percentage of contract price (e.g. `20%`). |
| `amount` | `Amount ({curSymbol})` | Numeric Input | Calculated currency value. |
| `clientReviewDays` | `Review Window` | Numeric (Days) | Number of days client has to approve deliverable (e.g. `14 days`). |
| `paymentProcessingDays` | `Payment Term` | Select Dropdown | `Net 15 Days`, `Net 30 Days`, `Net 45 Days`, `Net 60 Days`, `Net 90 Days`. |
| `approvalRequired` | `Client Sign-Off Required` | Checkbox | `true` / `false`. |
| `paymentTrigger` | `Payment Trigger Condition` | Select Dropdown | - `UPON_SRS_APPROVAL` (Upon SRS Approval)<br>- `UPON_ACCEPTANCE` (Upon Client Acceptance)<br>- `UPON_UAT_ACCEPTANCE` (Upon UAT Sign-off)<br>- `UPON_GO_LIVE` (Upon Go-Live Commissioning)<br>- `UPON_FINAL_ACCEPTANCE` (Upon Final Acceptance - FAC)<br>- `UPON_INVOICE_SUBMISSION` (Upon Invoice Submission) |
| `invoiceRequirements` | `Required Invoicing Documents` | Text Input | e.g. `Work Completion Certificate, Signed UAT Sheet & Tax Invoice`. |

---

### 5.4. SaaS & Recurring Revenue Modeler (TCV / ACV)
For cloud subscriptions, managed services, and multi-year software licenses.

| Field Name | UI Label | Component | Selection Options / Allowed Values |
|:---|:---|:---|:---|
| `subscriptionModel.pricingModel` | `Pricing Structure Model` | Select Dropdown | - `MULTI_YEAR_ESCALATION` (Multi-Year with Escalation %)<br>- `FIXED_RECURRING` (Fixed Periodic Subscription)<br>- `PER_USER_LICENSE` (Per-User / Seat License)<br>- `HYBRID_TIERED` (Hybrid Base + Per-User License) |
| `subscriptionModel.billingFrequency` | `Billing Frequency` | Select Dropdown | - `ANNUAL` (Annual In Advance)<br>- `QUARTERLY` (Quarterly In Advance)<br>- `MONTHLY` (Monthly Billing) |
| `subscriptionModel.durationYears` | `Contract Duration (Years)` | Numeric (1 to 10) | Contract term length in years. |
| `subscriptionModel.annualEscalationRate` | `Annual Escalation Rate (%)` | Numeric (Step: 0.5) | Percentage compound price increase each year (e.g., `5%`). |
| `subscriptionModel.annualBaseFee` | `Base Annual Fee (Year 1)` | Numeric Currency | Year 1 base subscription amount (for non-user models). |
| `subscriptionModel.userCount` | `Expected User Count` | Numeric Integer | Number of billable user seats (for `PER_USER_LICENSE`). |
| `subscriptionModel.feePerUserMonthly` | `Fee per User / Month` | Numeric Currency | Monthly cost per seat (for `PER_USER_LICENSE`). |

#### Computed SaaS Metrics Display:
- **Total Contract Value (TCV):** Cumulative revenue over full duration including annual escalations.
- **Annual Contract Value (ACV):** Average annualized recurring revenue ($TCV / Duration$).
- **Year-by-Year Schedule Tiers:** Interactive chips displaying $Y1, Y2, Y3 \dots Y_n$ cash amounts.

---

### 5.5. Liquidated Damages, Retention & Statutory Tax Deductions
| Sub-Section | Field Name | UI Label | Component | Options / Defaults |
|:---|:---|:---|:---|:---|
| **Liquidated Damages** | `liquidatedDamages.enabled` | `Applicable` | Checkbox | `true` / `false` |
| | `liquidatedDamages.rate` | `Penalty Rate (%)` | Numeric | e.g. `0.5%` |
| | `liquidatedDamages.frequency` | `Frequency` | Select Dropdown | `PER_WEEK` (Per Week of Delay), `PER_DAY` (Per Calendar Day) |
| | `liquidatedDamages.maxCapPercentage` | `Max Cap (%)` | Numeric | e.g. `10%` of contract value |
| | `liquidatedDamages.calculationBasis` | `Calculation Basis` | Select Dropdown | - `DELAYED_MILESTONE_VALUE` (Delayed Deliverable Value Only - Recommended)<br>- `TOTAL_CONTRACT_VALUE` (Total Full Contract Value - High Risk) |
| **Retention Money** | `retentionMoney.enabled` | `Withholding Active` | Checkbox | `true` / `false` |
| | `retentionMoney.percentage` | `Retention Rate (%)` | Numeric | e.g. `5%` or `10%` |
| | `retentionMoney.dlpMonths` | `DLP Period (Months)` | Numeric | e.g. `12`, `24`, or `36` months |
| | `retentionMoney.releaseCondition` | `Release Condition` | Select Dropdown | - `DLP_EXPIRY` (100% Release upon Expiry of Defect Liability Period)<br>- `FINAL_ACCEPTANCE_50_DLP_50` (50% upon FAC + 50% upon DLP Expiry)<br>- `BG_SUBSTITUTION` (Immediate Release Against Retention Bank Guarantee) |
| **Statutory Taxes** | `taxDeductionAtSourcePercent` | `Tax Deducted at Source (TDS %)` | Numeric | Statutory tax deduction (Default: `5.0%`). |
| | `vatDeductionAtSourcePercent` | `VAT Deducted at Source (VDS %)` | Numeric | Statutory VAT deduction (Default: `7.5%`). |
| | `slaDeductionRate` | `SLA Breach Deduction Max Rate (%)` | Numeric | Maximum permissible service penalty (Default: `1.0%`). |

---

### 5.6. Expected Net Cash Flow Realization Waterfall Ledger
A dark-mode projection card computing net liquidity during execution versus funds locked until the Defect Liability Period (DLP) concludes:

$$\text{Gross Contract Base} = \text{Total Estimated Contract Value}$$
$$\text{Retention Withheld} = \text{Gross Contract Base} \times \left(\frac{\text{Retention \%}}{100}\right)$$
$$\text{Tax Withholdings} = \text{Gross Contract Base} \times \left(\frac{\text{TDS \%} + \text{VDS \%}}{100}\right)$$
$$\textbf{Net Operating Realization} = \text{Gross Contract Base} - \text{Retention Withheld} - \text{Tax Withholdings}$$
$$\textbf{Final Realized Liquidity} = \text{Net Operating Realization} + \text{Retention Withheld (Post-DLP)}$$

---

## 6. Tab 4: Eligibility & JV (`ELIGIBILITY`)

Captures minimum mandatory qualification criteria to evaluate organizational compliance and Joint Venture (JV) structuring.

### 6.1. General & Financial Experience Thresholds
| Field Name | UI Label | Input Type | Description & Typical Format |
|:---|:---|:---|:---|
| `generalExperience` | `General Experience` | Text Input | Minimum years of overall business operation (e.g. `Minimum 5 (five) years in general IT & Software services`). |
| `similarExperience` | `Similar Experience` | Text Input | Specific contract credentials (e.g. `Successfully completed at least 1 (one) similar enterprise portal within past 3 years`). |
| `similarProjectValue` | `Similar Project Minimum Value` | Text Input | Minimum financial size of a single past project (e.g. `Minimum ৳15.00 Crore in a single work order`). |
| `avgTurnover` | `Average Annual Turnover` | Text Input | Average Annual Turnover (AATO) requirement (e.g. `Best 3 years of last 5 years minimum ৳25.00 Crore`). |
| `financialResources` | `Financial Resources / Liquid Assets` | Text Input | Minimum working capital or bank credit line (e.g. `Minimum ৳5.00 Crore in liquid assets or line of credit`). |
| `certification` | `Required Quality Certifications` | Text Input | Mandatory standards (e.g. `ISO 9001:2015, ISO 27001:2013, CMMI Level 3 or higher`). |
| `localPresence` | `Local Presence Requirements` | Text Input | Jurisdiction footprint (e.g. `Must possess registered office in Dhaka, Bangladesh with dedicated support center`). |

---

### 6.2. Joint Venture (JV) & Consortium Rules
Stored under `summary.jv`:

| Field Name | UI Label | Description |
|:---|:---|:---|
| `jvParticipation` | `JV Participation Modality` | Permissibility of JV (e.g. `Allowed up to maximum 3 (three) partners. Subcontracting not permitted`). |
| `leadMember` | `Lead Partner Minimum Share & Rules` | Lead partner equity rules (e.g. `Lead partner must hold minimum 51% equity and satisfy all similar project credentials`). |
| `memberRules` | `Other Member Minimum Share & Criteria` | Non-lead partner rules (e.g. `Each other member must hold minimum 20% equity and satisfy financial turnover pro-rata`). |
| `localPartner` | `Local Partner Requirements` | Mandatory local partner rules (e.g. `Foreign lead bidder must include at least 1 local Bangladeshi registered firm`). |
| `jvAgreement` | `JV Agreement & Legal Undertakings` | Legal execution requirements (e.g. `Joint Venture Agreement notarized on ৳300 non-judicial stamp with Power of Attorney`). |

---

## 7. Tab 5: Staff & Hardware (`STAFFING`)

### 7.1. Submission Documents Checklist
- **Field Name:** `documents` / `submissionDocuments` (Array of Strings)
- **UI Label:** `Documents Required in Submission`
- **Component:** Dynamic list with `+ Add Document` and row deletion.
- **Examples:**
  - `Valid Trade License (Renewed for current fiscal year)`
  - `TIN Certificate & Latest Year Tax Return Acknowledgment Slip`
  - `BIN / VAT 13-digit Registration Certificate`
  - `Bank Solvency Certificate & Unconditional Credit Line (Form PG3-8)`
  - `Audited Balance Sheets for the last 3 (three) financial years`
  - `Original Manufacturer Authorization Form (MAF) from OEM`

---

### 7.2. CV & Key Personnel Dossier Table (`personnel[]`)
| Column Header | Field Name | Input Type | Description & Examples |
|:---|:---|:---|:---|
| `Position Title` | `position` | Text Input | Role title (e.g. `Team Leader / Project Manager`, `Lead Software Architect`, `Senior Database Specialist`). |
| `Min. Qualification` | `qualification` | Text Input | Degree/Certification (e.g. `B.Sc. in CSE/EEE, PMP / Prince2 certified`). |
| `Experience` | `experience` | Text Input | Minimum years (e.g. `10+ years overall, 5+ years in national portal design`). |
| `Qty` | `qty` | Text Input (Centered) | Number of resources required for this position (e.g. `1`, `2`, `4`). |
| `Action` | N/A | Button | Trash icon to delete personnel requirement. |

---

### 7.3. Key Hardware & Infrastructure Equipment Table (`hardware[]`)
| Column Header | Field Name | Input Type | Description & Examples |
|:---|:---|:---|:---|
| `Equipment Specification` | `equipment` | Text Input | Hardware specs (e.g. `2x Enterprise Rack Servers, 64-Core Xeon, 256GB RAM, Dual 10Gbps SFP+`). |
| `Deployment Role / Purpose` | `purpose` | Text Input | Architectural role (e.g. `High-Availability Production Database Cluster with SAN Storage`). |

---

## 8. Tab 6: Dates, Risks & Notes (`RISKS`)

### 8.1. Comprehensive Procurement & Project Milestones Schedule (Req #20)
| Field Name | UI Label | Input Type | Description |
|:---|:---|:---|:---|
| `clarificationDeadline` | `Clarification Deadline` | Date Picker | Final date to submit queries / attend pre-bid meeting. |
| `openingDate` | `Tender Document / Bid Opening Date` | Date Picker | Date when technical bids are publicly opened. |
| `contractSigningDate` | `Contract Signing Date` | Date Picker | Estimated date of formal contract execution. |
| `workStartDate` / `contractStart` | `Work / Project Start Date (W.O.)` | Date Picker | Official date of Work Order (W.O.) or commencement. |
| `possiblePeriod` | `Possible / Execution Period` | Text Input | Delivery duration (e.g. `180 Days / 6 Months`). |
| `productHandoverDate` | `Product / System Handover Date` | Date Picker | Target date for User Acceptance Testing (UAT) signoff. |
| `maintenancePeriod` | `Support and Maintenance / Warranty Period` | Text Input | Full warranty period (e.g. `36 Months 24/7 SLA & Warranty`). |

---

### 8.2. Key Risks & Important Points Matrix (`risks[]`)
Dynamic risk ledger evaluating operational vulnerabilities:

| Column / Control | Field Name | Input Type | Allowed Options / Values |
|:---|:---|:---|:---|
| `Risk Classification` | `type` | Select Dropdown | - `Tender Requirement` (Stipulated in the tender terms)<br>- `Analyst Observation` (Identified by internal commercial review) |
| `Risk Description` | `text` | Text Input | Specific caveat senior management and bidding teams must evaluate. |
| `Action` | N/A | Button | `+ Add Risk Point` / Trash delete button. |

---

### 8.3. Management Highlights & Internal Debrief Notes
| Field Name | UI Label | Component | Description |
|:---|:---|:---|:---|
| `management` / `managementHighlights` | `Management Highlights` | Array of Strings | Executive summary points for the `GO` / `NO-GO` committee. |
| `notes` | `Internal Remarks & Debrief Notes` | Multiline Textarea | Confidential internal notes, competitive intelligence, or pricing insights. |

---

## 9. Tab 7: Important Clauses & Compliance Matrix (`CLAUSES`)

Operated via [`ImportantClausesManager.tsx`](file:///f:/Tender%20tracker%20v2/frontend/src/components/tender/ImportantClausesManager.tsx). Manages critical clauses, verbatim text quotations, page references, and legal/commercial risk implications.

### 9.1. Clause Categories & Criticality Tiers

#### Categories (`ClauseCategory`):
- `FINANCIAL`: Financial & Guarantees (Bid Security, Performance Security, Mobilization Advance)
- `LEGAL_RISK`: Legal & Risk Exposure (Governing Law, Dispute Resolution, Indemnity, Intellectual Property)
- `TECHNICAL_MANDATORY`: Technical Mandatory (Non-negotiable functional/architectural deliverables)
- `ELIGIBILITY`: Eligibility & Turnover (Experience thresholds, JV equity, AATO)
- `PENALTY`: Penalties & LD Cap (Delay deductions, SLA breach penalties)
- `OTHER`: General / Other (Administrative, packaging, or submission terms)

#### Criticality Levels (`ClauseCriticality`):
- `CRITICAL`: Immediate deal blocker. Non-compliance results in outright technical bid rejection.
- `HIGH`: Major financial or delivery risk. Requires executive approval or mitigation plan.
- `MEDIUM`: Standard contractual obligation requiring tracking.

---

### 9.2. Clause Schema Fields (`ImportantClause`)
| Field Name | Modal Label | Component | Description |
|:---|:---|:---|:---|
| `clause_title` | `Clause Title` | Text Input | Short descriptive name (e.g. `Liquidated Damages Cap & Calculation Basis`). |
| `category` | `Clause Category` | Select Dropdown | One of the 6 categories above. |
| `criticality` | `Criticality Level` | Select Dropdown | `CRITICAL`, `HIGH`, or `MEDIUM`. |
| `doc_reference` | `Document Reference` | Text Input | Section and clause citation (e.g. `Section 4 (GCC) Clause 27.1`). |
| `doc_file_name` | `Source Document File` | Select Dropdown | Linked uploaded file in the tender vault (e.g. `RFP_Volume_1_ITB.pdf`). |
| `page_number` | `Page Citation` | Text Input | Exact page number (e.g. `Page 62`). |
| `clause_text` | `Exact Clause Text (Verbatim)` | Multiline Textarea | Unmodified text quoted directly from the RFP document. |
| `implication` | `Commercial & Legal Implication` | Multiline Textarea | Analyst risk assessment and operational mitigation strategy. |

---

### 9.3. Pre-Configured Standard Presets
Users can insert standard presets with one click:
1. **Bid Security Bank Guarantee Requirement** (`FINANCIAL` / `CRITICAL`): 7-day bank processing lead time and exact Schedule C-1 format verification.
2. **Liquidated Damages (LD) & Delay Cap** (`PENALTY` / `HIGH`): 0.5% per week up to 10% maximum; requires 2–3 weeks scheduling buffer.
3. **JV Lead Partner Minimum Equity & Experience** (`ELIGIBILITY` / `CRITICAL`): Minimum 51% lead equity and 60% turnover requirements on non-judicial stamp.
4. **Defect Liability Period (DLP) & Retention Money** (`LEGAL_RISK` / `MEDIUM`): 5% contract value locked for 12 months post-handover.
5. **OEM Manufacturer Authorization Form (MAF)** (`TECHNICAL_MANDATORY` / `CRITICAL`): Non-negotiable original signed/stamped OEM letter.

---

## 10. Summary Data Dictionary & JSON Schema Mapping

When saving a tender via `handleSaveEntry`, all tab inputs are consolidated into the canonical `Tender` entity:

```typescript
{
  "id": "TDR-2026-9412",
  "referenceNo": "GD-14/DTCA/2026-01",
  "title": "Design, Development & Implementation of Intelligent Traffic System",
  "organization": "Dhaka Transport Coordination Authority (DTCA)",
  "country": "Bangladesh",
  "category": "Software & Web Application Development",
  "priority": "HIGH",
  "stage": "UNDER_ANALYSIS",
  "decision": "PENDING",
  "estimatedValue": 1250000,
  "currency": "USD",
  "exchangeRateToBdt": 122.0,
  "exchangeRateDate": "2026-09-24",
  "estimatedValueBdt": 152500000,
  "publishedDate": "2026-09-20T09:00:00+06:00",
  "publishedHour": "09",
  "publishedMinute": "00",
  "publishedTimezone": "BST",
  "submissionDeadline": "2026-10-25T14:00:00+06:00",
  "closeHour": "14",
  "closeMinute": "00",
  "closeTimezone": "BST",
  "aiChatShareLink": "https://chatgpt.com/share/67a213ff-example",
  "tenderType": "Request for Proposals (RFP)",
  "parentEoiId": "TDR-2026-1002",
  "budgetType": "Development Budget (ADP / Capex)",
  "sourceOfFund": "World Bank (IDA / IBRD)",
  "procurementMethod": "Single Stage Two Envelope (SSTE)",
  "evaluationMethod": "Quality & Cost Based Selection (QCBS)",
  "procurementManagerName": "Engr. Rafiqul Islam",
  "procurementManagerDesignation": "Project Director",
  "procurementManagerPhone": "+880 1711-234567",
  "procurementManagerEmail": "pd@dtca.gov.bd",
  "helplinePhone": "+880 2 9568741",
  "helplineEmail": "helpdesk@eprocure.gov.bd",
  "helplineHours": "09:00 AM - 05:00 PM BST (Sun-Thu)",
  "schedulePurchaseDeadline": "2026-10-20",
  "schedulePurchaseMethod": "ONLINE_EGP",
  "tenderDocPrice": "৳5,000",
  "tenderSecurityAmount": 31250,
  "tenderSecurityMethod": "BANK_GUARANTEE",
  "financialModel": {
    "paymentScenario": "ADVANCE_AND_MILESTONES",
    "workingCapitalRisk": "LOW",
    "advancePayment": {
      "enabled": true,
      "percentage": 15,
      "amount": 187500,
      "bankGuaranteeRequired": true,
      "bankGuaranteeType": "Unconditional First Demand Bank Guarantee",
      "recoveryType": "PRO_RATA_INVOICE",
      "recoveryPercentagePerInvoice": 15
    },
    "milestones": [
      {
        "milestoneNumber": 1,
        "name": "Phase 1: Inception & SRS Sign-off",
        "deliverable": "Approved SRS & System Architecture Document",
        "percentage": 25,
        "amount": 312500,
        "approvalRequired": true,
        "clientReviewDays": 14,
        "paymentProcessingDays": 30,
        "paymentTrigger": "UPON_SRS_APPROVAL",
        "invoiceRequirements": "Inception Report & Tax Invoice"
      }
    ],
    "subscriptionModel": {
      "pricingModel": "MULTI_YEAR_ESCALATION",
      "billingFrequency": "ANNUAL",
      "annualBaseFee": 120000,
      "durationYears": 3,
      "annualEscalationRate": 5,
      "calculatedTcv": 378300,
      "calculatedAcv": 126100
    },
    "penaltiesAndDeductions": {
      "liquidatedDamages": {
        "enabled": true,
        "rate": 0.5,
        "frequency": "PER_WEEK",
        "calculationBasis": "DELAYED_MILESTONE_VALUE",
        "maxCapPercentage": 10
      },
      "retentionMoney": {
        "enabled": true,
        "percentage": 5,
        "releaseCondition": "DLP_EXPIRY",
        "dlpMonths": 12
      },
      "taxDeductionAtSourcePercent": 5,
      "vatDeductionAtSourcePercent": 7.5,
      "slaDeductionRate": 1
    }
  },
  "importantClauses": [
    {
      "id": "cls-01",
      "clause_title": "Bid Security Bank Guarantee Requirement",
      "category": "FINANCIAL",
      "criticality": "CRITICAL",
      "doc_file_name": "RFP_Volume_1_ITB.pdf",
      "doc_reference": "Section 2 (ITB) Clause 14.1",
      "page_number": "Page 28",
      "clause_text": "The Bidder shall furnish as part of its Bid, a Bid Security in the amount of $31,250...",
      "implication": "Must issue Bank Guarantee at least 7 days prior to bid submission."
    }
  ]
}
```

---

## 11. Maintenance & Extension Guidelines

1. **Adding a New Form Field**:
   - Register the property in [`frontend/src/types/tender.ts`](file:///f:/Tender%20tracker%20v2/frontend/src/types/tender.ts) under `Tender` and `TenderExtendedSummary`.
   - Add state variable, sync hook, and `handleSaveEntry` serializer in [`frontend/src/pages/TenderRegistryPage.tsx`](file:///f:/Tender%20tracker%20v2/frontend/src/pages/TenderRegistryPage.tsx).
   - Update backend Pydantic models in [`backend/app/schemas/tender.py`](file:///f:/Tender%20tracker%20v2/backend/app/schemas/tender.py) and SQLAlchemy column/JSON mapping in [`backend/app/models/tender.py`](file:///f:/Tender%20tracker%20v2/backend/app/models/tender.py).
2. **Synchronizing Knowledge Graph**:
   - Run `python "tools/graphify/graphify.py"` after any field schema modification to update context maps.

