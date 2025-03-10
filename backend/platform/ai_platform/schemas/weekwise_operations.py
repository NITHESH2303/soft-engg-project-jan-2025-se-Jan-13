from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class VideoLectureBase(BaseModel):
    title: str
    transcript: Optional[str] = None
    duration: str
    video_link: str
    course_id: int
    week_no: int
    modified_at: Optional[datetime] = None


class PracticeAssignmentBase(BaseModel):
    title: str | None
    deadline: datetime
    is_coding_assignment: bool
    description: str | None
    assignment_content: List[dict]
    course_id: int
    week_no: int
    modified_at: Optional[datetime] = None


class GradedAssignmentBase(BaseModel):
    title: str | None
    deadline: datetime
    is_coding_assignment: bool
    description: str | None
    assignment_content: List[dict]
    course_id: int
    week_no: int
    modified_at: Optional[datetime] = None


class WeekwiseContentResponse(BaseModel):
    id: int
    course_id: int
    week_no: int
    term: str
    upload_date: datetime  # Change to datetime
    created_at: datetime
    modified_at: Optional[datetime] = None
    videos: List[VideoLectureBase]
    practice_assignments: List[PracticeAssignmentBase]
    graded_assignments: List[GradedAssignmentBase]

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()  # Convert datetime to ISO format string
        }

class WeekwiseContentCreate(BaseModel):
    course_id: int
    week_no: int
    term: Optional[str] = Field(default="Spring", description="Term for the content, defaults to 'Spring'")
    upload_date: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat(), description="Upload date, defaults to current timestamp")
    video_lectures: Optional[List[VideoLectureBase]] = Field(default=[], description="List of video lectures, optional")
    practice_assignments: Optional[List[PracticeAssignmentBase]] = Field(default=[], description="List of practice assignments, optional")
    graded_assignments: Optional[List[GradedAssignmentBase]] = Field(default=[], description="List of graded assignments, optional")


# Update schema
class WeekwiseContentUpdate(BaseModel):
    course_id: int
    week_no: int
    term: Optional[str] = None
    upload_date: Optional[datetime] = None
    video_lectures: Optional[List[VideoLectureBase]] = None
    practice_assignments: Optional[List[PracticeAssignmentBase]] = None
    graded_assignments: Optional[List[GradedAssignmentBase]] = None