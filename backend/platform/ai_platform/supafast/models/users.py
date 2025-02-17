import random

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from ai_platform.supafast.database import Base
import string


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


student_completed_courses = Table('student_completed_courses', Base.metadata,
                                  Column('student_id', Integer, ForeignKey('students.id')),
                                  Column('course_id', Integer, ForeignKey('courses.id'))
                                  )

student_pending_courses = Table('student_pending_courses', Base.metadata,
                                Column('student_id', Integer, ForeignKey('students.id')),
                                Column('course_id', Integer, ForeignKey('courses.id'))
                                )

student_current_term_courses = Table('student_current_term_courses', Base.metadata,
                                     Column('student_id', Integer, ForeignKey('students.id')),
                                     Column('course_id', Integer, ForeignKey('courses.id'))
                                     )


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    middle_name = Column(String)
    last_name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, nullable=False)
    email_id = Column(String, unique=True, nullable=False)
    current_term = Column(Integer, default=1)

    # Relationships
    completed_courses = relationship("Course", secondary=student_completed_courses, back_populates="students_completed")
    pending_courses = relationship("Course", secondary=student_pending_courses, back_populates="students_pending")
    current_term_courses = relationship("Course", secondary=student_current_term_courses,
                                        back_populates="students_current_term")

    # Relationship with User
    user = relationship("User", back_populates="student_profile")

    @staticmethod
    def generate_roll_number(year, term):
        year_prefix = str(year)[-2:]
        random_suffix = ''.join(random.choices(string.digits, k=7))
        return f"{year_prefix}f{term}{random_suffix}"


