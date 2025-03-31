from typing import List, Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.courses import CourseResponse, CourseRegistrationRequest, DeadlineResponse
from ai_platform.schemas.weekwise_content import CourseContentResponse, GradedAssignmentResponse, \
    PracticeAssignmentResponse, VideoLectureResponse, WeekContentResponse
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Course, Assignment, Deadline, AssignmentSubmission
from ai_platform.supafast.models.users import User, Student
from ai_platform.supafast.models.weekwise_content import GradedAssignment, PracticeAssignment, VideoLecture, \
    WeekwiseContent
from datetime import datetime, timezone

router = APIRouter()


@router.post("/register-courses", response_model=List[CourseResponse])  # Updated response_model
async def register_courses(
        request: CourseRegistrationRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    **Register a student for courses.**
    
    Allows students and admins to register for multiple courses.

    **Args:**
        request (CourseRegistrationRequest): Course registration request containing course IDs.
        current_user (User): The authenticated user.
        db (Session): Database session.

    **Returns:**
        List[CourseResponse]: List of registered courses.

    **Raises:**
        HTTPException: If the user is not authorized, the student profile is missing, or course IDs are invalid.
    """
    if current_user.role not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Only students and admins can register for courses")

    student = db.query(Student).filter(Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found. Please create a profile first.")

    courses = db.query(Course).filter(Course.id.in_(request.course_ids)).all()
    if len(courses) != len(request.course_ids):
        raise HTTPException(status_code=400, detail="One or more course IDs are invalid")

    # Update current term courses - Assign Course objects directly
    student.current_courses = courses

    # Increment current_term if it's a new registration
    if not student.current_courses:
        student.current_term += 1

    # Generate or update roll number if it doesn't exist
    if not student.roll_number:
        current_year = datetime.now().year
        student.roll_number = Student.generate_roll_number(current_year, student.current_term)

    # Create Assignment entries for each course
    for course in courses:
        assignment = Assignment(student_id=current_user.id, course_id=course.id)
        db.add(assignment)

    try:
        db.commit()
        # Convert Course objects to CourseResponse schema objects before returning
        return [CourseResponse.model_validate(course) for course in courses]
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while registering courses")


@router.get("/courses/{course_id}", response_model=CourseContentResponse)
async def get_course_content(
        course_id: int,
        db: Session = Depends(get_db)
):
    """
    **Retrieve the content for a specific course, including video lectures, 
    practice assignments, and graded assignments for each week.**

    **Args:**
        course_id (int): The ID of the course for which content is being retrieved.
        db (Session): The database session dependency.

    **Returns:**
        CourseContentResponse: A structured response containing course ID 
        and weekly content details such as videos, assignments, and graded assessments.

    **Raises:**
        HTTPException 404: If no content is found for the given course ID.
    """

    # Fetch weekwise content for the course
    weeks = db.query(WeekwiseContent).filter(WeekwiseContent.course_id == course_id).all()
    if not weeks:
        raise HTTPException(status_code=404, detail="No content found for this course")

    # Fetch video lectures, practice assignments, and graded assignments for each week
    course_content = []
    for week in weeks:
        videos = db.query(VideoLecture).filter(
            VideoLecture.course_id == course_id,
            VideoLecture.week_no == week.id  # Updated to use week.id
        ).all()

        practice_assignments = db.query(PracticeAssignment).filter(
            PracticeAssignment.course_id == course_id,
            PracticeAssignment.week_no == week.id  # Updated to use week.id
        ).all()

        graded_assignments = db.query(GradedAssignment).filter(
            GradedAssignment.course_id == course_id,
            GradedAssignment.week_no == week.id  # Updated to use week.id
        ).all()

        week_content = WeekContentResponse(
            week_no=week.week_no,  # Keeping this for response clarity
            term=week.term,
            upload_date=week.upload_date,
            videos=[VideoLectureResponse(**video.__dict__) for video in videos],
            practice_assignments=[PracticeAssignmentResponse(**pa.__dict__) for pa in practice_assignments],
            graded_assignments=[GradedAssignmentResponse(**ga.__dict__) for ga in graded_assignments]
        )
        course_content.append(week_content)

    return CourseContentResponse(course_id=course_id, weeks=course_content)


@router.get("/deadlines", response_model=List[DeadlineResponse])
async def get_student_deadlines(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Fetch upcoming assignment deadlines for a student's registered courses with submission status.

    Args:
        current_user (User): The authenticated student.
        db (Session): Database session.

    Returns:
        List[DeadlineResponse]: List of upcoming assignment deadlines with submission status.

    Raises:
        HTTPException: If the user is not a student.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    # Get the student record
    student = db.query(Student).filter(Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Get current timestamp in UTC
    current_time = datetime.now(ZoneInfo("UTC"))

    # Get the student's current course IDs
    current_course_ids = [course.id for course in student.current_courses]

    if not current_course_ids:
        return []

    # Process Graded Assignments
    graded_deadlines = (
        db.query(
            GradedAssignment.id,
            GradedAssignment.course_id,
            GradedAssignment.assignment_no,
            GradedAssignment.deadline,
            GradedAssignment.title,
            Course.title.label("course_title")
        )
        .join(Course, GradedAssignment.course_id == Course.id)
        .filter(
            GradedAssignment.course_id.in_(current_course_ids),
            GradedAssignment.deadline >= current_time.isoformat()
        )
        .all()
    )

    # Process Practice Assignments
    practice_deadlines = (
        db.query(
            PracticeAssignment.id,
            PracticeAssignment.course_id,
            PracticeAssignment.assignment_no,
            PracticeAssignment.deadline,
            PracticeAssignment.title,
            Course.title.label("course_title")
        )
        .join(Course, PracticeAssignment.course_id == Course.id)
        .filter(
            PracticeAssignment.course_id.in_(current_course_ids),
            PracticeAssignment.deadline >= current_time.isoformat()
        )
        .all()
    )

    # Fetch all submissions for this student in one query for efficiency
    submissions = (
        db.query(AssignmentSubmission)
        .filter(AssignmentSubmission.student_id == student.id)
        .all()
    )
    # Create a set of assignment IDs that have submissions
    submitted_assignment_ids = {submission.assignment_id for submission in submissions}

    # Combine and process deadlines
    result = []

    # Process Graded Assignments
    for deadline in graded_deadlines:
        try:
            deadline_time = datetime.fromisoformat(deadline.deadline).replace(tzinfo=ZoneInfo("UTC"))
        except ValueError:
            deadline_time = datetime.fromisoformat(deadline.deadline)
            if deadline_time.tzinfo is None:
                deadline_time = deadline_time.replace(tzinfo=ZoneInfo("UTC"))

        result.append(DeadlineResponse(
            id=deadline.id,
            course_id=deadline.course_id,
            assignment_no=deadline.assignment_no,
            deadline=deadline.deadline,
            is_passed=False,  # Since we filter for future deadlines
            submitted=deadline.id in submitted_assignment_ids,  # Check if submitted
            assignment_type="graded",
            title=deadline.title,
            course_title=deadline.course_title
        ))

    # Process Practice Assignments
    for deadline in practice_deadlines:
        try:
            deadline_time = datetime.fromisoformat(deadline.deadline).replace(tzinfo=ZoneInfo("UTC"))
        except ValueError:
            deadline_time = datetime.fromisoformat(deadline.deadline)
            if deadline_time.tzinfo is None:
                deadline_time = deadline_time.replace(tzinfo=ZoneInfo("UTC"))

        result.append(DeadlineResponse(
            id=deadline.id,
            course_id=deadline.course_id,
            assignment_no=deadline.assignment_no,
            deadline=deadline.deadline,
            is_passed=False,  # Since we filter for future deadlines
            submitted=deadline.id in submitted_assignment_ids,  # Check if submitted
            assignment_type="practice",
            title=deadline.title,
            course_title=deadline.course_title
        ))

    # Sort deadlines by deadline date
    result.sort(key=lambda x: x.deadline)

    return result
