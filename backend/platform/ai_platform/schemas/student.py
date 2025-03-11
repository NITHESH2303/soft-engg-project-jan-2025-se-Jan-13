from pydantic import BaseModel
from typing import Optional

from ai_platform.app_enums import AssignmentType


class StudentCourseAnalyticsResponse(BaseModel):
    course_id: int
    total_submissions: int
    graded_submissions: int
    average_score: float


from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CourseProgress(BaseModel):
    id: int
    title: str
    progress: float
    status: str
    grade: Optional[str] = None
    completion_date: Optional[datetime] = None


class StudentProfileReadResponse(BaseModel):
    id: int
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email_id: str
    roll_number: str
    current_term: int
    completed_courses: List[CourseProgress]
    pending_courses: List[CourseProgress]
    current_courses: List[CourseProgress]



from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Define AssignmentType Enum


# Schema for creating a submission
class AssignmentSubmissionCreate(BaseModel):
    assignment_id: int
    course_id: Optional[int] = None
    week_id: Optional[int] = None
    student_id: int
    assignment_type: AssignmentType
    submission_content: Optional[str] = None  # Could be text, link, or file reference
