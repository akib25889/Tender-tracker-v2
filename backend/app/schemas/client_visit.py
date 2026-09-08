from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class ActionItemSchema(BaseModel):
    task: str
    owner: Optional[str] = None
    deadline: Optional[str] = None
    is_done: bool = False


class ClientVisitBase(BaseModel):
    title: str
    client_organization: str
    organization_id: Optional[str] = None
    tender_id: Optional[str] = None
    visitor_name: str
    visitor_designation: Optional[str] = None
    visitor_phone: Optional[str] = None
    visitor_email: Optional[str] = None
    accompanying_persons: Optional[List[Dict[str, Any]]] = None
    internal_host_name: Optional[str] = "Sarah Jenkins"
    internal_host_role: Optional[str] = "Business Head"
    visit_type: Optional[str] = "IN_PERSON_OFFICE"
    status: Optional[str] = "SCHEDULED"
    scheduled_start: str
    scheduled_end: Optional[str] = None
    actual_check_in: Optional[str] = None
    actual_check_out: Optional[str] = None
    location_or_room: Optional[str] = "Main Conference Room"
    meeting_link: Optional[str] = None
    agenda: Optional[str] = None
    discussion_notes: Optional[str] = None
    action_items: Optional[List[Dict[str, Any]]] = None
    sentiment_outcome: Optional[str] = "POSITIVE"
    attachments: Optional[List[Dict[str, Any]]] = None


class ClientVisitCreate(ClientVisitBase):
    id: Optional[str] = None


class ClientVisitUpdate(BaseModel):
    title: Optional[str] = None
    client_organization: Optional[str] = None
    organization_id: Optional[str] = None
    tender_id: Optional[str] = None
    visitor_name: Optional[str] = None
    visitor_designation: Optional[str] = None
    visitor_phone: Optional[str] = None
    visitor_email: Optional[str] = None
    accompanying_persons: Optional[List[Dict[str, Any]]] = None
    internal_host_name: Optional[str] = None
    internal_host_role: Optional[str] = None
    visit_type: Optional[str] = None
    status: Optional[str] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    actual_check_in: Optional[str] = None
    actual_check_out: Optional[str] = None
    location_or_room: Optional[str] = None
    meeting_link: Optional[str] = None
    agenda: Optional[str] = None
    discussion_notes: Optional[str] = None
    action_items: Optional[List[Dict[str, Any]]] = None
    sentiment_outcome: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None


class ClientVisitStatusPatch(BaseModel):
    status: str
    actual_check_in: Optional[str] = None
    actual_check_out: Optional[str] = None
    discussion_notes: Optional[str] = None
    sentiment_outcome: Optional[str] = None


class ClientVisitOut(ClientVisitBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
