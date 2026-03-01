from ai_platform.supafast.models.weekwise_content import WeekwiseContent, VideoLecture, GradedAssignment, \
    PracticeAssignment
from database import SessionLocal, engine

db = SessionLocal()


def seed_database():
    week1 = WeekwiseContent(
        week_no=1,
        term="Spring 2025",
        course_id=2,
        upload_date="2025-02-01"
    )
    db.add(week1)
    db.commit()
    db.refresh(week1)

    videos = [
        VideoLecture(
            course_id=2,
            week_no=week1.id,
            title="What is Data Management?",
            transcript="This video introduces the concept of data management...",
            duration="10:30",
            video_link="https://www.youtube.com/watch?v=FpApclVsLrw"
        ),
        VideoLecture(
            course_id=2,
            week_no=week1.id,
            title="Types of Business Data",
            transcript="In this video, we explore various types of business data...",
            duration="15:45",
            video_link="https://www.youtube.com/watch?v=FpApclVsLrw"
        ),
        VideoLecture(
            course_id=2,
            week_no=week1.id,
            title="Data Collection Methods",
            transcript="Learn about different methods of collecting business data...",
            duration="12:20",
            video_link="https://www.youtube.com/watch?v=FpApclVsLrw"
        )
    ]
    db.add_all(videos)
    db.commit()

    first_video = db.query(VideoLecture).filter_by(week_no=week1.id).first()

    graded_assignment = GradedAssignment(
        course_id=2,
        week_no=week1.id,
        assignment_content=[
            {"question": "What is the primary purpose of data management?", "type": "multiple_choice"},
            {"question": "Describe three methods of data collection.", "type": "essay"}
        ],
        is_coding_assignment=False,
        deadline="2025-02-15"
    )
    db.add(graded_assignment)
    db.commit()

    practice_assignment = PracticeAssignment(
        course_id=2,
        week_no=week1.id,
        lecture_id=first_video.id if first_video else None,
        assignment_content=[
            {"question": "List five types of business data.", "type": "short_answer"},
            {"question": "What are the advantages of digital data storage?", "type": "multiple_choice"}
        ],
        is_coding_assignment=False,
        deadline="2025-02-10"
    )
    db.add(practice_assignment)
    db.commit()

    db.close()


if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully!")
