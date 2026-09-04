# AI Scope Extraction & Summarizer — Future Implementation Specification

**Status:** ARCHIVED FOR FUTURE IMPLEMENTATION  
**Original Architecture Date:** September 2026  
**Target Milestone:** Post-MVP AI Extensions  

---

## 1. Executive Summary & Purpose

When 200+ page multilateral Requests for Proposals (RFPs) arrive from international development banks (World Bank, ADB, JICA, UNDP, etc.), bid directors currently spend 4–8 hours manually digging for critical criteria before they can make a reliable Go/No-Go decision.

The **AI Scope Extraction & Summarizer** is designed to parse raw tender specification documents (`.pdf`, `.docx`) uploaded into `01_original_tender_documents` and automatically extract structured intelligence across the **5 Triage Pillars**:
1. **Mandatory Qualifications & Debarment Clauses:** Minimum annual turnover, corporate age, ISO accreditations (9001, 27001), and Joint Venture (JV) rules.
2. **Key Personnel & Staffing Mandates:** Positions, minimum years of experience, degrees, and count.
3. **Commercial & Financial Security Terms:** Tender security bank guarantees, validity periods, contract durations, performance bonds, and currencies.
4. **Liquidated Damages & Penalty Covenants:** Daily delay penalties, liability caps, and uptime SLA thresholds.
5. **Multi-Criteria Radar & pWin Scoring:** Initial suggested scores for Technical Fit (35%), Financial Margin (30%), Team Capacity (20%), and SLA Compliance (15%), alongside Predicted Win Probability (`pWin`).

---

## 2. API Endpoints & Request/Response Schemas

### Endpoint 1: Scope Extraction (`POST /api/tenders/{tender_id}/extract-scope`)

**Description:** Inspects documents in `storage/tenders/{tender_id}/01_original_tender_documents/`, extracts text, sends chunked prompts to an LLM provider (or local model), and returns the parsed payload.

#### Response Schema:
```json
{
  "tender_id": "TDR-2026-EU-089",
  "tender_title": "Next-Generation Enterprise ERP Modernization",
  "document_parsed": "Official_RFP_Specifications_SOW.pdf",
  "extraction_timestamp": "Wed, 04 Sep 2026 20:00:00 GMT",
  "confidence_score": 97,
  "classification": "SOFTWARE / IT RELATED",
  "executive_summary": "Comprehensive automated extraction for 'Next-Generation Enterprise ERP Modernization'. Detected 4 core technical milestones, statutory audit requirements, and liquidated damages covenants.",
  "mandatory_criteria": [
    "Certified Certificate of Incorporation with minimum 5 years standing",
    "3-Year Audited Balance Sheets demonstrating average annual turnover threshold",
    "At least 3 comparable regional assignments completed in the last 5 years",
    "Absence of multilateral sanctions or debarment by World Bank, ADB, or UN"
  ],
  "commercial_terms": {
    "tender_security": "$120,000 Unconditional Bank Guarantee (valid for 120 days)",
    "contract_period": "12 Calendar Months + 2-Year SLA Warranty",
    "performance_security": "10% of total awarded contract price",
    "currency": "USD"
  },
  "technical_deliverables": [
    "Microservices Solution Architecture & Scope of Work (SOW) Specification",
    "Sovereign Cloud Data Isolation & High Availability Failover (RTO < 15m)",
    "Zero-Trust Role-Based Access Control (RBAC) & Audit Log Ledger",
    "Comprehensive End-to-End User Acceptance Testing (UAT) & Handover Package"
  ],
  "personnel_mandates": [
    {
      "position": "Lead Solutions Architect",
      "qualification": "M.Sc Computer Science",
      "experience": "10+ years",
      "qty": "1"
    },
    {
      "position": "Senior Full-Stack Cloud Engineer",
      "qualification": "B.Sc Software Eng",
      "experience": "7+ years",
      "qty": "2"
    },
    {
      "position": "Security & Compliance Specialist",
      "qualification": "CISSP / CISM Certified",
      "experience": "8+ years",
      "qty": "1"
    }
  ],
  "clauses": [
    {
      "clause_number": "Clause 3.1",
      "title": "High Availability & Geographic Redundancy",
      "risk_level": "MANDATORY",
      "excerpt": "Active-passive failover with RTO < 15 minutes and RPO < 1 minute across sovereign boundaries."
    },
    {
      "clause_number": "Clause 5.4",
      "title": "Liquidated Damages & SLA Penalties",
      "risk_level": "FINANCIAL_RISK",
      "excerpt": "0.5% per calendar day of delay up to a maximum cap of 10% of total contract value."
    }
  ],
  "suggested_radar_scores": {
    "technical": 9.3,
    "financial": 8.6,
    "team": 8.4,
    "sla": 9.0
  },
  "suggested_pwin": 88
}
```

---

### Endpoint 2: Workspace Application (`POST /api/tenders/{tender_id}/apply-extraction`)

**Description:** Injects the reviewed criteria directly into the tender's database tables.

#### Request Schema:
```json
{
  "apply_requirements": true,
  "apply_tasks": true,
  "apply_decision_matrix": true
}
```

#### Injected Database Targets:
- **`tender_requirements`:** Creates rows for mandatory criteria with initial status `PENDING`.
- **`tender_tasks`:** Creates deliverables on the Kanban board assigned to designated leads.
- **`tender_decision_matrices`:** Updates technical, financial, team, SLA scores, and sets rationale.
- **`tenders.summary_json`:** Preserves raw extraction JSON on the tender record.

---

## 3. Four-Tier Memory Preservation Architecture

To prevent redundant API costs, support offline operation, and prevent human overrides from being erased:

1. **Tier 1 — Immutable Document Vault Cache (Local HDD/SSD):**
   - Cache path: `storage/tenders/{TDR-ID}/.ai_cache/{doc_sha256}.json`
   - Content-addressable: If the PDF hasn't changed, results are served instantly with zero API tokens consumed.
2. **Tier 2 — Relational Database Storage (SQLite Dev / MySQL Prod):**
   - Active state decomposed into `tenders`, `tender_requirements`, `tender_tasks`, and `tender_decision_matrices`.
   - Immutable historical extraction stored in `tenders.summary_json`.
3. **Tier 3 — Working Context for Follow-Up Queries (RAG):**
   - Chat channels and proposal summaries query the structured cache and summary JSON rather than re-tokenizing raw 200-page documents.
4. **Tier 4 — Client-Side Staging (`TenderContext` & `localStorage`):**
   - Interactive review allows bid managers to inspect, edit, or toggle items before committing to the database.

---

## 4. UI Components Architecture

- **Modal Component:** `AIScopeExtractorModal.tsx`
  - Multi-stage animated parser visualizer:
    1. Parsing Document Structure & Section Headers
    2. Detecting Statutory Debarment & Anti-Corruption Clauses
    3. Extracting Key Personnel Mandates & Minimum Qualifications
    4. Analyzing Financial Guarantees, Bank Solvency & Penalty Ratios
    5. Computing Multi-Criteria Radar Dimension & pWin Prediction
  - Review screen with confidence score, executive synthesis, personnel grid, and risk badges.
- **Trigger Points:**
  - Proposal Workspace header action bar
  - Document Vault header
  - Gate 3 Evaluation board

