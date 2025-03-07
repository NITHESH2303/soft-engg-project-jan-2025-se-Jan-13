from ai_platform.supafast.models.users import User
from ai_platform.supafast.database import SessionLocal, engine
from ai_platform.supafast.models.courses import Course, Assignment, Deadline

db = SessionLocal()

# Add courses
course = Course(
    title="Business Data Management",
    category="Data Science",
    icon="📊",
    description="Learn to manage and analyze business data effectively"
)

db.add(course)
db.commit()

[{
    "video1": "https://youtu.be/OMHbGm9SQuE",
    "title": "OverView",
    "duration": "25:39",
    "transcript": "Understand the importance of database management systems in modern day applications"
}]

"""
Submission Payload: {
  "course_id": 4,
  "week_no": 1,
  "video_lectures": [
    {
      "title": "OverView",
      "transcript": "dfgdfghdfgd",
      "duration": "24",
      "video_link": "dfgdfgh",
      "course_id": 4,
      "week_no": 1
    },
    {
      "title": "fsdfsdef",
      "transcript": "dfsdfsdf",
      "duration": "53535",
      "video_link": "fdffs",
      "course_id": 4,
      "week_no": 1
    }
  ],
  "practice_assignments": [
    {
      "title": "egsdsdfgsdfg",
      "deadline": "2025-03-21T19:34",
      "is_coding_assignment": false,
      "description": "weagweagswgsg",
      "assignment_content": [
        {
          "id": 1,
          "question": "safgsgasgassdsd",
          "type": "mcq",
          "options": [
            {
              "text": "sgfsdgsd",
              "isCorrect": true
            },
            {
              "text": "sdgsdgsd",
              "isCorrect": false
            }
          ],
          "points": 1,
          "answer": "",
          "hint": "sdfgsdgsdgsd",
          "comment": "sdgsdgsdgs"
        }
      ],
      "course_id": 4,
      "week_no": 1
    }
  ],
  "graded_assignments": [
    {
      "title": "asdgsdgsd",
      "deadline": "2025-03-06T19:34",
      "is_coding_assignment": false,
      "description": "sdgsdgsdg",
      "assignment_content": [
        {
          "id": 1,
          "question": "sdgsdgsdsdg",
          "type": "mcq",
          "options": [
            {
              "text": "sdgsdgsdsdg",
              "isCorrect": true
            },
            {
              "text": "gsdgsdgsdsd",
              "isCorrect": false
            }
          ],
          "points": 1,
          "answer": "",
          "hint": "gsdgsd",
          "comment": "gsdgsdg",
          "format": "Write your answer"
        }
      ],
      "course_id": 4,
      "week_no": 1
    }
  ]
}"""