from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from app.core.database import Base


class ClientVisit(Base):
    __tablename__ = "client_visits"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    client_organization = Column(String(255), nullable=False, index=True)
    organization_id = Column(String(50), nullable=True, index=True)
    tender_id = Column(String(50), nullable=True, index=True)
    visitor_name = Column(String(150), nullable=False)
    visitor_designation = Column(String(150), nullable=True)
    visitor_phone = Column(String(50), nullable=True)
    visitor_email = Column(String(150), nullable=True)
    accompanying_persons = Column(JSON, nullable=True, default=list)
    internal_host_name = Column(String(150), nullable=True, default="Sarah Jenkins")
    internal_host_role = Column(String(100), nullable=True, default="Business Head")
    visit_type = Column(
        String(50),
        nullable=False,
        default="IN_PERSON_OFFICE",
        index=True,
    )  # IN_PERSON_OFFICE, CLIENT_SITE_VISIT, VIRTUAL_CONFERENCE, PRE_BID_MEETING, COURTESY_CALL, COMMERCIAL_NEGOTIATION
    status = Column(
        String(50),
        nullable=False,
        default="SCHEDULED",
        index=True,
    )  # SCHEDULED, CONFIRMED, CHECKED_IN, COMPLETED, RESCHEDULED, CANCELLED
    scheduled_start = Column(String(100), nullable=False)
    scheduled_end = Column(String(100), nullable=True)
    actual_check_in = Column(String(100), nullable=True)
    actual_check_out = Column(String(100), nullable=True)
    location_or_room = Column(String(150), nullable=True, default="Main Conference Room")
    meeting_link = Column(String(255), nullable=True)
    agenda = Column(Text, nullable=True)
    discussion_notes = Column(Text, nullable=True)
    action_items = Column(JSON, nullable=True, default=list)
    sentiment_outcome = Column(
        String(50), nullable=True, default="POSITIVE"
    )  # POSITIVE, NEUTRAL, CONCERNING, CRITICAL_BREAKTHROUGH
    attachments = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
