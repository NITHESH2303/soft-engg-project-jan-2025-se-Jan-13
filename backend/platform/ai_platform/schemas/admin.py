# Response schema for GET request
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

from ai_platform.app_enums import AssignmentType


class AssignmentSubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    course_id: Optional[int]
    week_id: Optional[int]
    student_id: int
    assignment_type: AssignmentType
    submitted_at: datetime
    submission_content: Optional[str]
    score: Optional[int]
    graded_at: Optional[datetime]

    class Config:
        orm_mode = True  # Allows conversion from SQLAlchemy model to Pydantic


# Request schema for POST request (grading)
class AssignmentGradeRequest(BaseModel):
    submission_id: int
    score: int  # Score to assign (e.g., out of 100)

    class Config:
        orm_mode = True


# schemas/test_course.py
from pydantic import BaseModel
from typing import Optional, List


class CourseBase(BaseModel):
    title: str
    category: str
    icon: str
    description: str


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None


class CourseResponse(CourseBase):
    id: int

    class Config:
        orm_mode = True