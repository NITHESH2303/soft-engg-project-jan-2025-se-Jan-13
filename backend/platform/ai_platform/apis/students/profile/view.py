from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.student import CourseProgress, StudentProfileReadResponse
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Deadline
from ai_platform.supafast.models.users import User, Student
from ai_platform.schemas.courses import StudentProfileCreate, StudentProfileResponse

router = APIRouter()


@router.post("/student-profile", response_model=StudentProfileResponse)
async def create_student_profile(
        profile: StudentProfileCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    **Create a student profile.**

    Allows a student to create their profile, generating a unique roll number.

    **Args:**
        profile (StudentProfileCreate): Student profile details.
        current_user (User): The authenticated user.
        db (Session): Database session.

    **Returns:**
        StudentProfileResponse: The created student profile.

    **Raises:**
        HTTPException: If the user is not a student or the profile already exists.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can create a student profile")

    existing_profile = db.query(Student).filter(Student.id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Student profile already exists")

    current_year = datetime.now().year
    roll_number = Student.generate_roll_number(current_year, 1)  # Start with term 1

    new_profile = Student(
        id=current_user.id,
        first_name=profile.first_name,
        middle_name=profile.middle_name,
        last_name=profile.last_name,
        email_id=profile.email_id,
        roll_number=roll_number,
        current_term=1
    )

    try:
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while creating the student profile")

    return new_profile


@router.get("/profile", response_model=StudentProfileReadResponse)
async def get_student_profile(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    **Fetch the student's profile information, including completed, pending, and current courses with progress.**

    **Args:**
        current_user (User): The authenticated student.
        db (Session): Database session.

    **Returns:**
        StudentProfileResponse: The student's profile information.

    **Raises:**
        HTTPException: If the user is not a student or the profile does not exist.
    """

    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    # Fetch the student profile
    student_profile = db.query(Student).filter(Student.id == current_user.id).first()
    if not student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    for course in student_profile.completed_courses:
        print(course.__dict__, "Completed Courses")
    # Fetch completed courses
    completed_courses = [
        CourseProgress(
            id=course.id,
            title=course.title,
            progress=100.0,
            status="completed",
            grade="A",  # Placeholder, replace with actual grade logic
            completion_date=datetime.now()  # Placeholder, replace with actual completion date logic
        )
        for course in student_profile.completed_courses
    ]

    # Fetch pending courses
    pending_courses = [
        CourseProgress(
            id=course.id,
            title=course.title,
            progress=0.0,
            status="pending"
        )
        for course in student_profile.pending_courses
    ]

    # Fetch current courses with progress
    current_courses = []
    for course in student_profile.current_courses:
        # Fetch deadlines for the course
        deadlines = db.query(Deadline).filter(Deadline.course_id == course.id).all()
        total_weeks = 12
        weeks_completed = sum(1 for deadline in deadlines if deadline.status == "completed")
        progress = (weeks_completed / total_weeks) * 100

        current_courses.append(
            CourseProgress(
                id=course.id,
                title=course.title,
                progress=progress,
                status="in-progress"
            )
        )

    return StudentProfileReadResponse(
        id=student_profile.id,
        first_name=student_profile.first_name,
        middle_name=student_profile.middle_name,
        last_name=student_profile.last_name,
        email_id=student_profile.email_id,
        roll_number=student_profile.roll_number,
        current_term=student_profile.current_term,
        completed_courses=completed_courses,
        pending_courses=pending_courses,
        current_courses=current_courses
    )
