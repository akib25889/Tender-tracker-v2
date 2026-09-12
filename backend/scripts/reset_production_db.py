import sys
import os
import shutil
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, engine, Base, run_migrations
from app.core.security import get_password_hash
from app.models.user import User
from app.models.tender import (
    Tender,
    TenderDecisionMatrix,
    TenderCategory,
    TenderSubmission,
)
from app.models.task import TenderTask
from app.models.document import TenderFolder, TenderDocument, ReusableDocument
from app.models.requirement import TenderRequirement
from app.models.comment import TenderComment
from app.models.chat import ChatChannelMessage
from app.models.organization import Organization
from app.models.company_credential import CompanyProjectCredential
from app.models.company_profile import CompanyProfile
from app.models.financial_rule import TenderFinancialRule
from app.models.client_visit import ClientVisit
from app.models.permission import (
    PartnerOrganization,
    TenderPartnerAssignment,
    PartnerPermissionCeiling,
    AccessBlock,
    AuthorizationAuditLog,
    ResourceShare,
)
from app.services.seeder import seed_database


def reset_production_database():
    print("=" * 60)
    print("  TenderTracker Production Database Reset & Purge Tool")
    print("=" * 60)

    # Ensure schema is up to date
    Base.metadata.create_all(bind=engine)
    run_migrations()

    db = SessionLocal()
    try:
        print("[1/5] Purging all dummy tenders and dependent child entities...")
        db.query(TenderSubmission).delete()
        db.query(TenderDecisionMatrix).delete()
        db.query(TenderComment).delete()
        db.query(TenderDocument).delete()
        db.query(TenderFolder).delete()
        db.query(TenderRequirement).delete()
        db.query(TenderTask).delete()
        db.query(TenderFinancialRule).delete()
        db.query(TenderPartnerAssignment).delete()
        db.query(Tender).delete()
        db.commit()

        print("[2/5] Purging mock reusable documents & credentials...")
        db.query(ReusableDocument).delete()
        db.query(CompanyProjectCredential).delete()
        db.query(CompanyProfile).delete()
        db.commit()

        print("[3/5] Purging mock organizations, visits, partner portals, and chats...")
        db.query(ClientVisit).delete()
        db.query(ChatChannelMessage).delete()
        db.query(PartnerPermissionCeiling).delete()
        db.query(PartnerOrganization).delete()
        db.query(Organization).delete()
        db.query(AccessBlock).delete()
        db.query(AuthorizationAuditLog).delete()
        db.query(ResourceShare).delete()
        db.commit()

        print("[4/5] Resetting user accounts & ensuring primary Super Admin...")
        # Remove old demo users
        db.query(User).delete()
        db.commit()

        # Create clean production Super Admin
        admin_user = User(
            id="USR-ADMIN-01",
            name="System Administrator",
            email="admin@tendertracker.com",
            hashed_password=get_password_hash("Admin@2026!"),
            role="SUPER_ADMIN",
            title="System Administrator",
            department="Operations & Governance",
            max_capacity=10,
            avatar="SA",
            location="Corporate HQ",
            employment_type="PERMANENT",
        )
        db.add(admin_user)
        db.commit()
        print(
            "      Created Super Admin: admin@tendertracker.com (Password: Admin@2026!)"
        )

        print(
            "[5/5] Re-seeding essential infrastructure (Settings, Categories, RBAC)..."
        )
        seed_database(db)

        # Clean storage tenders folder if exists
        storage_tenders = backend_dir.parent / "storage" / "tenders"
        if storage_tenders.exists():
            for item in storage_tenders.iterdir():
                if item.is_dir():
                    try:
                        shutil.rmtree(item)
                    except Exception as e:
                        print(
                            f"      Note: Could not delete directory {item.name}: {e}"
                        )
        print("      Local storage directory cleaned.")

        print(
            "\nSUCCESS: Production database has been completely purged of dummy data!"
        )
        print("Login with:")
        print("  Email:    admin@tendertracker.com")
        print("  Password: Admin@2026!\n")

    except Exception as e:
        db.rollback()
        print(f"\nERROR: Database reset failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    reset_production_database()
