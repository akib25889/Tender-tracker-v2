from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class TenderFolder(Base):
    __tablename__ = "tender_folders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_id = Column(
        String(50),
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(100), nullable=False)
    label = Column(String(150), nullable=False)

    tender = relationship("Tender", back_populates="folders")


class TenderDocument(Base):
    __tablename__ = "tender_documents"

    id = Column(String(50), primary_key=True, index=True)
    tender_id = Column(
        String(50),
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    folder = Column(String(100), nullable=False, default="01_original_tender_documents")
    company_name = Column(String(150), nullable=True, default="PrimeTech Ltd")
    company_role = Column(
        String(50), nullable=True, default="LEAD_BIDDER"
    )  # LEAD_BIDDER, JV_PARTNER, CONSORTIUM_MEMBER, SUBCONTRACTOR
    is_jv_partner = Column(Boolean, default=False)
    size = Column(String(50), nullable=False, default="1.5 MB")
    revision = Column(String(20), nullable=False, default="v1.0")
    sha256 = Column(String(64), nullable=False)
    uploaded_at = Column(String(50), nullable=False)
    is_reusable_link = Column(Boolean, default=False)
    reusable_source_id = Column(String(50), nullable=True)
    access_level = Column(String(50), nullable=False, default="ALL_TEAM")
    file_path = Column(String(255), nullable=True)
    
    # Document Action & Review Workflow
    status = Column(String(50), nullable=False, default="CLEARED")  # CLEARED, ACTION_REQUIRED, PENDING_REVIEW, VERIFIED
    action_comment = Column(Text, nullable=True)
    requested_by = Column(String(100), nullable=True)
    action_due_date = Column(String(50), nullable=True)

    tender = relationship("Tender", back_populates="documents")


class ReusableDocument(Base):
    __tablename__ = "reusable_documents"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Company Statutory")
    company_name = Column(String(150), nullable=True, default="PrimeTech Ltd")
    company_role = Column(String(50), nullable=True, default="LEAD_BIDDER")
    is_jv_partner = Column(Boolean, default=False)
    uploaded_at = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=True)
    size = Column(String(50), nullable=False, default="2.0 MB")
    revision = Column(String(20), nullable=False, default="v1.0")
    access_level = Column(String(50), nullable=False, default="ALL_TEAM")
    sha256 = Column(String(64), nullable=False)
    description = Column(String(255), nullable=True)
    file_path = Column(String(255), nullable=True)
