from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


# Define AssignmentType for Pydantic
class AssignmentType(str, Enum):
    GRADED = "graded"
    PRACTICE = "practice"
    CODING = "coding"


# Course response model
class ACourseResponse(BaseModel):
    id: int
    title: str
    category: str
    description: str
    icon: str

    class Config:
        from_attributes = True  # Updated for Pydantic V2


# New Assignment Submission response model
class AdminAssignmentSubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    course_id: Optional[int]
    week_id: Optional[int]
    assignment_type: AssignmentType
    submitted_at: datetime
    submission_content: Optional[str]
    score: Optional[int]
    graded_at: Optional[datetime]

    class Config:
        from_attributes = True  # Updated for Pydantic V2


# Updated Student response model with submissions
class StudentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    roll_number: str
    email_id: str
    current_term: int
    completed_courses: List[ACourseResponse]
    current_courses: List[ACourseResponse]
    pending_courses: List[ACourseResponse]
    submissions: List[AdminAssignmentSubmissionResponse]  # Added submissions

    class Config:
        from_attributes = True  # Updated for Pydantic V2


# Response model for the full list
class AllStudentsResponse(BaseModel):
    students: List[StudentResponse]
