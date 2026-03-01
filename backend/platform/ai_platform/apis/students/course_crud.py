from fastapi import HTTPException
from sqlalchemy.orm import Session

from ai_platform.schemas.weekwise_content import WeekContentDetails, CourseWeekWiseDetails
from ai_platform.supafast.models.weekwise_content import WeekwiseContent


def get_course_weeks(db: Session, course_id: int) -> CourseWeekWiseDetails:
    # SAFETY: Ensure course_id is an integer to prevent database crash
    try:
        course_id = int(course_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid course_id: {course_id}. Must be an integer.")

    # Fetch weekwise content for the course
    weeks = db.query(WeekwiseContent).filter(WeekwiseContent.course_id == course_id).order_by(WeekwiseContent.week_no).all()
    if not weeks:
        raise HTTPException(status_code=404, detail="No content found for this course")
    course_content = []
    for week in weeks:
        week_content = WeekContentDetails(
            title=week.title,
            week_no=week.week_no,  # Keeping this for response clarity
            term=week.term,
            upload_date=week.upload_date,
        )
        course_content.append(week_content)
    return CourseWeekWiseDetails(course_id=course_id, weeks=course_content)
