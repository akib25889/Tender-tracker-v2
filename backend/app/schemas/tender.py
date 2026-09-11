from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel
from app.schemas.task import TaskOut
from app.schemas.document import DocumentOut, FolderOut
from app.schemas.comment import CommentOut


class RequirementOut(BaseModel):
    id: str
    tender_id: str
    title: str
    category: str
    status: str
    owner: str

    class Config:
        from_attributes = True





class DecisionMatrixIn(BaseModel):
    technical_score: Optional[float] = None
    financial_score: Optional[float] = None
    team_score: Optional[float] = None
    sla_score: Optional[float] = None
    composite_score: Optional[float] = None
    technical: Optional[float] = None
    financial: Optional[float] = None
    team: Optional[float] = None
    sla: Optional[float] = None
    aggregateScore: Optional[float] = None
    threshold: float = 70.0
    status: str = "PENDING"
    decision: Optional[str] = None
    rationale: Optional[str] = None


class DecisionMatrixOut(BaseModel):
    technical_score: float = 0.0
    financial_score: float = 0.0
    team_score: float = 0.0
    sla_score: float = 0.0
    composite_score: float = 0.0
    threshold: float = 70.0
    status: str = "PENDING"
    rationale: Optional[str] = None

    class Config:
        from_attributes = True


class ImportantClauseSchema(BaseModel):
    id: str
    clause_title: str
    category: str = "FINANCIAL"
    criticality: str = "CRITICAL"
    doc_reference: str
    doc_file_name: Optional[str] = None
    page_number: Optional[str] = None
    clause_text: str
    implication: Optional[str] = None

    class Config:
        from_attributes = True


class TenderBase(BaseModel):
    reference_no: Optional[str] = ""
    title: str
    organization: str
    country: str
    category: str
    estimated_value: Optional[float] = None
    currency: str = "USD"
    exchange_rate_to_bdt: Optional[float] = 122.0
    exchange_rate_date: Optional[str] = None
    estimated_value_bdt: Optional[float] = None
    stage: str = "DISCOVERED"
    decision: str = "PENDING"
    priority: str = "MEDIUM"
    submission_deadline: Optional[str] = None
    days_remaining: int = 0
    hours_remaining: int = 0
    readiness_score: int = 0
    lead_owner_name: Optional[str] = "Sarah Jenkins"
    lead_owner_role: Optional[str] = "Business Head"
    summary_json: Optional[str] = None
    important_clauses: Optional[List[ImportantClauseSchema]] = []
    procurement_manager_name: Optional[str] = None
    procurement_manager_designation: Optional[str] = None
    procurement_manager_email: Optional[str] = None
    procurement_manager_phone: Optional[str] = None
    helpline_phone: Optional[str] = None
    helpline_email: Optional[str] = None
    helpline_hours: Optional[str] = None
    # Procurement Governance & Sourcing Attributes (Req #21)
    tender_type: Optional[str] = None
    budget_type: Optional[str] = None
    source_of_fund: Optional[str] = None
    procurement_method: Optional[str] = None
    # 2-Stage Procurement Lineage (EOI -> RFP) & Shortlisting
    parent_eoi_id: Optional[str] = None
    spawned_rfp_id: Optional[str] = None
    eoi_shortlist_status: Optional[str] = None
    # Milestone Schedule Dates (Req #20)
    opening_date: Optional[str] = None
    contract_signing_date: Optional[str] = None
    work_start_date: Optional[str] = None
    possible_period: Optional[str] = None
    product_handover_date: Optional[str] = None
    maintenance_period: Optional[str] = None
    # Schedule / Form Purchase & Tender Security (EMD)
    schedule_purchase_deadline: Optional[str] = None
    schedule_purchase_method: Optional[str] = None
    tender_security_amount: Optional[float] = None
    tender_security_method: Optional[str] = None
    # Post-Award Execution & Contract Delivery Data (Req #17)
    post_award_data: Optional[Dict[str, Any]] = None
    # Financial Scenarios & Cash Flow Rules Model (Unified JSON)
    financial_model: Optional[Dict[str, Any]] = None
    ai_chat_share_link: Optional[str] = None


class TenderCreate(TenderBase):
    id: Optional[str] = None


class TenderUpdate(BaseModel):
    reference_no: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    country: Optional[str] = None
    category: Optional[str] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    exchange_rate_to_bdt: Optional[float] = None
    exchange_rate_date: Optional[str] = None
    estimated_value_bdt: Optional[float] = None
    stage: Optional[str] = None
    decision: Optional[str] = None
    priority: Optional[str] = None
    submission_deadline: Optional[str] = None
    days_remaining: Optional[int] = None
    hours_remaining: Optional[int] = None
    readiness_score: Optional[int] = None
    lead_owner_name: Optional[str] = None
    lead_owner_role: Optional[str] = None
    summary_json: Optional[str] = None
    important_clauses: Optional[List[ImportantClauseSchema]] = None
    procurement_manager_name: Optional[str] = None
    procurement_manager_designation: Optional[str] = None
    procurement_manager_email: Optional[str] = None
    procurement_manager_phone: Optional[str] = None
    helpline_phone: Optional[str] = None
    helpline_email: Optional[str] = None
    helpline_hours: Optional[str] = None
    tender_type: Optional[str] = None
    budget_type: Optional[str] = None
    source_of_fund: Optional[str] = None
    procurement_method: Optional[str] = None
    parent_eoi_id: Optional[str] = None
    spawned_rfp_id: Optional[str] = None
    eoi_shortlist_status: Optional[str] = None
    opening_date: Optional[str] = None
    contract_signing_date: Optional[str] = None
    work_start_date: Optional[str] = None
    possible_period: Optional[str] = None
    product_handover_date: Optional[str] = None
    maintenance_period: Optional[str] = None
    schedule_purchase_deadline: Optional[str] = None
    schedule_purchase_method: Optional[str] = None
    tender_security_amount: Optional[float] = None
    tender_security_method: Optional[str] = None
    post_award_data: Optional[Dict[str, Any]] = None
    financial_model: Optional[Dict[str, Any]] = None
    ai_chat_share_link: Optional[str] = None
    archived_from_stage: Optional[str] = None


class AiChatLinkUpdate(BaseModel):
    ai_chat_share_link: Optional[str] = None


class TenderOut(TenderBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    archived_from_stage: Optional[str] = None
    tasks: List[TaskOut] = []
    documents: List[DocumentOut] = []
    folders: List[FolderOut] = []
    customFolders: List[FolderOut] = []
    requirements: List[RequirementOut] = []
    comments: List[CommentOut] = []
    decision_matrix: Optional[DecisionMatrixOut] = None

    class Config:
        from_attributes = True
