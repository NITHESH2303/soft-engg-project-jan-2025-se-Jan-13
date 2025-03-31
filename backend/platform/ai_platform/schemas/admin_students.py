from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Base course response model
# Updated Course response model with icon field
class ACourseResponse(BaseModel):
    id: int
    title: str
    category: str
    description: str
    icon: str  # Added required icon field

    class Config:
        orm_mode = True


# Student response model with course information
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

    class Config:
        orm_mode = True


# Response model for the full list
class AllStudentsResponse(BaseModel):
    students: List[StudentResponse]
