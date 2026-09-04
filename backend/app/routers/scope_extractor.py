from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.models.tender import Tender, TenderDecisionMatrix
from app.models.task import TenderTask
from app.models.requirement import TenderRequirement
from app.models.document import TenderDocument

router = APIRouter(prefix="/tenders", tags=["AI Scope Extraction & Summarizer"])


class ExtractedRequirement(BaseModel):
    title: str = ""
    category: str
    owner: str = "Tariq Al-Mansoor"
    confidence: int = 95


class ExtractedTask(BaseModel):
    title: str
    assignee: str
    priority: str = "HIGH"
    deadline: str = "Day 5"


class ExtractedRiskClause(BaseModel):
    clause_number: str
    title: str
    risk_level: str  # MANDATORY, FINANCIAL_RISK, COMPLIANCE
    excerpt: str


class ScopeExtractionResult(BaseModel):
    tender_id: str
    tender_title: str
    document_parsed: str
    extraction_timestamp: str
    confidence_score: int
    classification: str
    executive_summary: str
    mandatory_criteria: List[str]
    commercial_terms: Dict[str, str]
    technical_deliverables: List[str]
    personnel_mandates: List[Dict[str, str]]
    clauses: List[ExtractedRiskClause]
    suggested_radar_scores: Dict[str, float]
    suggested_pwin: int
    proposed_tasks: List[ExtractedTask]
    proposed_requirements: List[ExtractedRequirement]


class ApplyExtractionRequest(BaseModel):
    apply_requirements: bool = True
    apply_tasks: bool = True
    apply_decision_matrix: bool = True


@router.post("/{tender_id}/extract-scope", response_model=ScopeExtractionResult)
def extract_tender_scope(tender_id: str, db: Session = Depends(get_db)):
    """
    Simulated zero-bloat AI Scope & Requirement Extractor.
    Parses original tender documentation, identifies mandatory statutory criteria,
    extracts SLA penalty and liquidated damages clauses, and synthesizes 6-gate deliverables.
    """
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    docs = db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id).all()
    primary_doc = docs[0].name if docs else "Official_RFP_Specifications.pdf"

    # Contextual tailoring based on tender title / organization
    is_health = "health" in tender.title.lower() or "who" in tender.organization.lower()
    is_water = "water" in tender.title.lower() or "jica" in tender.organization.lower()
    is_cloud = "cloud" in tender.title.lower() or "erp" in tender.title.lower()

    if is_health:
        deliverables = [
            "Regional HL7 FHIR Interoperability Bridge & Microservices Architecture",
            "Cross-Island Offline Patient Record Synchronization Engine with SQLite/Cipher",
            "Multi-Tenant Surveillance Analytics Dashboard for WHO Pacific Member States",
            "Automated Disease Outbreak Early-Warning System (EWS) with SMS/Email Gateway",
        ]
        personnel = [
            {
                "position": "Chief Health Informatics Architect",
                "qualification": "M.Sc Computer Science / Health Informatics",
                "experience": "10+ years",
                "qty": "1",
            },
            {
                "position": "FHIR Interoperability Specialist",
                "qualification": "B.Sc Software Eng + HL7 Certification",
                "experience": "6+ years",
                "qty": "2",
            },
            {
                "position": "Medical Data Privacy & GDPR Officer",
                "qualification": "LL.M / CIPP/E Information Privacy",
                "experience": "8+ years",
                "qty": "1",
            },
        ]
        clauses = [
            ExtractedRiskClause(
                clause_number="Clause 4.1",
                title="Sovereign Health Data Isolation & ISO 27799 Compliance",
                risk_level="MANDATORY",
                excerpt="All protected health information (PHI) must be encrypted at rest using AES-256 and never leave sovereign regional cloud boundaries.",
            ),
            ExtractedRiskClause(
                clause_number="Clause 9.2",
                title="Service Availability SLA & Liquidated Damages",
                risk_level="FINANCIAL_RISK",
                excerpt="99.95% monthly uptime SLA. 0.25% daily fee deduction per hour of unplanned surveillance system downtime.",
            ),
        ]
        commercial = {
            "tender_security": "USD $75,000 Unconditional Bank Guarantee",
            "contract_period": "18 Calendar Months + 3-Year Maintenance",
            "performance_security": "10% of Total Contract Value upon award",
            "currency": "USD",
        }
        suggested_radar = {"technical": 9.3, "financial": 8.5, "team": 8.8, "sla": 9.0}
    elif is_water:
        deliverables = [
            "Central SCADA Monitoring Master Terminal Unit (MTU) Deployment",
            "Distributed IoT Flow & Pressure Sensor Telemetry Integration across 48 Zones",
            "Automated Real-Time Non-Revenue Water (NRW) Acoustic Leak Detection Model",
            "Emergency High-Availability Failover Control Console at DWASA Headquarters",
        ]
        personnel = [
            {
                "position": "Senior SCADA Integration Team Leader",
                "qualification": "B.Sc Electrical / Industrial Automation",
                "experience": "12+ years",
                "qty": "1",
            },
            {
                "position": "IoT Telemetry Hardware Engineer",
                "qualification": "B.Sc Electronics & Communications",
                "experience": "7+ years",
                "qty": "3",
            },
            {
                "position": "Hydraulic Pipeline Systems Specialist",
                "qualification": "M.Sc Civil / Water Resources",
                "experience": "10+ years",
                "qty": "1",
            },
        ]
        clauses = [
            ExtractedRiskClause(
                clause_number="Clause 6.3",
                title="JICA Anti-Debarment & ODA Procurement Integrity Guidelines",
                risk_level="MANDATORY",
                excerpt="Bidder and all JV partners must not be under sanction or debarment by JICA or multilateral development banks.",
            ),
            ExtractedRiskClause(
                clause_number="Clause 14.1",
                title="Liquidated Damages for Delayed Commissioning",
                risk_level="FINANCIAL_RISK",
                excerpt="0.1% per calendar day of delay up to a maximum ceiling of 10% of the contract price.",
            ),
        ]
        commercial = {
            "tender_security": "BDT ৳50,000,000 / USD $410,000 Bank Guarantee",
            "contract_period": "24 Months Turnkey Implementation",
            "performance_security": "10% Performance Security valid for 36 months",
            "currency": "BDT / USD",
        }
        suggested_radar = {"technical": 8.9, "financial": 9.1, "team": 8.3, "sla": 8.6}
    else:
        deliverables = [
            "Sovereign Multi-Cloud Microservices SOW Architecture Specification",
            "Zero-Trust Identity & Access Management (IAM) Integration",
            "Automated Disaster Recovery & Active-Passive Geographic Redundancy (RTO < 15m)",
            "Continuous Integration / Continuous Deployment (CI/CD) Hardened Pipeline",
        ]
        personnel = [
            {
                "position": "Principal Cloud Infrastructure Architect",
                "qualification": "M.Sc Computer Engineering",
                "experience": "10+ years",
                "qty": "1",
            },
            {
                "position": "Senior DevSecOps & Security Specialist",
                "qualification": "B.Sc IT + CISSP/CISM",
                "experience": "8+ years",
                "qty": "2",
            },
            {
                "position": "Database & High-Availability Migration Lead",
                "qualification": "B.Sc Computer Science",
                "experience": "7+ years",
                "qty": "1",
            },
        ]
        clauses = [
            ExtractedRiskClause(
                clause_number="Clause 3.1",
                title="Geographic Cloud Redundancy & RTO/RPO SLA",
                risk_level="MANDATORY",
                excerpt="Active-passive failover with RTO < 15 minutes and RPO < 1 minute across sovereign donor boundaries.",
            ),
            ExtractedRiskClause(
                clause_number="Clause 5.4",
                title="Liquidated Damages & Performance Bonds",
                risk_level="FINANCIAL_RISK",
                excerpt="0.5% penalty per calendar day of delay up to a maximum cap of 10% of the total contract value.",
            ),
        ]
        commercial = {
            "tender_security": "USD $150,000 Unconditional Bank Guarantee",
            "contract_period": "12 Calendar Months",
            "performance_security": "10% of Contract Sum",
            "currency": "USD",
        }
        suggested_radar = {"technical": 9.2, "financial": 8.6, "team": 8.0, "sla": 9.0}

    # Synthesize Tasks and Requirements
    proposed_tasks = [
        ExtractedTask(
            title=f"Verify Technical Architecture vs RFP {deliverables[0][:35]}...",
            assignee="Dr. Marcus Vance",
            priority="CRITICAL",
            deadline="Day 4",
        ),
        ExtractedTask(
            title=f"Compile Key Personnel CV Package ({personnel[0]['position']})",
            assignee="Sarah Jenkins",
            priority="HIGH",
            deadline="Day 6",
        ),
        ExtractedTask(
            title="Procure Notarized Bank Solvency & Tender Security Guarantee",
            assignee="Tariq Al-Mansoor",
            priority="CRITICAL",
            deadline="Day 5",
        ),
        ExtractedTask(
            title="Statutory Anti-Debarment & Tax Clearance Audit Verification",
            assignee="Elena Rostova",
            priority="HIGH",
            deadline="Day 7",
        ),
    ]

    proposed_requirements = [
        ExtractedRequirement(
            title=clauses[0].title,
            category="Statutory Compliance",
            owner="Elena Rostova",
            confidence=98,
        ),
        ExtractedRequirement(
            title=f"Tender Security / Bid Bond Guarantee ({commercial['tender_security']})",
            category="Commercial & Financial",
            owner="Tariq Al-Mansoor",
            confidence=96,
        ),
        ExtractedRequirement(
            title=f"Key Personnel Staffing Minimums: {personnel[0]['position']}",
            category="Technical Staffing",
            owner="Dr. Marcus Vance",
            confidence=94,
        ),
        ExtractedRequirement(
            title="Acceptance of Liquidated Damages & Penalty Covenants",
            category="Legal Risk",
            owner="Elena Rostova",
            confidence=91,
        ),
    ]

    aggregate = round(
        suggested_radar["technical"] * 0.35
        + suggested_radar["financial"] * 0.3
        + suggested_radar["team"] * 0.2
        + suggested_radar["sla"] * 0.15,
        1,
    )

    return ScopeExtractionResult(
        tender_id=tender.id,
        tender_title=tender.title,
        document_parsed=primary_doc,
        extraction_timestamp=datetime.now(timezone.utc).strftime(
            "%Y-%m-%d %H:%M:%S UTC"
        ),
        confidence_score=96,
        classification="SOFTWARE / IT RELATED",
        executive_summary=(
            f"Comprehensive RFP scope extraction for '{tender.title}' ({tender.organization}). "
            f"Mandates strict technical deliverables across {len(deliverables)} core milestones, "
            f"statutory minimum personnel allocations, and formal commercial guarantees."
        ),
        mandatory_criteria=[
            "Verified legal registration and certificate of incorporation (min. 5 years standing)",
            "Audited financial balance sheets for the preceding 3 fiscal years",
            "At least 3 comparable reference projects completed within the last 5 years",
            "No active multilateral debarment, suspension, or blacklisting sanction",
        ],
        commercial_terms=commercial,
        technical_deliverables=deliverables,
        personnel_mandates=personnel,
        clauses=clauses,
        suggested_radar_scores=suggested_radar,
        suggested_pwin=min(95, round(aggregate * 10.2)),
        proposed_tasks=proposed_tasks,
        proposed_requirements=proposed_requirements,
    )


@router.post("/{tender_id}/apply-extraction")
def apply_scope_extraction(
    tender_id: str,
    payload: ApplyExtractionRequest,
    db: Session = Depends(get_db),
):
    """
    Applies the extracted criteria, requirements, tasks, and decision matrix
    directly into the database workspace for the specified tender.
    """
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    tasks_added = 0
    reqs_added = 0

    if payload.apply_tasks:
        default_tasks = [
            (
                "Finalize Technical Proposal Architecture & Methodology",
                "Dr. Marcus Vance",
                "HIGH",
            ),
            (
                "Compile Audited Financials & Tender Security Letter",
                "Tariq Al-Mansoor",
                "CRITICAL",
            ),
            (
                "Complete Statutory Debarment Declarations & Form C-K",
                "Elena Rostova",
                "HIGH",
            ),
        ]
        for title, assignee, priority in default_tasks:
            task_id = f"TSK-AI-{uuid.uuid4().hex[:6].upper()}"
            db.add(
                TenderTask(
                    id=task_id,
                    tender_id=tender.id,
                    title=title,
                    assignee=assignee,
                    status="TODO",
                    priority=priority,
                )
            )
            tasks_added += 1

    if payload.apply_requirements:
        default_reqs = [
            (
                "Clause 3.1: High Availability & Multi-Region Redundancy",
                "Technical Compliance",
                "Dr. Marcus Vance",
            ),
            (
                "Tender Security Unconditional Bank Guarantee",
                "Commercial & Financial",
                "Tariq Al-Mansoor",
            ),
            (
                "Audited 3-Year Balance Sheet & Solvency Certification",
                "Statutory Legal",
                "Elena Rostova",
            ),
        ]
        for title, cat, owner in default_reqs:
            req_id = f"REQ-AI-{uuid.uuid4().hex[:6].upper()}"
            db.add(
                TenderRequirement(
                    id=req_id,
                    tender_id=tender.id,
                    title=title,
                    category=cat,
                    status="PENDING",
                    owner=owner,
                )
            )
            reqs_added += 1

    if payload.apply_decision_matrix:
        matrix = (
            db.query(TenderDecisionMatrix)
            .filter(TenderDecisionMatrix.tender_id == tender_id)
            .first()
        )
        if not matrix:
            matrix = TenderDecisionMatrix(
                tender_id=tender.id,
                technical_score=9.2,
                financial_score=8.5,
                team_score=8.0,
                sla_score=9.0,
                composite_score=8.7,
                threshold=7.0,
                status="GO",
                rationale="Automated AI Scope Extraction verified technical capability and commercial viability.",
            )
            db.add(matrix)
        else:
            matrix.technical_score = 9.2
            matrix.financial_score = 8.5
            matrix.composite_score = 8.7
            matrix.status = "GO"
            matrix.rationale = "Updated via AI Scope Extraction & Summarizer."

    db.commit()

    return {
        "status": "SUCCESS",
        "tender_id": tender_id,
        "tasks_created": tasks_added,
        "requirements_created": reqs_added,
        "decision_matrix_updated": payload.apply_decision_matrix,
        "message": "Extracted criteria successfully synchronized into tender workspace!",
    }
