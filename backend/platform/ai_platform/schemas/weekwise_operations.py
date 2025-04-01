from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class VideoLectureBase(BaseModel):
    id: Optional[int] = None  # Add optional id field
    title: str
    transcript: Optional[str] = None
    duration: str
    video_link: str
    course_id: int
    week_no: int
    modified_at: Optional[datetime] = None

class PracticeAssignmentBase(BaseModel):
    id: Optional[int] = None  # Add optional id field
    title: Optional[str] = None
    deadline: datetime
    is_coding_assignment: bool
    description: Optional[str] = None
    assignment_content: List[dict]
    course_id: int
    week_no: int
    modified_at: Optional[datetime] = None

class GradedAssignmentBase(BaseModel):
    id: Optional[int] = None  # Add optional id field
    title: Optional[str] = None
    deadline: datetime
    is_coding_assignment: bool
    description: Optional[str] = None
    assignment_content: List[dict]
    course_id: int
    week_no: int
    modified_at: Optional[datetime] = None

class WeekwiseContentResponse(BaseModel):
    id: int
    course_id: int
    week_no: int
    term: str
    upload_date: datetime
    created_at: datetime
    modified_at: Optional[datetime] = None
    video_lectures: List[VideoLectureBase]
    practice_assignments: List[PracticeAssignmentBase]
    graded_assignments: List[GradedAssignmentBase]

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WeekwiseContentCreate(BaseModel):
    course_id: int
    week_no: int
    term: Optional[str] = Field(default="Spring")
    upload_date: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    video_lectures: Optional[List[VideoLectureBase]] = Field(default=[])
    practice_assignments: Optional[List[PracticeAssignmentBase]] = Field(default=[])
    graded_assignments: Optional[List[GradedAssignmentBase]] = Field(default=[])

class WeekwiseContentUpdate(BaseModel):
    course_id: int
    week_no: int
    term: Optional[str] = None
    upload_date: Optional[datetime] = None
    video_lectures: Optional[List[VideoLectureBase]] = None
    practice_assignments: Optional[List[PracticeAssignmentBase]] = None
    graded_assignments: Optional[List[GradedAssignmentBase]] = None