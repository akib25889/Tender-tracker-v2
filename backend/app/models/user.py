from sqlalchemy import Column, String, Integer, JSON, Text
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="TENDER_ANALYST")
    title = Column(String(100), nullable=False, default="Procurement Specialist")
    department = Column(String(100), nullable=True, default="Bid Operations")
    max_capacity = Column(Integer, nullable=False, default=5)
    avatar = Column(String(255), nullable=False, default="TM")
    profile_pic = Column(Text, nullable=True)

    # Personal Profile & CV Dossier Fields
    phone = Column(String(50), nullable=True)
    location = Column(String(150), nullable=True, default="Dhaka, Bangladesh")
    employment_type = Column(
        String(50), nullable=False, default="PERMANENT"
    )  # PERMANENT, JV_PARTNER_STAFF, EXTERNAL_CONSULTANT
    proposed_designation = Column(String(150), nullable=True)
    past_assignments = Column(JSON, nullable=True, default=list)
    certifications = Column(JSON, nullable=True, default=list)
    education = Column(JSON, nullable=True, default=list)
    active_tender_roles = Column(JSON, nullable=True, default=dict)
