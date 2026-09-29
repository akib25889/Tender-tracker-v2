# TENDER SUMMARY
## Master Template & Standing Instructions
*Self-contained working document — no separate prompt file required.*  
*Paste or upload this whole document, together with the tender PDF / RFP files, to any AI assistant and ask it to produce the Tender Summary.*

---

### HOW TO USE THIS DOCUMENT
Give the AI this entire document plus all tender files.
- **Part 1** is the strict content rules and extraction guidelines.
- **Part 2** is the visual and markdown layout specification.
- **Part 3** is the fillable template containing every single field and data point required by the TenderTracker platform.
- **Part 4** is a complete worked reference example demonstrating the exact style, tone, and format to produce.

The AI fills Part 3's structure with tender-supported facts, deletes any optional section that does not apply to this tender (e.g. Hardware if none is needed), includes the machine-readable system sync block (`tender_tracker_data`) at the end, and outputs the finished document. Guidance notes and Part 4's fictional content must not appear in the final summary.

---

# PART 1 — RULES FOR THE AI (Read Before Drafting)

### 1.1 Purpose of This Document
Produce a simple, concise, informative Tender Summary for senior management and the proposal engineering team. It gives decision-makers a complete understanding of the tender and captures all information needed to populate the TenderTracker command center.
- **This is NOT a full proposal or lengthy analysis** — do not overload it with unnecessary boilerplate.
- **Target length:** Approximately 2–5 pages in standard layout.

### 1.2 Step 1 — Check Software / IT Relevance First
Before preparing anything else, determine whether the tender relates to: Software, IT, ICT, digital systems, information systems, data, technology, software development, system implementation, IT operation/maintenance, or technology infrastructure.

Classify the tender as exactly one of:
- `SOFTWARE / IT RELATED`
- `PARTIALLY SOFTWARE / IT RELATED`
- `NOT SOFTWARE / IT RELATED`
- `UNCLEAR`

*Do not assume a tender is software-related.* It only qualifies when it contains a meaningful software, IT, ICT, digital, data, information-system, or technology component. If it is not software-related, state that prominently at the top of the summary.

### 1.3 Do Not Assume Anything
Use only information directly supported by the tender documents. Never assume: technology stack, programming language, framework, database, cloud platform, architecture, software tools, eligibility, JV requirement, local partner requirement, budget, experience requirement, certification, team requirement, evaluation method, contract duration, or submission requirements.
- If information is not found in the documents, write exactly:  
  `"Not specified in the tender documents."`
- If information cannot be determined:  
  `"Cannot be determined from the available documents."`

### 1.4 Technology Rule
Never assume a technology stack. If the tender explicitly names a technology, quote exactly that.
- Tender says *"Oracle Database"* $\rightarrow$ write `"Oracle Database"`.
- Tender says *"Web-based application"* $\rightarrow$ write `"Web-based application"`. Do NOT expand this into a speculative stack (e.g. *"React + FastAPI + PostgreSQL + AWS"*) unless the tender explicitly commands it.
- If no technology is mentioned $\rightarrow$ write: `"Software / Technology: Not specified in the tender documents."`
- Do not provide unsolicited technology recommendations.

### 1.5 JV / Consortium Rule
Only report what the tender itself explicitly states about Joint Ventures (JV), consortiums, subcontracting, lead members, or local partner requirements.
- *Example:* `"JV participation: Permitted subject to TDS Clause 14 requirements."`
- *Example:* `"JV: Not specified in the tender documents."`
- *Example:* `"JV: Not permitted according to ITT Clause 4.1."`

**Do NOT say:** *"we need a JV"*, *"we should form a consortium"*, or *"we need a partner because we lack qualification"*. The Bid / No-Bid and partnering strategy is decided exclusively by management — this summary only reports the tender's legal position.

### 1.6 Writing Style
- Simple, professional business English understandable to an executive who has not read the tender.
- Short paragraphs, clean bullet points, compact tables, clear bold headings.
- **Bold important numbers, monetary figures, and deadlines.**
- Avoid long academic prose, excessive technical jargon, repeating tender boilerplate, or large blockquotes.
- **Tone:** Professional · Concise · Informative · Decision-oriented.

### 1.7 Source Accuracy
Cross-verify key facts against the tender documents, especially:
- Tender ID and Reference Number
- Submission Deadline & Time (including timezone)
- Tender Security (EMD / Bid Bond) amount and method
- Contract Duration & Maintenance Period
- Eligibility Criteria (General years, Similar project count/value, Annual turnover, Liquid assets)
- JV Rules & Subcontracting Limits
- Required Key Personnel & Hardware
- Mandatory Submission Document Checklist

*If different sections of the tender disagree (e.g. NIT vs TDS), explicitly note the conflict and identify which clauses disagree.*

### 1.8 Information Priority Order
When deciding what to include, prioritize in this order:
1. Tender relevance & IT classification
2. What the client wants
3. Main scope of work
4. Software / technology requirements
5. Eligibility & qualification criteria
6. JV / consortium position
7. Commercial requirements & tender security
8. Required personnel & hardware
9. Required submission documents
10. Important dates & milestones
11. Major risks & compliance blockers
12. Management decision points

### 1.9 Section Relevance — Remove What Doesn't Apply
Keep only sections that apply to this specific tender. Do not leave empty placeholder sections in the final summary.
- If no hardware/equipment is required $\rightarrow$ omit the Hardware section entirely.
- If no CVs or named experts are requested $\rightarrow$ omit the CV/Personnel section entirely.
- If no post-award data exists $\rightarrow$ omit the Post-Award section.

### 1.10 Final Quality Check (Before Delivering)
- [ ] Software/IT relevance was checked first, and not assumed.
- [ ] Main idea is clear, concise (2–4 sentences), and focused on client deliverables.
- [ ] No technology stack was guessed; only explicitly named tools/standards appear.
- [ ] Eligibility and JV terms quote the tender's actual thresholds.
- [ ] No bid recommendation was made on management's behalf.
- [ ] Required documents, personnel, and hardware reflect only stated requirements.
- [ ] Submission deadline and opening time are accurate and bolded.
- [ ] 3–6 key risks are highlighted, each strictly labeled `[Tender Requirement]` or `[Analyst Observation]`.
- [ ] Missing information is clearly marked as `"Not specified in the tender documents."`
- [ ] Machine-readable `tender_tracker_data` YAML block is included at the end for database ingestion.

---

# PART 2 — DOCUMENT SPECIFICATION & MARKDOWN FORMATTING

The generated summary must be valid, well-structured GitHub Flavored Markdown adhering to these conventions:
1. **Title & Subtitle:** Centered top heading with Tender ID and title.
2. **Tables:**
   - **Basic Information Table:** 2-column table (`| Attribute | Details |`).
   - **Personnel Table:** 5-column table (`| No. | Position | Minimum Qualification | Required Experience | Qty |`).
   - **Hardware Table:** 3-column table (`| No. | Hardware / Equipment | Purpose / Specification Summary |`).
   - **Dates Table:** 3-column table (`| Milestone | Date & Time | Notes |`).
3. **Bullet Points:** Clean, compact bullets for requirements, dates, and management points.
4. **Risk Labels:** Every risk MUST start with either `[Tender Requirement]` (stated fact) or `[Analyst Observation]` (analyst takeaway).
5. **Machine-Readable Ingestion Block:** A fenced ````yaml code block at the very bottom labeled `tender_tracker_data` containing normalized key-value fields for database synchronization.

---

# PART 3 — TENDER SUMMARY TEMPLATE (Fillable Markdown)

*Fill in every field below based on the tender documents. Delete any guidance notes and any unused optional sections before outputting.*

<div align="center">

# TENDER SUMMARY
### Tender ID: [Tender ID] | [Short Tender Title]

**Classification:** [SOFTWARE / IT RELATED | PARTIALLY SOFTWARE / IT RELATED | NOT SOFTWARE / IT RELATED | UNCLEAR]

</div>

## Basic Information

| Attribute | Details |
| :--- | :--- |
| **Country** | [Country, or: Not specified in the tender documents] |
| **Project Name** | [Project Name, or: Not specified in the tender documents] |
| **Tender Title** | [Full Official Tender Title] |
| **Reference No.** | [Tender / Memo / Lot Reference Number] |
| **Tender ID** | [Tender ID / e-GP ID] |
| **Client / Organization** | [Issuing Ministry / Agency / Corporate Entity] |
| **Portal / Source** | [e.g. Bangladesh e-GP (eprocure.gov.bd), UNGM, World Bank Portal, etc.] |
| **Published Date** | [YYYY-MM-DD, HH:MM Timezone, or: Not specified in the tender documents] |
| **Submission Deadline** | **[YYYY-MM-DD, HH:MM Timezone]** |
| **Tender Type** | [e.g. Open Tendering Method (OTM) / RFP / EOI / RFQ / NCB / ICB] |
| **Estimated Value / Budget** | [e.g. BDT 2,50,00,000 / USD 500,000 / Not disclosed] |
| **Currency** | [BDT / USD / EUR / GBP / etc.] |
| **Budget Type** | [Development Budget (ADP / Capex) / Revenue / Own Funds / Grant / Capital] |
| **Source of Funds** | [e.g. GoB / World Bank / ADB / Own Funds / Not specified] |
| **Procurement Method** | [Open Tendering Method (OTM) / Single Stage One Envelope (SSOE) / Single Stage Two Envelope (SSTE) / Direct Procurement Method (DPM)] |
| **Evaluation Method** | [Least Cost Selection (LCS) / Quality & Cost Based Selection (QCBS) / Quality Based Selection (QBS) / Fixed Budget Selection (FBS)] |
| **Languages** | [e.g. English, Bengali] |
| **AI Chat / Knowledge Link** | [URL or: Not specified] |

---

## Contact & Helpline Details

| Role / Contact | Information |
| :--- | :--- |
| **Procurement Manager Name** | [Officer Name or: Not specified in the tender documents] |
| **Designation & Department** | [Job Title / Office or: Not specified] |
| **Official Email** | [Email address or: Not specified] |
| **Office Phone / Mobile** | [Phone number or: Not specified] |
| **Helpline Phone** | [Toll-free / Helpdesk number or: Not specified] |
| **Helpline Email** | [Support email or: Not specified] |
| **Helpline Operating Hours** | [e.g. 09:00 - 17:00 BST, Sun-Thu or: Not specified] |

---

## Requirements

### Main Idea
[2–4 sentence summary: what the tender is about, what problem the client needs solved, what the contractor will deliver, and the core software/digital component if applicable. Do not copy large portions of the tender.]

### Commercial Requirements
- **Tender Security (EMD / Bid Bond):** [Amount, currency, and validity, e.g. BDT 5,00,000 as Bank Guarantee]
- **Tender Security Method:** [Bank Guarantee / Pay Order / Bank Draft / Online Payment]
- **Tender Document Price:** [e.g. BDT 2,000 non-refundable / Free]
- **Contract / Service Period:** [e.g. 18 months implementation + 12 months warranty]
- **Document Purchase Deadline:** [YYYY-MM-DD, HH:MM or: Not specified]
- **Document Purchase Method:** [e.g. e-GP Payment Gateway / Bank Challan / Client Office]
- **Performance Security:** [e.g. 10% of contract value within 14 days of NOA]
- **Payment Terms:** [e.g. Milestone-based against deliverable acceptance / Lump sum / Not specified]

### Technical Requirements
- [Major requirement 1 — what the bidder must actually develop, install, or operate]
- [Major requirement 2]
- [Major requirement 3]
- [Major requirement 4]

### Software / Technology Mentioned
*(List only technologies explicitly named in the tender. Do not assume or suggest an unstated stack.)*
- [Explicitly named technology/standard 1, e.g. Oracle Database 19c]
- [Or: "Software / Technology: Not specifically stated in the tender documents."]

### Operational / Service Requirements
- [e.g. 1 year post-implementation support & maintenance]
- [e.g. User training for 50 department officers]
- [e.g. 99.9% system uptime SLA with 4-hour disaster recovery]

---

## Key Eligibility / Qualification
*(State the tender's requirements as written. Do not evaluate our firm's compliance here.)*
- **General Experience:** [e.g. Minimum 5 years of general business experience / Not specified]
- **Similar Experience:** [e.g. Minimum 1 completed contract of similar IT system within last 3 years]
- **Similar Project Value:** [e.g. Minimum single contract value of BDT 1,50,00,000]
- **Average Annual Turnover:** [e.g. Minimum BDT 3,00,00,000 best 3 years within last 5 years]
- **Liquid Assets / Credit Facility:** [e.g. Minimum BDT 80,00,000 working capital line]
- **Required Certifications:** [e.g. ISO 9001:2015, ISO 27001:2013, CMMI Level 3 / Not specified]
- **Local Presence:** [e.g. Registered office or authorized local agent in country / Not specified]

---

## JV / Consortium
*(State only the tender's explicit rules. Do not include partnering recommendations.)*
- **JV Participation:** [Permitted / Not permitted / Not specified in the tender documents]
- **Lead Member Requirement:** [e.g. Minimum 51% share and meeting 100% of prime experience]
- **Partner Combination Rules:** [e.g. Each partner must meet at least 25% of turnover]
- **Local Partner Requirement:** [e.g. Mandatory 20% local share / Not required]
- **JV Agreement:** [e.g. Registered/notarized JV agreement mandatory with bid submission]

---

## Documents Required in Submission
*(List only documents actually requested in the tender checklist/ITT/TDS.)*
- [ ] [e.g. Letter of Tender / Technical Proposal Submission Form]
- [ ] [e.g. Original Bank Guarantee for Tender Security]
- [ ] [e.g. Valid Trade License, e-TIN, and BIN/VAT Registration Certificates]
- [ ] [e.g. Audited Financial Statements for last 3 fiscal years]
- [ ] [e.g. Client Completion Certificates and Work Orders for similar projects]
- [ ] [e.g. Manufacturer's Authorization Form (MAF) for hardware/licenses]
- [ ] [e.g. Proposed Work Plan, Methodology, and Team CVs]

---

## CV / Personnel Requirements
*(Omit this entire section if no named personnel or key experts are required by the tender.)*

| No. | Position | Minimum Qualification | Required Experience | Qty |
| :---: | :--- | :--- | :--- | :---: |
| 1 | [e.g. Project Manager] | [e.g. B.Sc. in CSE / IT / EEE] | [e.g. 10+ years overall, 5+ years in similar IT project] | 1 |
| 2 | [e.g. Lead Solution Architect] | [e.g. Bachelor's in Software Engineering] | [e.g. 7+ years in enterprise cloud architecture] | 1 |
| 3 | [e.g. Database Specialist] | [e.g. Degree in CS or certified DBA] | [e.g. 5+ years in high-availability RDBMS] | 1 |

---

## Hardware Requirements
*(Omit this entire section if no physical equipment or hardware is being procured.)*

| No. | Hardware / Equipment | Purpose / Specification Summary |
| :---: | :--- | :--- |
| 1 | [e.g. Enterprise Rack Servers] | [e.g. Primary application and database hosting, 64-core, 256GB RAM] |
| 2 | [e.g. Online Rackmount UPS (10 kVA)] | [e.g. Redundant power backup for central server room] |

---

## Important Dates & Milestone Schedule

| Milestone | Date & Time | Notes |
| :--- | :--- | :--- |
| **Clarification / Query Deadline** | [YYYY-MM-DD, HH:MM] | [e.g. Written queries via portal] |
| **Pre-Bid Meeting** | [YYYY-MM-DD, HH:MM] | [e.g. Hybrid / Virtual link / Client HQ] |
| **Schedule Purchase Deadline** | [YYYY-MM-DD, HH:MM] | [e.g. Last date to pay document fee] |
| **Submission Deadline** | **[YYYY-MM-DD, HH:MM]** | **Final closing time — portal locks** |
| **Bid Opening Date** | [YYYY-MM-DD, HH:MM] | [e.g. Technical envelope opening] |
| **Contract Signing Date (Target)** | [YYYY-MM-DD] | [e.g. Expected within 28 days of NOA] |
| **Work Start Date (Commencement)** | [YYYY-MM-DD] | [e.g. Within 14 days of contract signing] |
| **Product Handover Date (UAT)** | [YYYY-MM-DD] | [e.g. Target go-live date] |
| **Maintenance Period** | [e.g. 12 months / 24 months] | [Warranty & SLA support period] |

---

## Key Risks / Important Points
*(Select only 3–6 critical points. Label each strictly as [Tender Requirement] or [Analyst Observation].)*
- **[Tender Requirement]** [e.g. Bidder must submit an unconditional Bank Guarantee of BDT 5,00,000 valid for 148 days from bid opening.]
- **[Tender Requirement]** [e.g. Liquidated damages are assessed at 0.5% per week of delay, capped at 10% of total contract value.]
- **[Analyst Observation]** [e.g. The 14-day turnaround window between pre-bid response and submission is tight for securing foreign OEM authorizations.]
- **[Analyst Observation]** [e.g. Turnover requirement of BDT 3 Cr exceeds standard threshold for this contract size.]

---

## Important for Management
*(3–6 executive decision bullets covering business fit, key opportunity, qualification hurdle, and next step.)*
- **Strategic Fit:** [e.g. Directly aligns with our core capability in public sector enterprise portals.]
- **Scale & Opportunity:** [e.g. Estimated BDT 2.5 Cr scope with guaranteed 1-year paid maintenance.]
- **Critical Qualification Gap to Verify:** [e.g. Confirm whether our 2024 Ministry project completion certificate meets the 1.5 Cr single-contract threshold.]
- **Commercial Exposure:** [e.g. Working capital requirement of BDT 80 Lacs requires bank line verification prior to Bid GO decision.]
- **Hard Deadline:** **[Submission Date & Time]** — [e.g. 18 days remaining].

---

## Important Clauses & Compliance Flags
*(List high-impact contractual clauses found in the tender documents.)*

- **Clause Title:** [e.g. Performance Security Forfeiture]
  - **Category:** `FINANCIAL` | `LEGAL_RISK` | `TECHNICAL_MANDATORY` | `ELIGIBILITY` | `PENALTY` | `OTHER`
  - **Criticality:** `CRITICAL` | `HIGH` | `MEDIUM`
  - **Doc Reference & Page:** [e.g. GCC Clause 44.1, Page 62]
  - **Clause Text:** [Quotation or concise summary of the clause]
  - **Implication:** [What this requires from our team / risk exposure]

---

<!-- SYSTEM AUTOMATION BLOCK: Do not alter the structure of this block. The TenderTracker ingestion engine uses this to automatically sync the summary to every database cell. -->
```yaml
tender_tracker_data:
  # Core Identification
  id: null                          # System will auto-generate TDR-YYYY-XXX if null
  reference_no: "..."
  title: "..."
  organization: "..."
  country: "..."
  category: "..."
  classification: "SOFTWARE / IT RELATED"
  portal_url: "..."
  
  # Stage, Decision, Priority
  stage: "DISCOVERED"
  decision: "PENDING"
  priority: "MEDIUM"

  # Valuations & Currency
  estimated_value: 0.0
  currency: "BDT"
  exchange_rate_to_bdt: 1.0
  exchange_rate_date: "YYYY-MM-DD"
  
  # Dates & Timings
  published_date: "YYYY-MM-DD"
  published_hour: "10"
  published_minute: "00"
  published_timezone: "BST"
  submission_deadline: "YYYY-MM-DD"
  close_hour: "13"
  close_minute: "00"
  close_timezone: "BST"
  opening_date: "YYYY-MM-DD"
  pre_bid_meeting_date: "YYYY-MM-DD"
  contract_signing_date: "YYYY-MM-DD"
  work_start_date: "YYYY-MM-DD"
  possible_period: "18 months"
  product_handover_date: "YYYY-MM-DD"
  maintenance_period: "12 months"

  # Governance & Sourcing
  tender_type: "Open Tendering Method (OTM)"
  budget_type: "Development Budget (ADP / Capex)"
  source_of_fund: "Government of Bangladesh (GoB)"
  procurement_method: "Open Tendering Method (OTM)"
  evaluation_method: "Least Cost Selection (LCS)"
  languages:
    - "English"
    - "Bengali"
  ai_chat_share_link: null

  # Commercial Terms & Security
  schedule_purchase_deadline: "YYYY-MM-DD"
  schedule_purchase_method: "e-GP Online"
  tender_doc_price: "BDT 2,000"
  tender_security_amount: 0.0
  tender_security_method: "Bank Guarantee"
  performance_security: "10% of contract value"

  # Contact & Helpline
  procurement_manager_name: null
  procurement_manager_designation: null
  procurement_manager_email: null
  procurement_manager_phone: null
  helpline_phone: null
  helpline_email: null
  helpline_hours: null

  # Lead Bidder
  lead_owner_name: "NYK Advance Limited"
  lead_owner_role: "Lead Bidder"

  # Eligibility
  eligibility:
    general_experience: "..."
    similar_experience: "..."
    similar_project_value: "..."
    avg_turnover: "..."
    financial_resources: "..."
    certification: "..."
    local_presence: "..."

  # Joint Venture
  jv:
    participation: "..."
    lead_member: "..."
    member_rules: "..."
    local_partner: "..."
    jv_agreement: "..."

  # Financial Model (Cash Flow Scenarios)
  financial_model:
    payment_scenario: "MILESTONE_BASED"
    working_capital_risk: "LOW"
    advance_payment:
      enabled: false
      percentage: 0
      amount: 0
      bank_guarantee_required: false
      recovery_type: "PRO_RATA_INVOICE"
      recovery_percentage_per_invoice: 0
    liquidated_damages:
      enabled: true
      rate: 0.5
      frequency: "PER_WEEK"
      calculation_basis: "TOTAL_CONTRACT_VALUE"
      max_cap_percentage: 10
      grace_period_days: 0
    retention_money:
      enabled: false
      percentage: 0
      release_condition: "DLP_EXPIRY"
      dlp_months: 12

  # Lineage (Optional)
  parent_eoi_id: null
  spawned_rfp_id: null
  eoi_shortlist_status: null

  # Post-Award (Optional)
  post_award: null

  # Important Clauses
  important_clauses:
    - clause_title: "..."
      category: "FINANCIAL"
      criticality: "CRITICAL"
      doc_reference: "GCC 44.1"
      page_number: "62"
      clause_text: "..."
      implication: "..."
```

---

# PART 4 — REFERENCE WORKED EXAMPLE (Clone This Exactly)

*This is a complete worked example using a realistic tender opportunity. Replicate this exact layout, style, and tone for every tender summary.*

<div align="center">

# TENDER SUMMARY
### Tender ID: 9999999 | Sample LMS Software Tender

**Classification:** `SOFTWARE / IT RELATED`

</div>

## Basic Information

| Attribute | Details |
| :--- | :--- |
| **Country** | Bangladesh |
| **Project Name** | Digital Skills Training Program (Sample) |
| **Tender Title** | Supply, Installation and Commissioning of a Learning Management System (LMS) |
| **Reference No.** | SAMPLE/LMS/2026-2027/GR/01 |
| **Tender ID** | 9999999 |
| **Client / Organization** | National Training Institute (Sample) |
| **Portal / Source** | Bangladesh e-GP System (eprocure.gov.bd) |
| **Published Date** | 01-Jan-2026, 10:00 BST |
| **Submission Deadline** | **20-Jan-2026, 13:00 BST** |
| **Tender Type** | Open Tendering Method (OTM) |
| **Estimated Value / Budget** | BDT 50,00,000 (Estimated) |
| **Currency** | BDT |
| **Budget Type** | Development Budget (ADP / Capex) |
| **Source of Funds** | Government of Bangladesh (GoB) |
| **Procurement Method** | Open Tendering Method (OTM) |
| **Evaluation Method** | Least Cost Selection (LCS) |
| **Languages** | English, Bengali |
| **AI Chat / Knowledge Link** | https://gemini.google.com/share/sample-lms |

---

## Contact & Helpline Details

| Role / Contact | Information |
| :--- | :--- |
| **Procurement Manager Name** | Mohammad Rafiqul Islam |
| **Designation & Department** | Director (Procurement & IT), National Training Institute |
| **Official Email** | pd.lms@training.gov.bd |
| **Office Phone / Mobile** | +880-2-9555123 |
| **Helpline Phone** | 16575 (e-GP Helpdesk) |
| **Helpline Email** | helpdesk@eprocure.gov.bd |
| **Helpline Operating Hours** | 09:00 - 17:00 BST, Sun-Thu |

---

## Requirements

### Main Idea
Supply, installation, and commissioning of a cloud-hosted Learning Management System (LMS) for a public training institute, covering course authoring, learner enrolment, online assessments, automated grading, and digital certificate verification for up to 5,000 concurrent learners. The contract includes 1 year of post-go-live technical support and maintenance.

### Commercial Requirements
- **Tender Security (EMD):** **BDT 1,00,000** in the form of a Bank Guarantee or Pay Order from any scheduled bank.
- **Tender Security Method:** Bank Guarantee / Pay Order
- **Tender Document Price:** BDT 2,000 non-refundable via e-GP payment gateway.
- **Contract / Service Period:** 2 years (1 year implementation + 1 year post-go-live technical support).
- **Document Purchase Deadline:** 19-Jan-2026, 16:00 BST.
- **Document Purchase Method:** e-GP Online Payment Gateway
- **Submission Deadline:** **20-Jan-2026, 13:00 BST**.
- **Performance Security:** 10% of contract value payable within 14 days of Notice of Award (NOA).
- **Payment Terms:** Milestone-based against milestone deliverables acceptance.

### Technical Requirements
- Course authoring and digital learning content management module.
- Learner enrolment, cohort management, and progress tracking dashboard.
- Online assessment, automated quiz scoring, and exam proctoring engine.
- Tamper-proof certificate generation and public online verification portal.
- Data export and integration APIs for student registration records.

### Software / Technology Mentioned
- SCORM 1.2 / SCORM 2004 compliance mandatory.
- Hosting platform: *Not specified in the tender documents.*
- Operating System & Database: *Not specified in the tender documents.*

### Operational / Service Requirements
- 1 year of post-go-live comprehensive technical support and SLA-backed bug resolution.
- Comprehensive user training program for 40 institute academic and admin staff.
- Daily automated off-site data backups and documented disaster recovery procedures.

---

## Key Eligibility / Qualification
- **General Experience:** Minimum **3 years** general experience in supply and implementation of IT Goods/services.
- **Similar Experience:** At least **1 completed contract** of LMS or educational software implementation in the last 3 years with a value of not less than **BDT 35,00,000**.
- **Average Annual Turnover:** Minimum **BDT 50,00,000** over the best 3 years within the last 5 years.
- **Financial Resources (Liquid Assets):** Minimum **BDT 15,00,000** in working capital or bank credit line.
- **Required Certification:** Valid **ISO 9001:2015** certification.
- **Local Presence:** Bidder must have an active operational office in Bangladesh.

---

## JV / Consortium
- **JV Participation:** *Not specified in the tender documents.*
- **Subcontracting:** Permitted for a portion of the non-core Goods (cabling/peripherals) per ITT Clause 15, not exceeding 20% of contract value.

---

## Documents Required in Submission
- [ ] Completed Tender Submission Letter (Form e-PG3-1).
- [ ] Valid Trade License, e-TIN Certificate, and BIN/VAT Registration.
- [ ] Audited Financial Balance Sheets and P&L for the past 2 fiscal years.
- [ ] Client Completion Certificate evidencing qualifying similar LMS project.
- [ ] Technical Proposal, System Architecture Overview, and Clause-by-Clause Compliance Sheet.
- [ ] ISO 9001:2015 Quality Certificate.
- [ ] Bank Solvency / Working Capital Certificate from a scheduled bank.

---

## CV / Personnel Requirements

| No. | Position | Minimum Qualification | Required Experience | Qty |
| :---: | :--- | :--- | :--- | :---: |
| 1 | System Administrator | Degree in Computer Science / Engineering | 3+ years in cloud LMS deployment and Linux administration | 1 |
| 2 | Trainer / Support Specialist | Bachelor's Degree in any discipline | 2+ years conducting corporate or institutional end-user software training | 2 |

---

## Hardware Requirements

| No. | Hardware / Equipment | Purpose / Specification Summary |
| :---: | :--- | :--- |
| 1 | Application Server | Enterprise server for hosting the on-premises staging LMS platform |
| 2 | Backup Storage Unit | Network Attached Storage (NAS) unit for daily institutional data recovery |

---

## Important Dates & Milestone Schedule

| Milestone | Date & Time | Notes |
| :--- | :--- | :--- |
| **Clarification Deadline** | 10-Jan-2026, 16:00 BST | Queries to be submitted through e-GP portal |
| **Pre-Bid Meeting** | 12-Jan-2026, 11:00 BST | Conference Room 302, NTI Bhaban, Dhaka |
| **Document Purchase Deadline** | 19-Jan-2026, 16:00 BST | e-GP gateway payment cut-off |
| **Submission Deadline** | **20-Jan-2026, 13:00 BST** | **Electronic bid submission lock** |
| **Tender Opening Date** | 20-Jan-2026, 13:15 BST | Automated e-GP technical bid opening |
| **Contract Signing Date (Target)** | 01-Feb-2026 (Estimated) | Expected within 14 days of NOA issuance |
| **Work Start Date** | 15-Feb-2026 | Kick-off meeting and requirement baseline |
| **Product Handover Date (UAT)** | 15-Jul-2026 | Milestone 4 acceptance and go-live |
| **Maintenance Period** | 12 months | Warranty and 24/7 technical helpdesk |

---

## Key Risks / Important Points
- **[Tender Requirement]** SCORM 1.2/2004 compliance is mandatory — a proposed platform that fails to prove compliance in the technical demonstration will be deemed non-responsive.
- **[Tender Requirement]** 10% Performance Security must be submitted within 14 calendar days of NOA; failure results in immediate forfeiture of the BDT 1,00,000 tender security.
- **[Analyst Observation]** The submission window is under 3 weeks from publication date, requiring immediate preparation of audited accounts and reference certificates.

---

## Important for Management
- **Relevance:** High strategic alignment with our educational software and cloud SaaS portfolio.
- **Main Opportunity:** High-margin 5,000-seat platform with recurring 2-year technical support scope.
- **Biggest Qualification Gap:** Must confirm our 2024 university LMS reference contract qualifies under the BDT 35 Lacs single-contract criterion.
- **Next Action:** Verify bank guarantee issuance timeline for BDT 1 Lac before final GO decision on 08-Jan-2026.
- **Submission Deadline:** **20-Jan-2026 at 13:00 BST**.

---

## Important Clauses & Compliance Flags

- **Clause Title:** Liquidated Damages for Late Handover
  - **Category:** `PENALTY`
  - **Criticality:** `HIGH`
  - **Doc Reference & Page:** GCC Clause 38.1, Page 42
  - **Clause Text:** "The applicable rate for Liquidated Damages is 0.5 percent per week of delay or part thereof. The maximum amount of Liquidated Damages shall be 10 percent of the Contract Price."
  - **Implication:** Requires rigorous milestone tracking; maximum financial liability is capped at BDT 5,00,000.

---

```yaml
tender_tracker_data:
  id: "TDR-2026-9999"
  reference_no: "SAMPLE/LMS/2026-2027/GR/01"
  title: "Supply, Installation and Commissioning of a Learning Management System (LMS)"
  organization: "National Training Institute (Sample)"
  country: "Bangladesh"
  category: "Information & Communication Technology (ICT)"
  classification: "SOFTWARE / IT RELATED"
  portal_url: "https://eprocure.gov.bd"
  stage: "DISCOVERED"
  decision: "PENDING"
  priority: "HIGH"
  estimated_value: 5000000.0
  currency: "BDT"
  exchange_rate_to_bdt: 1.0
  published_date: "2026-01-01"
  published_hour: "10"
  published_minute: "00"
  published_timezone: "BST"
  submission_deadline: "2026-01-20"
  close_hour: "13"
  close_minute: "00"
  close_timezone: "BST"
  opening_date: "2026-01-20"
  pre_bid_meeting_date: "2026-01-12"
  contract_signing_date: "2026-02-01"
  work_start_date: "2026-02-15"
  possible_period: "24 months"
  product_handover_date: "2026-07-15"
  maintenance_period: "12 months"
  tender_type: "Open Tendering Method (OTM)"
  budget_type: "Development Budget (ADP / Capex)"
  source_of_fund: "Government of Bangladesh (GoB)"
  procurement_method: "Open Tendering Method (OTM)"
  evaluation_method: "Least Cost Selection (LCS)"
  schedule_purchase_deadline: "2026-01-19"
  schedule_purchase_method: "e-GP Online"
  tender_doc_price: "BDT 2,000"
  tender_security_amount: 100000.0
  tender_security_method: "Bank Guarantee / Pay Order"
  performance_security: "10% of contract value"
  procurement_manager_name: "Mohammad Rafiqul Islam"
  procurement_manager_designation: "Director (Procurement & IT)"
  procurement_manager_email: "pd.lms@training.gov.bd"
  procurement_manager_phone: "+880-2-9555123"
  helpline_phone: "16575"
  helpline_email: "helpdesk@eprocure.gov.bd"
  helpline_hours: "09:00 - 17:00 BST, Sun-Thu"
  lead_owner_name: "NYK Advance Limited"
  lead_owner_role: "Lead Bidder"
  ai_chat_share_link: "https://gemini.google.com/share/sample-lms"
  languages:
    - "English"
    - "Bengali"
  eligibility:
    general_experience: "Minimum 3 years general experience in supply and implementation of IT Goods/services"
    similar_experience: "At least 1 completed contract of LMS in the last 3 years"
    similar_project_value: "BDT 35,00,000"
    avg_turnover: "BDT 50,00,000"
    financial_resources: "BDT 15,00,000"
    certification: "ISO 9001:2015"
    local_presence: "Active operational office in Bangladesh"
  jv:
    participation: "Not specified in the tender documents"
    lead_member: null
    member_rules: null
    local_partner: null
    jv_agreement: null
  financial_model:
    payment_scenario: "MILESTONE_BASED"
    working_capital_risk: "LOW"
    advance_payment:
      enabled: false
      percentage: 0
      amount: 0
      bank_guarantee_required: false
      recovery_type: "PRO_RATA_INVOICE"
      recovery_percentage_per_invoice: 0
    liquidated_damages:
      enabled: true
      rate: 0.5
      frequency: "PER_WEEK"
      calculation_basis: "TOTAL_CONTRACT_VALUE"
      max_cap_percentage: 10
      grace_period_days: 0
    retention_money:
      enabled: false
      percentage: 0
      release_condition: "DLP_EXPIRY"
      dlp_months: 12
  important_clauses:
    - clause_title: "Liquidated Damages for Late Handover"
      category: "PENALTY"
      criticality: "HIGH"
      doc_reference: "GCC 38.1"
      page_number: "42"
      clause_text: "The applicable rate for Liquidated Damages is 0.5 percent per week of delay or part thereof. The maximum amount of Liquidated Damages shall be 10 percent of the Contract Price."
      implication: "Requires rigorous milestone tracking; maximum liability capped at BDT 5,00,000."
```

---
*End of Master Template & Standing Instructions.*
