from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from ai_platform.apis.admin.course_crud import update_course, get_courses, delete_course, get_course, create_course
from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.admin import AssignmentSubmissionResponse, AssignmentGradeRequest, CourseResponse, \
    CourseUpdate, CourseCreate
from ai_platform.schemas.courses import AssignCourseResponse, AssignCourseRequest
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Course, Assignment, AssignmentSubmission
from ai_platform.supafast.models.users import User

router = APIRouter()


# Assign a course to a student (for TAs, instructors, and admins)
@router.post("/ta/assign-course", response_model=AssignCourseResponse)
async def assign_course(
        request: AssignCourseRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    **Assign a course to a student (For TAs, instructors, and admins).**

    This endpoint allows authorized users to assign a course to a student.

    **Args:**
        request (AssignCourseRequest): Course assignment request containing student ID and course ID.
        current_user (User): The authenticated user (TA, instructor, or admin).
        db (Session): Database session.

    **Returns:**
        AssignCourseResponse: Confirmation message.

    **Raises:**
        HTTPException: If the user is unauthorized, student/course is not found, or course is already assigned.
    """
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


# GET: Retrieve all ungraded assignment submissions
@router.get("/grade/assignment", response_model=List[AssignmentSubmissionResponse])
def get_ungraded_assignments(
        db: Session = Depends(get_db),
):
    """
    Retrieve a list of ungraded assignment submissions for review.
    Only accessible to admin, instructors, and TAs.
    """
    submissions = (
        db.query(AssignmentSubmission)
        .filter(AssignmentSubmission.score.is_(None))  # Ungraded submissions
        .all()
    )

    if not submissions:
        raise HTTPException(status_code=404, detail="No ungraded assignments found")

    return submissions


# POST: Grade an assignment submission
@router.post("/grade/assignment", status_code=status.HTTP_200_OK)
def grade_assignment(
        grade_data: AssignmentGradeRequest,
        db: Session = Depends(get_db),
):
    """
    Grade an assignment submission by providing a score.
    Only accessible to admin, instructors, and TAs.
    """
    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == grade_data.submission_id
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Assignment submission not found")

    if submission.score is not None:
        raise HTTPException(status_code=400, detail="Assignment already graded")

    # Update submission with score and graded timestamp
    submission.score = grade_data.score
    submission.graded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    return {"message": "Assignment graded successfully", "submission_id": submission.id}


@router.post("/course/create", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_new_course(
        course: CourseCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new course.
    """
    db_course = create_course(db, course)
    return db_course


@router.get("/course/{course_id}", response_model=CourseResponse)
def read_course(
        course_id: int,
        db: Session = Depends(get_db)
):
    """
    Get a specific course by ID.
    """
    db_course = get_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course


@router.get("/courses", response_model=List[CourseResponse])
def read_courses(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Get a list of courses with pagination.
    """
    print(f"getting all courses")
    courses = get_courses(db, skip=skip, limit=limit)
    return courses


@router.put("/course/{course_id}", response_model=CourseResponse)
def update_existing_course(
        course_id: int,
        course_update: CourseUpdate,
        db: Session = Depends(get_db)
):
    """
    Update an existing course.
    """
    updated_course = update_course(db, course_id, course_update)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course


@router.delete("/course/{course_id}", status_code=status.HTTP_200_OK)
def delete_existing_course(
        course_id: int,
        db: Session = Depends(get_db)
):
    """
    Delete a course.
    """
    deleted_course = delete_course(db, course_id)
    if not deleted_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully", "course_id": course_id}
