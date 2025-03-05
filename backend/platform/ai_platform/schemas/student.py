from pydantic import BaseModel
from typing import Optional

class StudentCourseAnalyticsResponse(BaseModel):
    course_id: int
    total_submissions: int
    graded_submissions: int
    average_score: float
