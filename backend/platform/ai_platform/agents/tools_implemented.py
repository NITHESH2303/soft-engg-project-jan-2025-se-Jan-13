from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from ai_platform.supafast.models.courses import Course
from ai_platform.supafast.models.weekwise_content import WeekwiseContent, VideoLecture, GradedAssignment, \
    PracticeAssignment


# Define the tool function (without @tool decorator since we’ll bind it manually)
def get_course_content(
        db: Session,
        course_id: int,
        week_no: Optional[int] = None,
        lecture_no: Optional[int] = None,
        is_transcript_required: bool = False,
        graded_assignment_id: Optional[int] = None,
        practice_assignment_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Fetch course content details from the database based on provided filters.
    Returns a structured dictionary for the AI agent to use.
    """
    print(f"Calling tool get_course_content with args: {course_id}, {week_no}, {lecture_no}")
    result = {"course_id": course_id, "content": {}}

    # Fetch course details
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return {"error": f"Course with ID {course_id} not found."}
    result["content"]["course_title"] = course.title
    result["content"]["description"] = course.description

    # Fetch week-wise content if week_no is provided
    if week_no:
        week_content = (
            db.query(WeekwiseContent)
            .filter(WeekwiseContent.course_id == course_id, WeekwiseContent.week_no == week_no)
            .first()
        )
        if week_content:
            result["content"]["week"] = {
                "week_no": week_content.week_no,
                "title": week_content.title,
                "term": week_content.term
            }

            # Fetch lectures if lecture_no is provided
            if lecture_no:
                lecture = (
                    db.query(VideoLecture)
                    .filter(
                        VideoLecture.course_id == course_id,
                        VideoLecture.week_no == week_no,
                        VideoLecture.lecture_no == lecture_no
                    )
                    .first()
                )
                if lecture:
                    lecture_data = {
                        "title": lecture.title,
                        "duration": lecture.duration,
                        "video_link": lecture.video_link
                    }
                    if is_transcript_required:
                        lecture_data["transcript"] = lecture.transcript
                    result["content"]["lecture"] = lecture_data

    # Fetch graded assignment if ID is provided
    if graded_assignment_id:
        graded_assignment = (
            db.query(GradedAssignment)
            .filter(GradedAssignment.assignment_no == graded_assignment_id, GradedAssignment.course_id == course_id)
            .first()
        )
        if graded_assignment:
            result["content"]["graded_assignment"] = {
                "title": graded_assignment.title,
                "description": graded_assignment.description,
                "deadline": graded_assignment.deadline,
                "assignment_content": graded_assignment.assignment_content
            }

    # Fetch practice assignment if ID is provided
    if practice_assignment_id:
        practice_assignment = (
            db.query(PracticeAssignment)
            .filter(PracticeAssignment.assignment_no == practice_assignment_id,
                    PracticeAssignment.course_id == course_id)
            .first()
        )
        if practice_assignment:
            result["content"]["practice_assignment"] = {
                "title": practice_assignment.title,
                "description": practice_assignment.description,
                "deadline": practice_assignment.deadline,
                "assignment_content": practice_assignment.assignment_content
            }

    # Calculate total weeks in the course (if no specific week is requested)
    if not week_no and not lecture_no and not graded_assignment_id and not practice_assignment_id:
        total_weeks = db.query(WeekwiseContent).filter(WeekwiseContent.course_id == course_id).count()
        result["content"]["total_weeks"] = total_weeks

    return result
