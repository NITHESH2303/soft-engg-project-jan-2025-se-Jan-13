from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship

from ai_platform.supafast.database import Base


# Course model
# models.py
# models.py
# Course model
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=False)

    # Relationship with assignments
    assignments = relationship("Assignment", back_populates="course")

# Assignment model
# models.py
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    # Relationships
    student = relationship("User", back_populates="courses")
    course = relationship("Course", back_populates="assignments")
    deadlines = relationship("Deadline", back_populates="assignment")  # Add this line
# Deadline model
# models.py
class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    subject = Column(String, nullable=False)
    assignment_no = Column(Integer, nullable=False)
    deadline = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Pending")

    # Relationship with assignment
    assignment = relationship("Assignment", back_populates="deadlines")