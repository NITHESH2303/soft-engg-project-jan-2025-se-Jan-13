from pydantic import BaseModel
from typing import Optional


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
