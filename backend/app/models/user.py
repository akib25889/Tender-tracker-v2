from sqlalchemy import Column, String, Integer
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
    avatar = Column(String(10), nullable=False, default="TM")
