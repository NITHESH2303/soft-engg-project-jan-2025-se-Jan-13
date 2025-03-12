from pydantic import BaseModel
from typing import List
from datetime import datetime


class VideoLectureResponse(BaseModel):
    id: int
    course_id: int
    week_no: int
    title: str
    transcript: str
    duration: str
    video_link: str
    created_at: datetime | None
    modified_at: datetime | None


class PracticeAssignmentResponse(BaseModel):
    id: int
    course_id: int
    week_no: int
    lecture_id: int
    assignment_content: List[dict]
    is_coding_assignment: bool
    deadline: str
    created_at: datetime
    modified_at: datetime | None


class GradedAssignmentResponse(BaseModel):
    id: int
    course_id: int
    week_no: int
    assignment_content: List[dict]
    is_coding_assignment: bool
    deadline: str
    created_at: datetime
    modified_at: datetime | None


class WeekContentResponse(BaseModel):
    week_no: int
    term: str
    upload_date: datetime
    videos: List[VideoLectureResponse]
    practice_assignments: List[PracticeAssignmentResponse]
    graded_assignments: List[GradedAssignmentResponse]


class WeekContentDetails(BaseModel):
    title: str | None
    week_no: int
    term: str
    upload_date: datetime


class CourseContentResponse(BaseModel):
    course_id: int
    weeks: List[WeekContentResponse]


class CourseWeekWiseDetails(BaseModel):
    course_id: int
    weeks: List[WeekContentDetails]
