from fastapi import HTTPException
from sqlalchemy.orm import Session

from ai_platform.schemas.weekwise_operations import WeekwiseContentCreate, WeekwiseContentUpdate
from ai_platform.supafast.models.weekwise_content import VideoLecture, PracticeAssignment, GradedAssignment, \
    WeekwiseContent
from sqlalchemy.orm import selectinload


def create_weekwise_content(db: Session, content: WeekwiseContentCreate):
    # Check if week_no already exists for this course
    existing_content = (
        db.query(WeekwiseContent)
        .filter(
            WeekwiseContent.course_id == content.course_id,
            WeekwiseContent.week_no == content.week_no
        )
        .first()
    )
    if existing_content:
        # update the existing content
        return update_weekwise_content(db,content_id=existing_content.id,content_update=content)

    # Create the WeekwiseContent object
    db_content = WeekwiseContent(
        course_id=content.course_id,
        week_no=content.week_no,
        term=content.term,
        upload_date=content.upload_date
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)

    # Create VideoLecture objects (if provided)
    if content.video_lectures:
        for video in content.video_lectures:
            db_video = VideoLecture(
                course_id=content.course_id,
                week_no=db_content.week_no,
                title=video.title,
                transcript=video.transcript,
                duration=video.duration,
                video_link=video.video_link,
            )
            db.add(db_video)

    # Create PracticeAssignment objects (if provided)
    if content.practice_assignments:
        for practice in content.practice_assignments:
            db_practice = PracticeAssignment(
                course_id=content.course_id,
                week_no=db_content.week_no,
                title=practice.title,
                description=practice.description,
                assignment_content=practice.assignment_content,
                is_coding_assignment=practice.is_coding_assignment,
                deadline=practice.deadline,
            )
            db.add(db_practice)

    # Create GradedAssignment objects (if provided)
    if content.graded_assignments:
        for graded in content.graded_assignments:
            db_graded = GradedAssignment(
                course_id=content.course_id,
                week_no=db_content.week_no,
                title=graded.title,
                description=graded.description,
                assignment_content=graded.assignment_content,
                is_coding_assignment=graded.is_coding_assignment,
                deadline=graded.deadline,
            )
            db.add(db_graded)

    db.commit()
    db.refresh(db_content)
    return db_content


def get_weekwise_content(db: Session, course_id: int, content_id: int):
    return (
        db.query(WeekwiseContent)
        .options(
            selectinload(WeekwiseContent.videos),
            selectinload(WeekwiseContent.practice_assignments),
            selectinload(WeekwiseContent.graded_assignments),
        )
        .filter(
            WeekwiseContent.week_no == content_id,
            WeekwiseContent.course_id == course_id
        )
        .first()
    )


def update_weekwise_content(db: Session, content_id: int, content_update: WeekwiseContentUpdate):
    # Fetch existing content with related data
    db_content = (
        db.query(WeekwiseContent)
        .options(
            selectinload(WeekwiseContent.videos),
            selectinload(WeekwiseContent.practice_assignments),
            selectinload(WeekwiseContent.graded_assignments),
        )
        .filter(WeekwiseContent.id == content_id)
        .first()
    )
    if not db_content:
        raise HTTPException(status_code=404, detail="Weekwise content not found")

    # Update base fields if provided
    if content_update.term is not None:
        db_content.term = content_update.term
    if content_update.upload_date is not None:
        db_content.upload_date = content_update.upload_date

    # Update Videos
    if content_update.video_lectures is not None:
        existing_video_ids = {video.id for video in db_content.videos}
        new_video_ids = {video.id for video in content_update.video_lectures if video.id is not None}

        # Delete videos not in the new payload
        for video in db_content.videos[:]:  # Use a copy to avoid modifying during iteration
            if video.id not in new_video_ids:
                db.delete(video)

        # Add or update videos
        for video in content_update.video_lectures:
            if video.id and video.id in existing_video_ids:
                # Update existing video
                db_video = db.query(VideoLecture).filter(VideoLecture.id == video.id).first()
                if db_video:
                    db_video.title = video.title
                    db_video.transcript = video.transcript
                    db_video.duration = video.duration
                    db_video.video_link = video.video_link
            else:
                # Add new video (no id specified, let DB auto-increment)
                db_video = VideoLecture(
                    course_id=db_content.course_id,
                    week_no=db_content.week_no,
                    title=video.title,
                    transcript=video.transcript,
                    duration=video.duration,
                    video_link=video.video_link,
                )
                db.add(db_video)

    # Update Practice Assignments
    if content_update.practice_assignments is not None:
        existing_practice_ids = {pa.id for pa in db_content.practice_assignments}
        new_practice_ids = {pa.id for pa in content_update.practice_assignments if pa.id is not None}

        # Delete practice assignments not in the new payload
        for pa in db_content.practice_assignments[:]:
            if pa.id not in new_practice_ids:
                db.delete(pa)

        # Add or update practice assignments
        for pa in content_update.practice_assignments:
            if pa.id and pa.id in existing_practice_ids:
                # Update existing practice assignment
                db_pa = db.query(PracticeAssignment).filter(PracticeAssignment.id == pa.id).first()
                if db_pa:
                    db_pa.title = pa.title
                    db_pa.description = pa.description
                    db_pa.assignment_content = pa.assignment_content
                    db_pa.is_coding_assignment = pa.is_coding_assignment
                    db_pa.deadline = pa.deadline
            else:
                # Add new practice assignment (no id specified, let DB auto-increment)
                db_pa = PracticeAssignment(
                    course_id=db_content.course_id,
                    week_no=db_content.week_no,
                    title=pa.title,
                    description=pa.description,
                    assignment_content=pa.assignment_content,
                    is_coding_assignment=pa.is_coding_assignment,
                    deadline=pa.deadline,
                )
                db.add(db_pa)

    # Update Graded Assignments
    if content_update.graded_assignments is not None:
        existing_graded_ids = {ga.id for ga in db_content.graded_assignments}
        new_graded_ids = {ga.id for ga in content_update.graded_assignments if ga.id is not None}

        # Delete graded assignments not in the new payload
        for ga in db_content.graded_assignments[:]:
            if ga.id not in new_graded_ids:
                db.delete(ga)

        # Add or update graded assignments
        for ga in content_update.graded_assignments:
            if ga.id and ga.id in existing_graded_ids:
                # Update existing graded assignment
                db_ga = db.query(GradedAssignment).filter(GradedAssignment.id == ga.id).first()
                if db_ga:
                    db_ga.title = ga.title
                    db_ga.description = ga.description
                    db_ga.assignment_content = ga.assignment_content
                    db_ga.is_coding_assignment = ga.is_coding_assignment
                    db_ga.deadline = ga.deadline
            else:
                # Add new graded assignment (no id specified, let DB auto-increment)
                db_ga = GradedAssignment(
                    course_id=db_content.course_id,
                    week_no=db_content.week_no,
                    title=ga.title,
                    description=ga.description,
                    assignment_content=ga.assignment_content,
                    is_coding_assignment=ga.is_coding_assignment,
                    deadline=ga.deadline,
                )
                db.add(db_ga)

    # Commit the transaction and refresh the object
    try:
        db.commit()
        db.refresh(db_content)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return db_content