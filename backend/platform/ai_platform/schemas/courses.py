from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime


class StudentProfileCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email_id: EmailStr


class StudentProfileResponse(StudentProfileCreate):
    id: int
    roll_number: str
    current_term: int

    class Config:
        orm_mode = True


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


class CourseBase(BaseModel):
    title: str
    category: str
    icon: str
    description: str


class CourseCreate(CourseBase):
    pass


class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True


class StudentBase(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    roll_number: str
    email_id: str


class StudentCreate(StudentBase):
    pass


class Student(StudentBase):
    id: int
    current_term: int = 1
    completed_course_ids: List[int] = []
    pending_course_ids: List[int] = []
    current_term_course_ids: List[int] = []

    class Config:
        orm_mode = True


class CourseRegistrationRequest(BaseModel):
    course_ids: List[int] = Field(..., description="List of course IDs to register")


class CourseRegistrationResponse(BaseModel):
    message: str
    registered_courses: List[Course]
