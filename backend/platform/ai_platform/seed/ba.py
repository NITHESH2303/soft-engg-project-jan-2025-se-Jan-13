from ai_platform.supafast.models.users import User
from ai_platform.supafast.database import SessionLocal, engine
from ai_platform.supafast.models.courses import Course, Assignment, Deadline

db = SessionLocal()

# Add courses
course = Course(
    title="BUSINESS ANALYTICS",
    category="Data Science",
    icon="📈",
    description="Learn to manage and analyze business need effectively"
)

db.add(course)
db.commit()

