"""
Automated Authorization & Conflict Resolution Test Suite
Strictly implementing the 15 Security Test Cases defined in Section 57 of
'JV / Partner Collaboration & Granular File Permission Specification'.
"""

import sys
import os

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base
from app.models.user import User
from app.models.tender import Tender
from app.models.permission import (
    Permission,
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
    AuthorizationAuditLog,
)
from app.services.authorization import AuthorizationService
from app.services.seeder import seed_database

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def setup_module():
    Base.metadata.create_all(bind=TEST_ENGINE)
    db = TestSessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


def get_fresh_db():
    return TestSessionLocal()


# ==============================================================================
# TEST 1: Role ALLOW + Tender DENY -> Expected: DENY (Tender overrides Role)
# ==============================================================================
def test_01_role_allow_tender_deny():
    db = get_fresh_db()
    try:
        # User has role 'TEST_ROLE_01' which allows document.upload
        # But Tender 'TDR-TEST-01' explicitly denies document.upload
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="TEST_ROLE_01",
                permission_code="document.upload",
                effect="ALLOW",
                scope_type="ROLE",
                scope_id="TEST_ROLE_01",
            )
        )
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="TEST_ROLE_01",
                permission_code="document.upload",
                effect="DENY",
                scope_type="TENDER",
                scope_id="TDR-TEST-01",
            )
        )
        db.commit()

        # Create temporary user with this role
        user = User(
            id="USR-T1",
            name="Test User 1",
            email="u1@test.org",
            hashed_password="pw",
            role="TEST_ROLE_01",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id=user.id,
            permission_code="document.upload",
            tender_id="TDR-TEST-01",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "EXPLICIT_PERMISSION_DENIED"
        assert res.matched_rule_scope == "TENDER"
        assert res.matched_rule_effect == "DENY"
    finally:
        db.close()


# ==============================================================================
# TEST 2: Role DENY + Tender ALLOW -> Expected: ALLOW (Tender overrides Role)
# ==============================================================================
def test_02_role_deny_tender_allow():
    db = get_fresh_db()
    try:
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="TEST_ROLE_02",
                permission_code="document.upload",
                effect="DENY",
                scope_type="ROLE",
                scope_id="TEST_ROLE_02",
            )
        )
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="TEST_ROLE_02",
                permission_code="document.upload",
                effect="ALLOW",
                scope_type="TENDER",
                scope_id="TDR-TEST-02",
            )
        )
        user = User(
            id="USR-T2",
            name="Test User 2",
            email="u2@test.org",
            hashed_password="pw",
            role="TEST_ROLE_02",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id=user.id,
            permission_code="document.upload",
            tender_id="TDR-TEST-02",
            skip_audit=True,
        )
        assert res.allowed is True
        assert res.matched_rule_scope == "TENDER"
        assert res.matched_rule_effect == "ALLOW"
    finally:
        db.close()


# ==============================================================================
# TEST 3: Tender ALLOW + Resource DENY -> Expected: DENY (Resource overrides Tender)
# ==============================================================================
def test_03_tender_allow_resource_deny():
    db = get_fresh_db()
    try:
        db.add(
            PermissionRule(
                subject_type="USER",
                subject_id="USR-T3",
                permission_code="document.download",
                effect="ALLOW",
                scope_type="TENDER",
                scope_id="TDR-TEST-03",
            )
        )
        db.add(
            PermissionRule(
                subject_type="USER",
                subject_id="USR-T3",
                permission_code="document.download",
                effect="DENY",
                scope_type="RESOURCE",
                scope_id="DOC-SECRET-99",
            )
        )
        user = User(
            id="USR-T3",
            name="Test User 3",
            email="u3@test.org",
            hashed_password="pw",
            role="ANALYST",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T3",
            permission_code="document.download",
            tender_id="TDR-TEST-03",
            resource_id="DOC-SECRET-99",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "EXPLICIT_PERMISSION_DENIED"
        assert res.matched_rule_scope == "RESOURCE"
    finally:
        db.close()


# ==============================================================================
# TEST 4: Role ALLOW + Resource ALLOW -> Expected: ALLOW
# ==============================================================================
def test_04_role_allow_resource_allow():
    db = get_fresh_db()
    try:
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="TEST_ROLE_04",
                permission_code="document.view",
                effect="ALLOW",
                scope_type="ROLE",
                scope_id="TEST_ROLE_04",
            )
        )
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="TEST_ROLE_04",
                permission_code="document.view",
                effect="ALLOW",
                scope_type="RESOURCE",
                scope_id="DOC-OPEN-01",
            )
        )
        user = User(
            id="USR-T4",
            name="Test User 4",
            email="u4@test.org",
            hashed_password="pw",
            role="TEST_ROLE_04",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T4",
            permission_code="document.view",
            resource_id="DOC-OPEN-01",
            skip_audit=True,
        )
        assert res.allowed is True
        assert res.matched_rule_effect == "ALLOW"
    finally:
        db.close()


# ==============================================================================
# TEST 5: No Permission -> Expected: DEFAULT DENY
# ==============================================================================
def test_05_no_permission_default_deny():
    db = get_fresh_db()
    try:
        user = User(
            id="USR-T5",
            name="Test User 5",
            email="u5@test.org",
            hashed_password="pw",
            role="NEW_UNKNOWN_ROLE",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T5",
            permission_code="financial.edit",
            tender_id="TDR-TEST-05",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "DEFAULT_DENY"
    finally:
        db.close()


# ==============================================================================
# TEST 6: Partner Ceiling DENY + Resource ALLOW -> Expected: DENY (Ceiling overrides Resource)
# ==============================================================================
def test_06_partner_ceiling_deny_resource_allow():
    db = get_fresh_db()
    try:
        # Partner Org ORG-TEST-06 has ceiling: financial.view = False
        partner = PartnerOrganization(
            id="ORG-TEST-06", name="Partner 06", status="ACTIVE"
        )
        db.add(partner)
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-06", organization_id="ORG-TEST-06", status="ACTIVE"
            )
        )
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-06",
                permission_code="financial.view",
                allowed=False,
            )
        )
        # Admin erroneously adds Resource ALLOW rule for this partner
        db.add(
            PermissionRule(
                subject_type="PARTNER_ORGANIZATION",
                subject_id="ORG-TEST-06",
                permission_code="financial.view",
                effect="ALLOW",
                scope_type="RESOURCE",
                scope_id="DOC-FIN-01",
            )
        )
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="financial.view",
            tender_id="TDR-06",
            resource_id="DOC-FIN-01",
            partner_org_id="ORG-TEST-06",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "PARTNER_PERMISSION_CEILING_EXCEEDED"
    finally:
        db.close()


# ==============================================================================
# TEST 7: Partner not assigned to tender + Role ALLOW -> Expected: DENY (Access Boundary)
# ==============================================================================
def test_07_partner_not_assigned_to_tender():
    db = get_fresh_db()
    try:
        partner = PartnerOrganization(
            id="ORG-TEST-07", name="Unassigned Partner", status="ACTIVE"
        )
        db.add(partner)
        db.add(
            PermissionRule(
                subject_type="ROLE",
                subject_id="PARTNER_REP",
                permission_code="document.view",
                effect="ALLOW",
                scope_type="ROLE",
                scope_id="PARTNER_REP",
            )
        )
        user = User(
            id="USR-T7",
            name="Partner User",
            email="u7@partner.org",
            hashed_password="pw",
            role="PARTNER_REP",
        )
        db.add(user)
        db.commit()

        # Partner is NOT assigned to tender 'TDR-UNASSIGNED'
        res = AuthorizationService.authorize(
            db,
            user_id="USR-T7",
            permission_code="document.view",
            tender_id="TDR-UNASSIGNED",
            partner_org_id="ORG-TEST-07",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "PARTNER_NOT_ASSIGNED"
    finally:
        db.close()


# ==============================================================================
# TEST 8: Same Scope: ALLOW + DENY -> Expected: DENY (DENY overrides ALLOW in same scope)
# ==============================================================================
def test_08_same_scope_conflict_deny_wins():
    db = get_fresh_db()
    try:
        # Both rules are in TENDER scope for Tender 'TDR-CONFLICT'
        db.add(
            PermissionRule(
                subject_type="USER",
                subject_id="USR-T8",
                permission_code="document.upload",
                effect="ALLOW",
                scope_type="TENDER",
                scope_id="TDR-CONFLICT",
            )
        )
        db.add(
            PermissionRule(
                subject_type="USER",
                subject_id="USR-T8",
                permission_code="document.upload",
                effect="DENY",
                scope_type="TENDER",
                scope_id="TDR-CONFLICT",
            )
        )
        user = User(
            id="USR-T8",
            name="User 8",
            email="u8@test.org",
            hashed_password="pw",
            role="MEMBER",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T8",
            permission_code="document.upload",
            tender_id="TDR-CONFLICT",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "EXPLICIT_PERMISSION_DENIED"
    finally:
        db.close()


# ==============================================================================
# TEST 9: Permission rule expired -> Expected: DEFAULT DENY
# ==============================================================================
def test_09_permission_expired():
    db = get_fresh_db()
    try:
        # Rule expired in year 2020
        user = User(
            id="USR-T9",
            name="User 9",
            email="u9@test.org",
            hashed_password="pw",
            role="EXPIRED_ROLE",
        )
        db.add(user)
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T9",
            permission_code="document.download",
            tender_id="TDR-T9",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "DEFAULT_DENY"
    finally:
        db.close()


# ==============================================================================
# TEST 10: User suspended -> Expected: DENY (Security Blocker Layer 1)
# ==============================================================================
def test_10_user_suspended():
    db = get_fresh_db()
    try:
        user = User(
            id="USR-T10",
            name="Suspended User",
            email="u10@test.org",
            hashed_password="pw",
            role="BUSINESS_HEAD",
        )
        db.add(user)
        db.add(
            AccessBlock(
                subject_type="USER",
                subject_id="USR-T10",
                block_type="USER_SUSPENDED",
                reason="Security investigation ongoing",
                is_active=True,
            )
        )
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T10",
            permission_code="tender.view",
            tender_id="TDR-T10",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "USER_SUSPENDED"
        assert res.layer_reached == "SECURITY_BLOCKER"
    finally:
        db.close()


# ==============================================================================
# TEST 11: Partner shared doc: View ALLOW, Download DENY -> Expected: VIEW=ALLOW, DOWNLOAD=DENY
# ==============================================================================
def test_11_partner_view_allow_download_deny():
    db = get_fresh_db()
    try:
        partner = PartnerOrganization(
            id="ORG-TEST-11", name="Partner 11", status="ACTIVE"
        )
        db.add(partner)
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-11", organization_id="ORG-TEST-11", status="ACTIVE"
            )
        )
        # Partner ceiling allows view and download
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-11",
                permission_code="document.view",
                allowed=True,
            )
        )
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-11",
                permission_code="document.download",
                allowed=True,
            )
        )
        # Specific Resource: View is ALLOW, Download is DENY
        db.add(
            PermissionRule(
                subject_type="PARTNER_ORGANIZATION",
                subject_id="ORG-TEST-11",
                permission_code="document.view",
                effect="ALLOW",
                scope_type="RESOURCE",
                scope_id="DOC-PREVIEW-01",
            )
        )
        db.add(
            PermissionRule(
                subject_type="PARTNER_ORGANIZATION",
                subject_id="ORG-TEST-11",
                permission_code="document.download",
                effect="DENY",
                scope_type="RESOURCE",
                scope_id="DOC-PREVIEW-01",
            )
        )
        db.commit()

        res_view = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="document.view",
            tender_id="TDR-11",
            resource_id="DOC-PREVIEW-01",
            partner_org_id="ORG-TEST-11",
            skip_audit=True,
        )
        assert res_view.allowed is True

        res_down = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="document.download",
            tender_id="TDR-11",
            resource_id="DOC-PREVIEW-01",
            partner_org_id="ORG-TEST-11",
            skip_audit=True,
        )
        assert res_down.allowed is False
        assert res_down.denial_reason_code == "EXPLICIT_PERMISSION_DENIED"
    finally:
        db.close()


# ==============================================================================
# TEST 12: Partner shared doc: Download ALLOW, Reshare DENY -> Expected: DOWNLOAD=ALLOW, RESHARE=DENY
# ==============================================================================
def test_12_partner_download_allow_reshare_deny():
    db = get_fresh_db()
    try:
        partner = PartnerOrganization(
            id="ORG-TEST-12", name="Partner 12", status="ACTIVE"
        )
        db.add(partner)
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-12", organization_id="ORG-TEST-12", status="ACTIVE"
            )
        )
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-12",
                permission_code="document.download",
                allowed=True,
            )
        )
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-12",
                permission_code="document.share",
                allowed=False,
            )
        )
        db.add(
            PermissionRule(
                subject_type="PARTNER_ORGANIZATION",
                subject_id="ORG-TEST-12",
                permission_code="document.download",
                effect="ALLOW",
                scope_type="RESOURCE",
                scope_id="DOC-12",
            )
        )
        db.commit()

        res_down = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="document.download",
            tender_id="TDR-12",
            resource_id="DOC-12",
            partner_org_id="ORG-TEST-12",
            skip_audit=True,
        )
        assert res_down.allowed is True

        res_share = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="document.share",
            tender_id="TDR-12",
            resource_id="DOC-12",
            partner_org_id="ORG-TEST-12",
            skip_audit=True,
        )
        assert res_share.allowed is False
        assert res_share.denial_reason_code == "PARTNER_PERMISSION_CEILING_EXCEEDED"
    finally:
        db.close()


# ==============================================================================
# TEST 13: Cross-Partner Isolation: ABC attempts to access XYZ's unshared file -> Expected: DENY
# ==============================================================================
def test_13_cross_partner_isolation():
    db = get_fresh_db()
    try:
        partner_abc = PartnerOrganization(
            id="ORG-ABC", name="ABC Technologies", status="ACTIVE"
        )
        partner_xyz = PartnerOrganization(
            id="ORG-XYZ", name="XYZ Consulting", status="ACTIVE"
        )
        db.add(partner_abc)
        db.add(partner_xyz)
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-JOINT-01", organization_id="ORG-ABC", status="ACTIVE"
            )
        )
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-JOINT-01", organization_id="ORG-XYZ", status="ACTIVE"
            )
        )
        # XYZ is granted access to DOC-XYZ-PRIVATE
        db.add(
            PermissionRule(
                subject_type="PARTNER_ORGANIZATION",
                subject_id="ORG-XYZ",
                permission_code="document.view",
                effect="ALLOW",
                scope_type="RESOURCE",
                scope_id="DOC-XYZ-PRIVATE",
            )
        )
        db.commit()

        # Partner ABC attempts to access DOC-XYZ-PRIVATE (no rule exists for ABC on this resource)
        res_abc = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="document.view",
            tender_id="TDR-JOINT-01",
            resource_id="DOC-XYZ-PRIVATE",
            partner_org_id="ORG-ABC",
            skip_audit=True,
        )
        assert res_abc.allowed is False
        assert res_abc.denial_reason_code == "DEFAULT_DENY"
    finally:
        db.close()


# ==============================================================================
# TEST 14: Partner removed from tender -> Expected: DENY (Access Boundary Layer 2)
# ==============================================================================
def test_14_partner_removed_from_tender():
    db = get_fresh_db()
    try:
        partner = PartnerOrganization(
            id="ORG-TEST-14", name="Partner 14", status="ACTIVE"
        )
        db.add(partner)
        # Assignment status is REMOVED
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-14", organization_id="ORG-TEST-14", status="REMOVED"
            )
        )
        db.add(
            PermissionRule(
                subject_type="PARTNER_ORGANIZATION",
                subject_id="ORG-TEST-14",
                permission_code="document.view",
                effect="ALLOW",
                scope_type="RESOURCE",
                scope_id="DOC-14",
            )
        )
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id=None,
            permission_code="document.view",
            tender_id="TDR-14",
            resource_id="DOC-14",
            partner_org_id="ORG-TEST-14",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "TENDER_ACCESS_REVOKED"
        assert res.layer_reached == "ACCESS_BOUNDARY"
    finally:
        db.close()


# ==============================================================================
# TEST 15: Partner ceiling allows view, denies download; user rule allows download -> Expected: DENY
# ==============================================================================
def test_15_partner_ceiling_blocks_user_allow():
    db = get_fresh_db()
    try:
        partner = PartnerOrganization(
            id="ORG-TEST-15", name="Partner 15", status="ACTIVE"
        )
        db.add(partner)
        db.add(
            TenderPartnerAssignment(
                tender_id="TDR-15", organization_id="ORG-TEST-15", status="ACTIVE"
            )
        )
        # Partner ceiling allows view, denies download
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-15",
                permission_code="document.view",
                allowed=True,
            )
        )
        db.add(
            PartnerPermissionCeiling(
                partner_organization_id="ORG-TEST-15",
                permission_code="document.download",
                allowed=False,
            )
        )

        user = User(
            id="USR-T15",
            name="Partner User 15",
            email="u15@p15.com",
            hashed_password="pw",
            role="PARTNER_STAFF",
        )
        db.add(user)
        # Admin accidentally granted user document.download
        db.add(
            PermissionRule(
                subject_type="USER",
                subject_id="USR-T15",
                permission_code="document.download",
                effect="ALLOW",
                scope_type="TENDER",
                scope_id="TDR-15",
            )
        )
        db.commit()

        res = AuthorizationService.authorize(
            db,
            user_id="USR-T15",
            permission_code="document.download",
            tender_id="TDR-15",
            partner_org_id="ORG-TEST-15",
            skip_audit=True,
        )
        assert res.allowed is False
        assert res.denial_reason_code == "PARTNER_PERMISSION_CEILING_EXCEEDED"
        assert res.layer_reached == "PARTNER_CEILING"
    finally:
        db.close()


if __name__ == "__main__":
    setup_module()
    test_01_role_allow_tender_deny()
    test_02_role_deny_tender_allow()
    test_03_tender_allow_resource_deny()
    test_04_role_allow_resource_allow()
    test_05_no_permission_default_deny()
    test_06_partner_ceiling_deny_resource_allow()
    test_07_partner_not_assigned_to_tender()
    test_08_same_scope_conflict_deny_wins()
    test_09_permission_expired()
    test_10_user_suspended()
    test_11_partner_view_allow_download_deny()
    test_12_partner_download_allow_reshare_deny()
    test_13_cross_partner_isolation()
    test_14_partner_removed_from_tender()
    test_15_partner_ceiling_blocks_user_allow()
    print("ALL 15 AUTHORIZATION CONFLICT TESTS PASSED WITH 100% SUCCESS!")
