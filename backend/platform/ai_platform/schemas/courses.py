from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Course schema for response
class CourseResponse(BaseModel):
    id: int
    title: str
    category: str
    icon: str
    description: str

    class Config:
        from_attributes = True  # Enable ORM mode for SQLAlchemy models


# Deadline schema for response
class DeadlineResponse(BaseModel):
    id: int
    course_id: int
    assignment_no: int
    deadline: str
    status: str
    course_title: str  # Add this field

    class Config:
        orm_mode = True

# Assign course schema for request
class AssignCourseRequest(BaseModel):
    student_id: int
    course_id: int


# Assign course schema for response
class AssignCourseResponse(BaseModel):
    message: str
