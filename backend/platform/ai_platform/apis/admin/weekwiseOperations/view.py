from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ai_platform.schemas.weekwise_operations import WeekwiseContentResponse, WeekwiseContentCreate, VideoLectureBase, \
    PracticeAssignmentBase, GradedAssignmentBase, WeekwiseContentUpdate
from ai_platform.supafast.database import get_db
from ai_platform.apis.admin.weekwiseOperations import crud


router = APIRouter()


@router.post("", response_model=WeekwiseContentResponse)
def create_weekwise_content(content: WeekwiseContentCreate, db: Session = Depends(get_db)):
    return crud.create_weekwise_content(db, content)


@router.get("/{course_id}/{content_id}", response_model=WeekwiseContentResponse)
def read_weekwise_content(course_id: int, content_id: int, db: Session = Depends(get_db)):
    db_content = crud.get_weekwise_content(db, course_id=course_id, content_id=content_id)
    if db_content is None:
        raise HTTPException(status_code=404, detail="Content not found for the given course and ID")

    # Convert SQLAlchemy model to Pydantic model
    content_response = WeekwiseContentResponse(
        id=db_content.id,
        course_id=db_content.course_id,
        week_no=db_content.week_no,
        term=db_content.term,
        upload_date=db_content.upload_date,
        created_at=db_content.created_at,
        modified_at=db_content.modified_at,
        video_lectures=[
            VideoLectureBase(
                id=video.id,
                title=video.title,
                transcript=video.transcript,
                duration=video.duration,
                video_link=video.video_link,
                course_id=video.course_id,
                week_no=video.week_no,
                created_at=video.created_at,
                modified_at=video.modified_at,
            )
            for video in db_content.videos
        ],
        practice_assignments=[
            PracticeAssignmentBase(
                id=assignment.id,
                title=assignment.title,
                deadline=assignment.deadline,
                is_coding_assignment=assignment.is_coding_assignment,
                description=assignment.description,
                assignment_content=assignment.assignment_content,
                course_id=assignment.course_id,
                week_no=assignment.week_no,
                created_at=assignment.created_at,
                modified_at=assignment.modified_at,
            )
            for assignment in db_content.practice_assignments
        ],
        graded_assignments=[
            GradedAssignmentBase(
                id=assignment.id,
                title=assignment.title,
                deadline=assignment.deadline,
                is_coding_assignment=assignment.is_coding_assignment,
                description=assignment.description,
                assignment_content=assignment.assignment_content,
                course_id=assignment.course_id,
                week_no=assignment.week_no,
                created_at=assignment.created_at,
                modified_at=assignment.modified_at,
            )
            for assignment in db_content.graded_assignments
        ],
    )
    return content_response

@router.put("/{content_id}", response_model=WeekwiseContentResponse)
def update_weekwise_content_endpoint(
    content_id: int,
    content: WeekwiseContentUpdate,
    db: Session = Depends(get_db)
):
    updated_content = crud.update_weekwise_content(db, content_id, content)
    # Convert to response model (similar to read_weekwise_content)
    return WeekwiseContentResponse(
        id=updated_content.id,
        course_id=updated_content.course_id,
        week_no=updated_content.week_no,
        term=updated_content.term,
        upload_date=updated_content.upload_date,
        created_at=updated_content.created_at,
        modified_at=updated_content.modified_at,
        videos=[VideoLectureBase(**video.__dict__) for video in updated_content.videos],
        practice_assignments=[PracticeAssignmentBase(**pa.__dict__) for pa in updated_content.practice_assignments],
        graded_assignments=[GradedAssignmentBase(**ga.__dict__) for ga in updated_content.graded_assignments],
    )

@router.delete("/{content_id}", response_model=WeekwiseContentResponse)
def delete_weekwise_content(content_id: int, db: Session = Depends(get_db)):
    db_content = crud.delete_weekwise_content(db, content_id)
    if db_content is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return db_content
