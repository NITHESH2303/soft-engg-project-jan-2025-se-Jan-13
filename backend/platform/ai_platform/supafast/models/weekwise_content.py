from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ai_platform.supafast.database import Base

from sqlalchemy import JSON


class WeekwiseContent(Base):
    __tablename__ = "weekwise_content"

    id = Column(Integer, primary_key=True, index=True)
    week_no = Column(Integer, nullable=False)  # Week number (e.g., Week 1, Week 2)
    term = Column(String, nullable=False)  # Term for which the content is released
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    upload_date = Column(String, nullable=False)  # Date when content is uploaded
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp

    # Relationships
    videos = relationship("VideoLecture", back_populates="week_content")
    practice_assignments = relationship("PracticeAssignment", back_populates="week_content")
    graded_assignments = relationship("GradedAssignment", back_populates="week_content")
    submissions = relationship("AssignmentSubmission", back_populates="week_content")  # Fixed to 'submissions'


class VideoLecture(Base):
    __tablename__ = "video_lectures"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    week_no = Column(Integer, ForeignKey("weekwise_content.id"), nullable=False)  # Foreign key to WeekwiseContent
    title = Column(String, nullable=False)  # Title of the video
    transcript = Column(String, nullable=True)  # Transcript of the video
    duration = Column(String, nullable=False)  # Duration of the video (e.g., "10:30")
    video_link = Column(String, nullable=False)  # Publicly accessible video link
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp

    # Relationships
    week_content = relationship("WeekwiseContent", back_populates="videos")


class GradedAssignment(Base):
    __tablename__ = "graded_assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    week_no = Column(Integer, ForeignKey("weekwise_content.id"), nullable=False)  # Foreign key to WeekwiseContent
    assignment_content = Column(JSON, nullable=False)  # Array of objects for questions and metadata
    is_coding_assignment = Column(Boolean, default=False)  # Whether it's a coding assignment
    deadline = Column(String, nullable=False)  # Deadline for the assignment
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp

    # Relationships
    week_content = relationship("WeekwiseContent", back_populates="graded_assignments")


class PracticeAssignment(Base):
    __tablename__ = "practice_assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    week_no = Column(Integer, ForeignKey("weekwise_content.id"), nullable=False)  # Foreign key to WeekwiseContent
    lecture_id = Column(Integer, ForeignKey("video_lectures.id"), nullable=True)  # Optional foreign key to VideoLecture
    assignment_content = Column(JSON, nullable=False)  # Array of objects for questions and metadata
    is_coding_assignment = Column(Boolean, default=False)  # Whether it's a coding assignment
    deadline = Column(String, nullable=False)  # Deadline for the assignment
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp

    # Relationships
    week_content = relationship("WeekwiseContent", back_populates="practice_assignments")
