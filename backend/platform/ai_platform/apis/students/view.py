from typing import List, Optional
from sqlalchemy import func
from ai_platform.schemas.courses import Student
from ai_platform.schemas.student import StudentCourseAnalyticsResponse, AssignmentSubmissionCreate
from ai_platform.supafast.models.courses import Assignment, AssignmentSubmission
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.courses import CourseResponse
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Course
from ai_platform.supafast.models.users import User, Student
from datetime import datetime


router = APIRouter()


@router.get("/courses", response_model=List[CourseResponse])
async def get_student_courses(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    **Retrieve courses registered by the student.**

    Fetches all courses in which the student is currently enrolled.

    **Args:**
        current_user (User): The authenticated student.
        db (Session): Database session.

    **Returns:**
        List[CourseResponse]: List of registered courses.

    **Raises:**
        HTTPException: If the student profile is not found.
    """
    # if current_user.role != "student":
    #     raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    student = db.query(Student).filter(Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Corrected query to fetch courses based on IDs in current_courses relationship
    course_ids = [course.id for course in student.current_courses]
    courses = db.query(Course).filter(Course.id.in_(course_ids)).all()

    return courses


@router.post("/assignment/submit", status_code=201)
def submit_assignment(
        submission: AssignmentSubmissionCreate,
        db: Session = Depends(get_db)
):
    """API for student to submit the graded, coding or practice assignment"""
    # Check if assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check if student exists
    student = db.query(Student).filter(Student.id == submission.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Create assignment submission
    new_submission = AssignmentSubmission(
        assignment_id=submission.assignment_id,
        course_id=submission.course_id,
        week_id=submission.week_id,
        student_id=submission.student_id,
        assignment_type=submission.assignment_type,
        submission_content=submission.submission_content,
        submitted_at=datetime.utcnow(),
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return {"message": "Assignment submitted successfully", "submission_id": new_submission.id}


@router.get("/analytics", response_model=List[StudentCourseAnalyticsResponse])
def get_student_course_analytics(
        course_id: Optional[int] = Query(None),
        student_id: Optional[int] = Query(None),
        db: Session = Depends(get_db),
        user=Depends(get_current_user)
):
    # Students can only view their own analytics
    if user.role == "student":
        student_id = user.id
    elif user.role not in ["ta", "instructor", "admin"] and not student_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    query = db.query(
        AssignmentSubmission.course_id,
        func.count(AssignmentSubmission.id).label("total_submissions"),
        func.count(AssignmentSubmission.score).label("graded_submissions"),
        func.coalesce(func.avg(AssignmentSubmission.score), 0).label("average_score")
    ).filter(AssignmentSubmission.student_id == student_id)

    if course_id:
        query = query.filter(AssignmentSubmission.course_id == course_id)

    query = query.group_by(AssignmentSubmission.course_id)

    results = query.all()

    return [StudentCourseAnalyticsResponse(**row._asdict()) for row in results]
