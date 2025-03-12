# crud/test_course.py
from sqlalchemy.orm import Session
from ai_platform.supafast.models.courses import Course
from ai_platform.schemas.admin import CourseCreate, CourseUpdate


def create_course(db: Session, course: CourseCreate):
    db_course = Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


def get_course(db: Session, course_id: int):
    return db.query(Course).filter(Course.id == course_id).first()


def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Course).offset(skip).limit(limit).all()


def update_course(db: Session, course_id: int, course_update: CourseUpdate):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        return None

    update_data = course_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_course, key, value)

    db.commit()
    db.refresh(db_course)
    return db_course


def delete_course(db: Session, course_id: int):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        return None

    db.delete(db_course)
    db.commit()
    return db_course