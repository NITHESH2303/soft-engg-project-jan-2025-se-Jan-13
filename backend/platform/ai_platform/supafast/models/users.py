from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from ai_platform.supafast.database import Base


class Role:
    STUDENT = "student"
    TA = "ta"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


# User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="student")
    disabled = Column(Boolean, default=False)

    # Relationship with assignments
    courses = relationship("Assignment", back_populates="student")