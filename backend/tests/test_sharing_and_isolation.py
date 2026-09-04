import unittest
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base
from app.models.user import User
from app.models.tender import Tender
from app.models.document import TenderDocument
from app.models.permission import (
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    PermissionRule,
    AccessBlock,
    AuthorizationAuditLog,
    ResourceShare,
)
from app.services.authorization import AuthorizationService


class TestSharingAndIsolation(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Seed Tender
        self.tender = Tender(
            id="TDR-TEST-001",
            reference_no="TDR/2026/001",
            title="Dhaka Metro Rail Expansion Phase 2",
            organization="Dhaka Mass Transit Company",
            country="Bangladesh",
            category="Infrastructure",
            estimated_value=25000000.0,
            submission_deadline="2026-10-15",
            stage="PREPARATION",
            decision="GO",
        )
        self.db.add(self.tender)

        # Seed Documents
        self.doc1 = TenderDocument(
            id="DOC-101",
            tender_id="TDR-TEST-001",
            name="Technical_Specs.pdf",
            folder="01_original_tender_documents",
            size="2.4 MB",
            revision="v1.0",
            sha256="abc123hash",
            uploaded_at="2026-09-01",
            access_level="ALL_TEAM",
            file_path="mock_path_1.pdf",
        )
        self.doc2 = TenderDocument(
            id="DOC-102",
            tender_id="TDR-TEST-001",
            name="Internal_Pricing_Model.xlsx",
            folder="04_costing_commercial",
            size="1.1 MB",
            revision="v1.0",
            sha256="def456hash",
            uploaded_at="2026-09-01",
            access_level="RESTRICTED_FINANCE",
            file_path="mock_path_2.xlsx",
        )
        self.db.add_all([self.doc1, self.doc2])

        # Seed Partner Organization
        self.partner = PartnerOrganization(
            id="ORG-PARTNER-01",
            name="Apex Engineering JV",
            partner_type="JV_PARTNER",
            status="ACTIVE",
        )
        self.db.add(self.partner)

        # Assign Partner to Tender
        self.assignment = TenderPartnerAssignment(
            organization_id="ORG-PARTNER-01",
            tender_id="TDR-TEST-001",
            partner_type="JV_PARTNER",
            status="ACTIVE",
        )
        self.db.add(self.assignment)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_resource_share_creation_and_expiration(self):
        """Test creating a resource share and validating its active/expired state."""
        share = ResourceShare(
            resource_type="DOCUMENT",
            resource_id="DOC-101",
            tender_id="TDR-TEST-001",
            shared_by_user_id="USER-BID-01",
            shared_with_type="PARTNER_ORGANIZATION",
            shared_with_id="ORG-PARTNER-01",
            can_view=True,
            can_preview=True,
            can_download=False,
            token="token-abc-123",
            expires_at=datetime.utcnow() + timedelta(days=7),
            status="ACTIVE",
        )
        self.db.add(share)
        self.db.commit()

        queried = (
            self.db.query(ResourceShare)
            .filter(ResourceShare.token == "token-abc-123")
            .first()
        )
        self.assertIsNotNone(queried)
        self.assertTrue(queried.can_view)
        self.assertFalse(queried.can_download)
        self.assertEqual(queried.status, "ACTIVE")

    def test_partner_resource_isolation(self):
        """Section 22 & 23: Partner should only see explicitly shared documents."""
        # Share only DOC-101 with ORG-PARTNER-01
        share = ResourceShare(
            resource_type="DOCUMENT",
            resource_id="DOC-101",
            tender_id="TDR-TEST-001",
            shared_by_user_id="USER-BID-01",
            shared_with_type="PARTNER_ORGANIZATION",
            shared_with_id="ORG-PARTNER-01",
            can_view=True,
            token="token-iso-1",
            status="ACTIVE",
        )
        self.db.add(share)
        self.db.commit()

        # Simulate query for ORG-PARTNER-01
        now = datetime.utcnow()
        active_shares = (
            self.db.query(ResourceShare)
            .filter(
                ResourceShare.tender_id == "TDR-TEST-001",
                ResourceShare.status == "ACTIVE",
                (ResourceShare.expires_at == None) | (ResourceShare.expires_at > now),
                (ResourceShare.shared_with_id == "ORG-PARTNER-01")
                | (ResourceShare.shared_with_type == "PUBLIC"),
                ResourceShare.can_view == True,
            )
            .all()
        )
        shared_ids = {s.resource_id for s in active_shares}

        partner_visible_docs = (
            self.db.query(TenderDocument)
            .filter(
                TenderDocument.tender_id == "TDR-TEST-001",
                TenderDocument.id.in_(shared_ids),
            )
            .all()
        )

        self.assertEqual(len(partner_visible_docs), 1)
        self.assertEqual(partner_visible_docs[0].id, "DOC-101")
        # Ensure DOC-102 (Internal Pricing Model) was NOT visible to the partner
        self.assertNotIn("DOC-102", [d.id for d in partner_visible_docs])

    def test_share_revocation(self):
        """Test revoking an active share."""
        share = ResourceShare(
            resource_type="DOCUMENT",
            resource_id="DOC-101",
            tender_id="TDR-TEST-001",
            token="token-revoke-test",
            status="ACTIVE",
        )
        self.db.add(share)
        self.db.commit()

        share.status = "REVOKED"
        share.revoked_at = datetime.utcnow()
        share.revoked_by = "SECURITY_OFFICER"
        self.db.commit()

        updated = (
            self.db.query(ResourceShare)
            .filter(ResourceShare.token == "token-revoke-test")
            .first()
        )
        self.assertEqual(updated.status, "REVOKED")
        self.assertIsNotNone(updated.revoked_at)


if __name__ == "__main__":
    unittest.main()
