# seed.py
from ai_platform.supafast.models.users import User
from database import SessionLocal, engine
from ai_platform.supafast.models.courses import Course, Assignment, Deadline

db = SessionLocal()

# Add courses
courses = [
    Course(
        title="Business Data Management",
        category="Data Science",
        icon="📊",
        description="Learn to manage and analyze business data effectively"
    ),
    Course(
        title="Business Analytics",
        category="Data Science",
        icon="📈",
        description="Master the fundamentals of business analytics"
    ),
    Course(
        title="Modern Application Development - I",
        category="Programming",
        icon="💻",
        description="Build modern web applications using React"
    ),
]

db.add_all(courses)
db.commit()

# Add assignments and deadlines
student = db.query(User).filter(User.username == "pankaj").first()
for course in courses:
    assignment = Assignment(student_id=student.id, course_id=course.id)
    db.add(assignment)
    db.commit()

    deadline = Deadline(
        assignment_id=assignment.id,
        subject="Python",
        assignment_no=2,
        deadline="08 February 2025",
        status="Pending"
    )
    db.add(deadline)
    db.commit()