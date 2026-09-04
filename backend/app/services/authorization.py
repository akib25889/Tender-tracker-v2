import uuid
import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.user import User
from app.models.permission import (
    Permission,
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
    AuthorizationAuditLog,
)
from app.models.tender import Tender


@dataclass
class AuthorizationResult:
    allowed: bool
    permission_code: str
    denial_reason_code: Optional[str] = None
    denial_message: Optional[str] = None
    matched_rule_id: Optional[int] = None
    matched_rule_scope: Optional[str] = None
    matched_rule_effect: Optional[str] = None
    scope_type: Optional[str] = None
    scope_id: Optional[str] = None
    request_id: Optional[str] = None
    layer_reached: Optional[str] = None
    audit_log_id: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class AuthorizationService:
    @staticmethod
    def generate_request_id() -> str:
        date_str = datetime.date.today().strftime("%Y-%m-%d")
        rand_suffix = str(uuid.uuid4())[:8].upper()
        return f"REQ-{date_str}-{rand_suffix}"

    @classmethod
    def authorize(
        cls,
        db: Session,
        user_id: Optional[str],
        permission_code: str,
        tender_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        partner_org_id: Optional[str] = None,
        ip_address: str = "127.0.0.1",
        user_agent: str = "TenderTracker Client",
        request_method: str = "API",
        request_path: str = "/api",
        skip_audit: bool = False,
    ) -> AuthorizationResult:
        request_id = cls.generate_request_id()

        # Step 0: User & Auth Validation
        user: Optional[User] = None
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()

        user_role = user.role if user else "GUEST"

        # Auto-detect partner organization if not provided
        if not partner_org_id and user:
            # Check if user belongs to an external partner organization
            # E.g. role starts with 'PARTNER_' or user department/notes
            partner_org = (
                db.query(PartnerOrganization)
                .filter(PartnerOrganization.id == user.department)
                .first()
            )
            if partner_org:
                partner_org_id = partner_org.id

        # -------------------------------------------------------------
        # LAYER 1: SECURITY BLOCKERS (Hard DENY)
        # -------------------------------------------------------------
        if user:
            # Check User Suspended / Disabled in AccessBlock
            user_block = (
                db.query(AccessBlock)
                .filter(
                    AccessBlock.subject_type == "USER",
                    AccessBlock.subject_id == user.id,
                    AccessBlock.is_active == True,
                )
                .first()
            )
            if user_block:
                return cls._deny_and_log(
                    db,
                    request_id=request_id,
                    user_id=user_id,
                    partner_org_id=partner_org_id,
                    tender_id=tender_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    permission_code=permission_code,
                    reason_code="USER_SUSPENDED",
                    message=f"User account is suspended: {user_block.reason}",
                    layer="SECURITY_BLOCKER",
                    skip_audit=skip_audit,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

        if partner_org_id:
            # Check Partner Organization status
            partner_org = (
                db.query(PartnerOrganization)
                .filter(PartnerOrganization.id == partner_org_id)
                .first()
            )
            if partner_org:
                if partner_org.status == "SUSPENDED":
                    return cls._deny_and_log(
                        db,
                        request_id=request_id,
                        user_id=user_id,
                        partner_org_id=partner_org_id,
                        tender_id=tender_id,
                        resource_type=resource_type,
                        resource_id=resource_id,
                        permission_code=permission_code,
                        reason_code="ORGANIZATION_SUSPENDED",
                        message="Partner organization is currently suspended.",
                        layer="SECURITY_BLOCKER",
                        skip_audit=skip_audit,
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )
                if partner_org.status in ["REMOVED", "INACTIVE", "EXPIRED"]:
                    return cls._deny_and_log(
                        db,
                        request_id=request_id,
                        user_id=user_id,
                        partner_org_id=partner_org_id,
                        tender_id=tender_id,
                        resource_type=resource_type,
                        resource_id=resource_id,
                        permission_code=permission_code,
                        reason_code="PARTNER_INACTIVE",
                        message=f"Partner organization is {partner_org.status.lower()}.",
                        layer="SECURITY_BLOCKER",
                        skip_audit=skip_audit,
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )

            # Check Org AccessBlock
            org_block = (
                db.query(AccessBlock)
                .filter(
                    AccessBlock.subject_type == "ORGANIZATION",
                    AccessBlock.subject_id == partner_org_id,
                    AccessBlock.is_active == True,
                )
                .first()
            )
            if org_block:
                return cls._deny_and_log(
                    db,
                    request_id=request_id,
                    user_id=user_id,
                    partner_org_id=partner_org_id,
                    tender_id=tender_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    permission_code=permission_code,
                    reason_code="ORGANIZATION_SUSPENDED",
                    message=f"Partner organization blocked: {org_block.reason}",
                    layer="SECURITY_BLOCKER",
                    skip_audit=skip_audit,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

        # Check Tender archived / closed if attempting edit or delete
        if tender_id and permission_code.split(".")[-1] in [
            "edit",
            "delete",
            "upload",
            "submit",
        ]:
            tender = db.query(Tender).filter(Tender.id == tender_id).first()
            if tender and tender.stage in ["ARCHIVED", "CANCELLED"]:
                return cls._deny_and_log(
                    db,
                    request_id=request_id,
                    user_id=user_id,
                    partner_org_id=partner_org_id,
                    tender_id=tender_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    permission_code=permission_code,
                    reason_code="TENDER_ARCHIVED",
                    message="Tender record is archived or cancelled; modifications prohibited.",
                    layer="SECURITY_BLOCKER",
                    skip_audit=skip_audit,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

        # -------------------------------------------------------------
        # LAYER 2: ACCESS BOUNDARIES (Hard DENY)
        # -------------------------------------------------------------
        if partner_org_id and tender_id:
            assignment = (
                db.query(TenderPartnerAssignment)
                .filter(
                    TenderPartnerAssignment.tender_id == tender_id,
                    TenderPartnerAssignment.organization_id == partner_org_id,
                )
                .first()
            )

            if not assignment:
                return cls._deny_and_log(
                    db,
                    request_id=request_id,
                    user_id=user_id,
                    partner_org_id=partner_org_id,
                    tender_id=tender_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    permission_code=permission_code,
                    reason_code="PARTNER_NOT_ASSIGNED",
                    message="Partner organization is not assigned to this tender.",
                    layer="ACCESS_BOUNDARY",
                    skip_audit=skip_audit,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

            if assignment.status != "ACTIVE":
                return cls._deny_and_log(
                    db,
                    request_id=request_id,
                    user_id=user_id,
                    partner_org_id=partner_org_id,
                    tender_id=tender_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    permission_code=permission_code,
                    reason_code="TENDER_ACCESS_REVOKED",
                    message=f"Partner tender assignment is {assignment.status.lower()}.",
                    layer="ACCESS_BOUNDARY",
                    skip_audit=skip_audit,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

        # -------------------------------------------------------------
        # PARTNER PERMISSION CEILING (Cap: Actual = Ceiling ∩ Granted)
        # -------------------------------------------------------------
        if partner_org_id:
            # Check partner ceiling for this permission code
            ceiling = (
                db.query(PartnerPermissionCeiling)
                .filter(
                    PartnerPermissionCeiling.partner_organization_id == partner_org_id,
                    PartnerPermissionCeiling.permission_code == permission_code,
                )
                .first()
            )

            # Sensitive permissions default ceiling = DENY unless explicitly granted in ceiling
            is_sensitive = any(
                permission_code.startswith(prefix)
                for prefix in [
                    "financial.",
                    "commercial.",
                    "submission.submit",
                    "permission.",
                    "partner.manage",
                ]
            )

            if ceiling:
                if not ceiling.allowed:
                    return cls._deny_and_log(
                        db,
                        request_id=request_id,
                        user_id=user_id,
                        partner_org_id=partner_org_id,
                        tender_id=tender_id,
                        resource_type=resource_type,
                        resource_id=resource_id,
                        permission_code=permission_code,
                        reason_code="PARTNER_PERMISSION_CEILING_EXCEEDED",
                        message="Requested action exceeds the partner organization's maximum permission ceiling.",
                        layer="PARTNER_CEILING",
                        skip_audit=skip_audit,
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )
            elif is_sensitive:
                return cls._deny_and_log(
                    db,
                    request_id=request_id,
                    user_id=user_id,
                    partner_org_id=partner_org_id,
                    tender_id=tender_id,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    permission_code=permission_code,
                    reason_code="PARTNER_PERMISSION_CEILING_EXCEEDED",
                    message="Partner ceiling prohibits access to internal sensitive/financial operations.",
                    layer="PARTNER_CEILING",
                    skip_audit=skip_audit,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

        # -------------------------------------------------------------
        # LAYER 3: HIERARCHICAL PERMISSION RESOLUTION
        # Order: 1. RESOURCE -> 2. TENDER -> 3. ORGANIZATION -> 4. ROLE -> 5. DEFAULT DENY
        # Rule: Within same scope, DENY strictly overrides ALLOW.
        # -------------------------------------------------------------
        subject_tuples = []
        if user_id:
            subject_tuples.append(("USER", user_id))
        if partner_org_id:
            subject_tuples.append(("PARTNER_ORGANIZATION", partner_org_id))
        if user_role:
            subject_tuples.append(("ROLE", user_role))

        # 1. Check RESOURCE Scope
        if resource_id:
            res = cls._evaluate_scope(
                db,
                scope_type="RESOURCE",
                scope_id=resource_id,
                permission_code=permission_code,
                subject_tuples=subject_tuples,
            )
            if res:
                return cls._finalize(
                    db,
                    request_id,
                    user_id,
                    partner_org_id,
                    tender_id,
                    resource_type,
                    resource_id,
                    permission_code,
                    res,
                    "RESOURCE",
                    resource_id,
                    skip_audit,
                    ip_address,
                    user_agent,
                )

        # 2. Check TENDER Scope
        if tender_id:
            res = cls._evaluate_scope(
                db,
                scope_type="TENDER",
                scope_id=tender_id,
                permission_code=permission_code,
                subject_tuples=subject_tuples,
            )
            if res:
                return cls._finalize(
                    db,
                    request_id,
                    user_id,
                    partner_org_id,
                    tender_id,
                    resource_type,
                    resource_id,
                    permission_code,
                    res,
                    "TENDER",
                    tender_id,
                    skip_audit,
                    ip_address,
                    user_agent,
                )

        # 3. Check ORGANIZATION Scope
        if partner_org_id:
            res = cls._evaluate_scope(
                db,
                scope_type="ORGANIZATION",
                scope_id=partner_org_id,
                permission_code=permission_code,
                subject_tuples=subject_tuples,
            )
            if res:
                return cls._finalize(
                    db,
                    request_id,
                    user_id,
                    partner_org_id,
                    tender_id,
                    resource_type,
                    resource_id,
                    permission_code,
                    res,
                    "ORGANIZATION",
                    partner_org_id,
                    skip_audit,
                    ip_address,
                    user_agent,
                )

        # 4. Check ROLE Scope
        if user_role:
            res = cls._evaluate_scope(
                db,
                scope_type="ROLE",
                scope_id=user_role,
                permission_code=permission_code,
                subject_tuples=subject_tuples,
            )
            if res:
                return cls._finalize(
                    db,
                    request_id,
                    user_id,
                    partner_org_id,
                    tender_id,
                    resource_type,
                    resource_id,
                    permission_code,
                    res,
                    "ROLE",
                    user_role,
                    skip_audit,
                    ip_address,
                    user_agent,
                )

        # -------------------------------------------------------------
        # 5. DEFAULT DENY
        # -------------------------------------------------------------
        return cls._deny_and_log(
            db,
            request_id=request_id,
            user_id=user_id,
            partner_org_id=partner_org_id,
            tender_id=tender_id,
            resource_type=resource_type,
            resource_id=resource_id,
            permission_code=permission_code,
            reason_code="DEFAULT_DENY",
            message="No explicit authorization rule granted access for this subject and scope.",
            layer="DEFAULT_DENY",
            skip_audit=skip_audit,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    @classmethod
    def _evaluate_scope(
        cls,
        db: Session,
        scope_type: str,
        scope_id: str,
        permission_code: str,
        subject_tuples: List[tuple],
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates rules strictly within a single scope.
        Rule: Within same scope, DENY strictly overrides ALLOW.
        """
        conditions = []
        for s_type, s_id in subject_tuples:
            conditions.append(
                and_(
                    PermissionRule.subject_type == s_type,
                    PermissionRule.subject_id == s_id,
                )
            )

        if not conditions:
            return None

        rules = (
            db.query(PermissionRule)
            .filter(
                PermissionRule.scope_type == scope_type,
                PermissionRule.scope_id == scope_id,
                PermissionRule.permission_code == permission_code,
                or_(*conditions),
            )
            .all()
        )

        if not rules:
            return None

        # Check for any DENY within this scope
        deny_rule = next((r for r in rules if r.effect == "DENY"), None)
        if deny_rule:
            return {
                "allowed": False,
                "effect": "DENY",
                "matched_rule_id": deny_rule.id,
                "reason_code": "EXPLICIT_PERMISSION_DENIED",
                "message": f"Action explicitly denied by rule #{deny_rule.id} at {scope_type} scope.",
            }

        # Check for ALLOW
        allow_rule = next((r for r in rules if r.effect == "ALLOW"), None)
        if allow_rule:
            return {
                "allowed": True,
                "effect": "ALLOW",
                "matched_rule_id": allow_rule.id,
                "reason_code": None,
                "message": None,
            }

        return None

    @classmethod
    def _finalize(
        cls,
        db: Session,
        request_id: str,
        user_id: Optional[str],
        partner_org_id: Optional[str],
        tender_id: Optional[str],
        resource_type: Optional[str],
        resource_id: Optional[str],
        permission_code: str,
        res: Dict[str, Any],
        scope_type: str,
        scope_id: str,
        skip_audit: bool,
        ip_address: str,
        user_agent: str,
    ) -> AuthorizationResult:
        decision = "ALLOW" if res["allowed"] else "DENY"
        audit_log = None

        if not skip_audit:
            audit_log = AuthorizationAuditLog(
                request_id=request_id,
                user_id=user_id,
                partner_organization_id=partner_org_id,
                tender_id=tender_id,
                resource_type=resource_type,
                resource_id=resource_id,
                permission_code=permission_code,
                action=permission_code.split(".")[-1],
                decision=decision,
                denial_reason_code=res.get("reason_code"),
                denial_message=res.get("message"),
                matched_rule_id=res.get("matched_rule_id"),
                matched_rule_scope=scope_type,
                matched_rule_effect=res.get("effect"),
                ip_address=ip_address,
                user_agent=user_agent,
            )
            db.add(audit_log)
            db.commit()
            db.refresh(audit_log)

        return AuthorizationResult(
            allowed=res["allowed"],
            permission_code=permission_code,
            denial_reason_code=res.get("reason_code"),
            denial_message=res.get("message"),
            matched_rule_id=res.get("matched_rule_id"),
            matched_rule_scope=scope_type,
            matched_rule_effect=res.get("effect"),
            scope_type=scope_type,
            scope_id=scope_id,
            request_id=request_id,
            layer_reached=scope_type,
            audit_log_id=audit_log.id if audit_log else None,
        )

    @classmethod
    def _deny_and_log(
        cls,
        db: Session,
        request_id: str,
        user_id: Optional[str],
        partner_org_id: Optional[str],
        tender_id: Optional[str],
        resource_type: Optional[str],
        resource_id: Optional[str],
        permission_code: str,
        reason_code: str,
        message: str,
        layer: str,
        skip_audit: bool,
        ip_address: str,
        user_agent: str,
    ) -> AuthorizationResult:
        audit_log = None
        if not skip_audit:
            audit_log = AuthorizationAuditLog(
                request_id=request_id,
                user_id=user_id,
                partner_organization_id=partner_org_id,
                tender_id=tender_id,
                resource_type=resource_type,
                resource_id=resource_id,
                permission_code=permission_code,
                action=permission_code.split(".")[-1],
                decision="DENY",
                denial_reason_code=reason_code,
                denial_message=message,
                matched_rule_scope=layer,
                matched_rule_effect="DENY",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            db.add(audit_log)
            db.commit()
            db.refresh(audit_log)

        return AuthorizationResult(
            allowed=False,
            permission_code=permission_code,
            denial_reason_code=reason_code,
            denial_message=message,
            scope_type=layer,
            request_id=request_id,
            layer_reached=layer,
            audit_log_id=audit_log.id if audit_log else None,
        )

    @classmethod
    def simulate_authorization(
        cls,
        db: Session,
        user_id: Optional[str],
        permission_code: str,
        tender_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        partner_org_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Provides step-by-step diagnostic breakdown across all 4 layers without committing state.
        """
        # Run standard authorization with skip_audit=True
        result = cls.authorize(
            db,
            user_id=user_id,
            permission_code=permission_code,
            tender_id=tender_id,
            resource_id=resource_id,
            partner_org_id=partner_org_id,
            skip_audit=False,  # Still audit simulation so it appears in audit trail!
        )

        layer_order = [
            "SECURITY_BLOCKER",
            "ACCESS_BOUNDARY",
            "PARTNER_CEILING",
            "RESOURCE",
            "TENDER",
            "ORGANIZATION",
            "ROLE",
            "DEFAULT_DENY",
        ]
        reached_idx = (
            layer_order.index(result.layer_reached)
            if result.layer_reached in layer_order
            else 0
        )

        steps = []
        # Security Blocker step
        steps.append(
            {
                "name": "Layer 1: Security Blockers",
                "passed": reached_idx > 0 or (reached_idx == 0 and result.allowed),
                "status": "PASS" if (reached_idx > 0 or result.allowed) else "FAIL",
                "detail": (
                    result.denial_message
                    if reached_idx == 0 and not result.allowed
                    else "No security suspensions or account blocks active."
                ),
            }
        )

        # Access Boundary step
        steps.append(
            {
                "name": "Layer 2: Access Boundaries",
                "passed": reached_idx > 1 or (reached_idx <= 1 and result.allowed),
                "status": "PASS" if (reached_idx > 1 or result.allowed) else "FAIL",
                "detail": (
                    result.denial_message
                    if reached_idx == 1 and not result.allowed
                    else "Tender membership & partner assignment verified."
                ),
            }
        )

        # Partner Ceiling step
        steps.append(
            {
                "name": "Partner Permission Ceiling",
                "passed": reached_idx > 2 or (reached_idx <= 2 and result.allowed),
                "status": "PASS" if (reached_idx > 2 or result.allowed) else "FAIL",
                "detail": (
                    result.denial_message
                    if reached_idx == 2 and not result.allowed
                    else "Requested action is within authorized partner ceiling."
                ),
            }
        )

        # Scope Resolution step
        steps.append(
            {
                "name": "Layer 3: Scope Resolution (Resource > Tender > Org > Role)",
                "passed": result.allowed,
                "status": "PASS" if result.allowed else "FAIL",
                "detail": (
                    f"Matched Rule #{result.matched_rule_id} at {result.matched_rule_scope} ({result.matched_rule_effect})"
                    if result.matched_rule_id
                    else result.denial_message
                ),
            }
        )

        return {
            "request_id": result.request_id,
            "allowed": result.allowed,
            "verdict": "ALLOW" if result.allowed else "DENY",
            "permission_code": result.permission_code,
            "denial_reason_code": result.denial_reason_code,
            "denial_message": result.denial_message,
            "matched_rule_id": result.matched_rule_id,
            "matched_rule_scope": result.matched_rule_scope,
            "steps": steps,
        }
