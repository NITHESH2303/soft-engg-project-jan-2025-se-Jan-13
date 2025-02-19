from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Table
from sqlalchemy.orm import relationship

from ai_platform.supafast.database import Base


# Association tables for the different course relationships
student_completed_courses = Table('student_completed_courses', Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

student_pending_courses = Table('student_pending_courses', Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

student_current_courses = Table('student_current_courses', Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=False)

    # Relationships with Students (many-to-many)
    students_completed = relationship("Student", secondary=student_completed_courses,
                                      back_populates="completed_courses")
    students_pending = relationship("Student", secondary=student_pending_courses, back_populates="pending_courses")
    students_current = relationship("Student", secondary=student_current_courses, back_populates="current_courses")
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
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    assignment_no = Column(Integer, nullable=False)
    deadline = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Pending")

    # Relationship with assignment
    assignment = relationship("Assignment", back_populates="deadlines")
