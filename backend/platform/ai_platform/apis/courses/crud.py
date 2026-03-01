from sqlalchemy.orm import Session
from fastapi import HTTPException
from ai_platform.schemas.admin import CourseResponse
from ai_platform.supafast.models.courses import Course
def get_course(db: Session, course_id: int) -> CourseResponse:
    # SAFETY: Ensure course_id is an integer to prevent database crash
    try:
        course_id = int(course_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid course_id: {course_id}. Must be an integer.")
        
    course = db.query(Course).filter(Course.id == course_id).first()  # Fetch the first result
    if not course:
        raise HTTPException(status_code=404, detail="No course found with the given course id")
    return CourseResponse(**course.__dict__)  # Convert ORM object to a dictionary
