from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.courses import CourseResponse, DeadlineResponse, AssignCourseResponse, AssignCourseRequest
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Course, Assignment, Deadline
from ai_platform.supafast.models.users import User

router = APIRouter()


# Fetch registered courses for a student
# Fetch registered courses for a student
@router.get("/courses", response_model=List[CourseResponse])
async def get_student_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    # Fetch courses assigned to the student
    courses = db.query(Course).join(Assignment).filter(Assignment.student_id == current_user.id).all()
    return courses

# Fetch deadlines for a student
@router.get("/deadlines", response_model=List[DeadlineResponse])
async def get_student_deadlines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    # Fetch deadlines for the student's assignments
    deadlines = db.query(Deadline).join(Assignment).filter(Assignment.student_id == current_user.id).all()
    return deadlines

# Assign a course to a student (for TAs, instructors, and admins)
@router.post("/ta/assign-course", response_model=AssignCourseResponse)
async def assign_course(
    request: AssignCourseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ta", "instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only TAs, instructors, and admins can assign courses")

    # Check if the student exists
    student = db.query(User).filter(User.id == request.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if the course exists
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if the course is already assigned to the student
    existing_assignment = db.query(Assignment).filter(
        Assignment.student_id == request.student_id,
        Assignment.course_id == request.course_id
    ).first()
    if existing_assignment:
        raise HTTPException(status_code=400, detail="Course already assigned to the student")

    # Create a new assignment
    new_assignment = Assignment(student_id=request.student_id, course_id=request.course_id)
    db.add(new_assignment)
    db.commit()

    return AssignCourseResponse(message="Course assigned successfully")