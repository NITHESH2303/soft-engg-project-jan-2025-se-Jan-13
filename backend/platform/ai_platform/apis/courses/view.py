from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.courses import CourseResponse, DeadlineResponse, CourseRegistrationRequest
from ai_platform.schemas.weekwise_content import CourseContentResponse, GradedAssignmentResponse, \
    PracticeAssignmentResponse, VideoLectureResponse, WeekContentResponse
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Course, Assignment, Deadline
from ai_platform.supafast.models.users import User, Student
from ai_platform.supafast.models.weekwise_content import GradedAssignment, PracticeAssignment, VideoLecture, \
    WeekwiseContent
from datetime import datetime

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


# Fetch deadlines for a student
@router.get("/deadlines", response_model=List[DeadlineResponse])
async def get_student_deadlines(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    **Fetch assignment deadlines for a student.**
    
    Retrieves upcoming assignment deadlines along with course details.

    **Args:**
        current_user (User): The authenticated student.
        db (Session): Database session.

    **Returns:**
        List[DeadlineResponse]: List of assignment deadlines.

    **Raises:**
        HTTPException: If the user is not a student.
    """

    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    # Fetch deadlines for the student's assignments with course name
    deadlines = db.query(
        Deadline.id,
        Deadline.course_id,
        Deadline.assignment_no,
        Deadline.deadline,
        Deadline.status,
        Course.title.label("course_title")  # Include course title
    ).select_from(Deadline).join(Assignment,
                                 Deadline.assignment_id == Assignment.id).join(Course,
                                                                               Assignment.course_id == Course.id).filter(
        Assignment.student_id == current_user.id).all()

    # Convert the result to a list of dictionaries
    result = [
        {
            "id": deadline.id,
            "course_id": deadline.course_id,
            "assignment_no": deadline.assignment_no,
            "deadline": deadline.deadline,
            "status": deadline.status,
            "course_title": deadline.course_title  # Include course title in the response
        }
        for deadline in deadlines
    ]

    return result
