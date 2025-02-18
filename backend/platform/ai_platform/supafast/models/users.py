import random

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from ai_platform.supafast.database import Base
import string

from ai_platform.supafast.models.courses import student_completed_courses, student_current_courses,student_pending_courses


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
    student_profile = relationship("Student", back_populates="user", uselist=False)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    middle_name = Column(String)
    last_name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, nullable=False)
    email_id = Column(String, unique=True, nullable=False)
    current_term = Column(Integer, default=1)

    # Relationship with User
    user = relationship("User", back_populates="student_profile")

    # Relationships with Courses (many-to-many)
    completed_courses = relationship("Course", secondary=student_completed_courses, back_populates="students_completed")
    pending_courses = relationship("Course", secondary=student_pending_courses, back_populates="students_pending")
    current_courses = relationship("Course", secondary=student_current_courses, back_populates="students_current")

    @staticmethod
    def generate_roll_number(year, term):
        year_prefix = str(year)[-2:]
        random_suffix = ''.join(random.choices(string.digits, k=7))
        return f"{year_prefix}f{term}{random_suffix}"