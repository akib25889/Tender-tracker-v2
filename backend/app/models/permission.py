from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(String(255), nullable=True)
    module = Column(
        String(50), nullable=False, index=True
    )  # tender, document, task, partner, submission, etc.
    action = Column(
        String(50), nullable=False
    )  # view, download, upload, edit, delete, etc.
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class PartnerOrganization(Base):
    __tablename__ = "partner_organizations"

    id = Column(String(50), primary_key=True, index=True)  # e.g. ORG-APEX-01
    name = Column(String(150), nullable=False)
    partner_type = Column(
        String(50), nullable=False, default="JV_PARTNER"
    )  # JV_PARTNER, CONSORTIUM_PARTNER, SUBCONTRACTOR, CONSULTANT, OTHER
    country = Column(String(100), nullable=True, default="Bangladesh")
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    status = Column(
        String(50), nullable=False, default="ACTIVE"
    )  # ACTIVE, SUSPENDED, REMOVED, EXPIRED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class TenderPartnerAssignment(Base):
    __tablename__ = "tender_partner_organizations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(
        String(50),
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id = Column(
        String(50),
        ForeignKey("partner_organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    partner_type = Column(String(50), nullable=False, default="JV_PARTNER")
    status = Column(
        String(50), nullable=False, default="ACTIVE"
    )  # ACTIVE, SUSPENDED, REMOVED, EXPIRED
    assigned_at = Column(DateTime, server_default=func.now(), nullable=False)
    assigned_by = Column(String(100), nullable=True, default="SYSTEM_ADMIN")
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)


class PartnerPermissionCeiling(Base):
    __tablename__ = "partner_permission_ceilings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    partner_organization_id = Column(
        String(50),
        ForeignKey("partner_organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    permission_code = Column(String(100), nullable=False, index=True)
    allowed = Column(Boolean, default=True, nullable=False)
    scope_type = Column(
        String(50), nullable=False, default="ORGANIZATION"
    )  # ORGANIZATION, TENDER
    scope_id = Column(String(50), nullable=True)
    expires_at = Column(String(50), nullable=True)
    created_by = Column(String(100), nullable=True, default="SYSTEM_ADMIN")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class PermissionRule(Base):
    __tablename__ = "permission_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_type = Column(
        String(50), nullable=False, index=True
    )  # USER, ROLE, ORGANIZATION, PARTNER_ORGANIZATION
    subject_id = Column(
        String(50), nullable=False, index=True
    )  # user_id, role_name, org_id
    permission_code = Column(String(100), nullable=False, index=True)
    effect = Column(String(20), nullable=False, default="ALLOW")  # ALLOW, DENY
    scope_type = Column(
        String(50), nullable=False, index=True
    )  # RESOURCE, TENDER, ORGANIZATION, ROLE
    scope_id = Column(
        String(100), nullable=True, index=True
    )  # document_id, tender_id, etc.
    expires_at = Column(String(50), nullable=True)
    created_by = Column(String(100), nullable=True, default="SYSTEM_ADMIN")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class AccessBlock(Base):
    __tablename__ = "access_blocks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_type = Column(
        String(50), nullable=False, index=True
    )  # USER, ORGANIZATION, TENDER
    subject_id = Column(String(50), nullable=False, index=True)
    block_type = Column(
        String(50), nullable=False
    )  # USER_SUSPENDED, ORGANIZATION_SUSPENDED, TENDER_LOCKED
    reason = Column(String(255), nullable=False)
    starts_at = Column(DateTime, server_default=func.now(), nullable=False)
    expires_at = Column(String(50), nullable=True)
    created_by = Column(String(100), nullable=True, default="SECURITY_OFFICER")
    is_active = Column(Boolean, default=True, nullable=False)


class AuthorizationAuditLog(Base):
    __tablename__ = "authorization_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False
    )
    request_id = Column(String(50), nullable=False, index=True)
    user_id = Column(String(50), nullable=True, index=True)
    organization_id = Column(String(50), nullable=True, index=True)
    partner_organization_id = Column(String(50), nullable=True, index=True)
    tender_id = Column(String(50), nullable=True, index=True)
    resource_type = Column(String(50), nullable=True)  # DOCUMENT, TASK, TENDER
    resource_id = Column(String(50), nullable=True)
    permission_code = Column(String(100), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    decision = Column(String(20), nullable=False)  # ALLOW, DENY
    denial_reason_code = Column(String(100), nullable=True)
    denial_message = Column(String(255), nullable=True)
    matched_rule_id = Column(Integer, nullable=True)
    matched_rule_scope = Column(String(50), nullable=True)
    matched_rule_effect = Column(String(20), nullable=True)
    request_method = Column(String(10), nullable=True, default="API")
    request_path = Column(String(255), nullable=True)
    ip_address = Column(String(50), nullable=True, default="127.0.0.1")
    user_agent = Column(String(255), nullable=True, default="TenderTracker Client")
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)


class ResourceShare(Base):
    __tablename__ = "resource_shares"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False
    )
    resource_type = Column(
        String(50), default="DOCUMENT", nullable=False
    )  # DOCUMENT, FOLDER
    resource_id = Column(String(50), nullable=False, index=True)
    tender_id = Column(String(50), nullable=False, index=True)
    shared_by_user_id = Column(String(50), nullable=False, default="SYSTEM_ADMIN")
    shared_with_type = Column(
        String(50), default="PARTNER_ORGANIZATION", nullable=False
    )  # PARTNER_ORGANIZATION, USER, PUBLIC
    shared_with_id = Column(String(50), nullable=True, index=True)
    recipient_email = Column(String(150), nullable=True)
    can_view = Column(Boolean, default=True, nullable=False)
    can_preview = Column(Boolean, default=True, nullable=False)
    can_download = Column(Boolean, default=False, nullable=False)
    can_upload = Column(Boolean, default=False, nullable=False)
    can_edit = Column(Boolean, default=False, nullable=False)
    can_delete = Column(Boolean, default=False, nullable=False)
    can_share = Column(Boolean, default=False, nullable=False)
    token = Column(String(100), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=True)
    status = Column(
        String(20), default="ACTIVE", nullable=False
    )  # ACTIVE, REVOKED, EXPIRED
    revoked_at = Column(DateTime, nullable=True)
    revoked_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
