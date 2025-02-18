from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ai_platform.apis.auth.auth import get_current_user
from ai_platform.schemas.courses import CourseResponse, DeadlineResponse, AssignCourseResponse, AssignCourseRequest, \
    CourseRegistrationRequest, CourseRegistrationResponse, StudentProfileCreate, StudentProfileResponse
from ai_platform.schemas.weekwise_content import CourseContentResponse, GradedAssignmentResponse, \
    PracticeAssignmentResponse, VideoLectureResponse, WeekContentResponse
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Course, Assignment, Deadline
from ai_platform.supafast.models.users import User, Student
from ai_platform.supafast.models.weekwise_content import GradedAssignment, PracticeAssignment, VideoLecture, \
    WeekwiseContent
from datetime import datetime

router = APIRouter()


@router.post("/student-profile", response_model=StudentProfileResponse)
async def create_student_profile(
        profile: StudentProfileCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
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


@router.post("/register-courses", response_model=List[CourseResponse]) # Updated response_model
async def register_courses(
    request: CourseRegistrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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


@router.get("/courses", response_model=List[CourseResponse])
async def get_student_courses(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # if current_user.role != "student":
    #     raise HTTPException(status_code=403, detail="Only students can access this endpoint")

    student = db.query(Student).filter(Student.id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Corrected query to fetch courses based on IDs in current_courses relationship
    course_ids = [course.id for course in student.current_courses]
    courses = db.query(Course).filter(Course.id.in_(course_ids)).all()

    return courses


@router.get("/courses/{course_id}", response_model=CourseContentResponse)
async def get_course_content(
        course_id: int,
        db: Session = Depends(get_db)
):
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
