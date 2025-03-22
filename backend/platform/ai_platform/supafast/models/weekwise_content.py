from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, ForeignKeyConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ai_platform.supafast.database import Base

from sqlalchemy import JSON


class WeekwiseContent(Base):
    __tablename__ = "weekwise_content"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True, default="Learning Module")
    week_no = Column(Integer, nullable=False)  # Week number (e.g., Week 1, Week 2)
    term = Column(String, nullable=False)  # Term for which the content is released
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    upload_date = Column(DateTime(timezone=True), server_default=func.now())  # Date when content is uploaded
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
    lecture_no = Column(Integer, nullable=True) # lecture Number
    week_no = Column(Integer, nullable=False)  # Part of the composite foreign key
    title = Column(String, nullable=False)  # Title of the video
    transcript = Column(String, nullable=True)  # Transcript of the video
    duration = Column(String, nullable=False)  # Duration of the video (e.g., "10:30")
    video_link = Column(String, nullable=False)  # Publicly accessible video link
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp
    # Composite Foreign Key
    __table_args__ = (
        ForeignKeyConstraint(
            ["course_id", "week_no"],
            ["weekwise_content.course_id", "weekwise_content.week_no"]
        ),
    )
    # Relationships
    week_content = relationship("WeekwiseContent", back_populates="videos")


class GradedAssignment(Base):
    __tablename__ = "graded_assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    assignment_no = Column(Integer,nullable=True,default=1)
    description = Column(String, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    week_no = Column(Integer, nullable=False)  # Part of the composite foreign key
    assignment_content = Column(JSON, nullable=False)  # Array of objects for questions and metadata
    is_coding_assignment = Column(Boolean, default=False)  # Whether it's a coding assignment
    deadline = Column(String, nullable=False)  # Deadline for the assignment
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp

    # Composite Foreign Key
    __table_args__ = (
        ForeignKeyConstraint(
            ["course_id", "week_no"],
            ["weekwise_content.course_id", "weekwise_content.week_no"]
        ),
    )

    # Relationships
    week_content = relationship("WeekwiseContent", back_populates="graded_assignments")


class PracticeAssignment(Base):
    __tablename__ = "practice_assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    assignment_no = Column(Integer, nullable=True, default=1)
    description = Column(String, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Foreign key to Course
    week_no = Column(Integer, nullable=False)  # Part of the composite foreign key
    lecture_id = Column(Integer, ForeignKey("video_lectures.id"), nullable=True)  # Optional foreign key to VideoLecture
    assignment_content = Column(JSON, nullable=False)  # Array of objects for questions and metadata
    is_coding_assignment = Column(Boolean, default=False)  # Whether it's a coding assignment
    deadline = Column(String, nullable=False)  # Deadline for the assignment
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Timestamp
    modified_at = Column(DateTime(timezone=True), onupdate=func.now())  # Last modified timestamp

    # Composite Foreign Key
    __table_args__ = (
        ForeignKeyConstraint(
            ["course_id", "week_no"],
            ["weekwise_content.course_id", "weekwise_content.week_no"]
        ),
    )

    # Relationships
    week_content = relationship("WeekwiseContent", back_populates="practice_assignments")
