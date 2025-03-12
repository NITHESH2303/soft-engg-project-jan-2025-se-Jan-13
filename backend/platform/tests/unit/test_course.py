from ai_platform.apis.courses.crud import get_course
from ai_platform.supafast.database import get_db


def test_get_course():
    db = next(get_db())
    course = get_course(db=db,course_id=1)
    print(course)