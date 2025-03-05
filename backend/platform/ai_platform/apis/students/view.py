from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ai_platform.app_enums import AssignmentType
from ai_platform.schemas.courses import Student
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.courses import Assignment, AssignmentSubmission

router = APIRouter()

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# Define AssignmentType Enum


# Schema for creating a submission
class AssignmentSubmissionCreate(BaseModel):
    assignment_id: int
    course_id: Optional[int] = None
    week_id: Optional[int] = None
    student_id: int
    assignment_type: AssignmentType
    submission_content: Optional[str] = None  # Could be text, link, or file reference


@router.post("/assignment/submit", status_code=201)
def submit_assignment(
        submission: AssignmentSubmissionCreate,
        db: Session = Depends(get_db)
):
    """API for student to submit the graded, coding or practice assignment"""
    # Check if assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check if student exists
    student = db.query(Student).filter(Student.id == submission.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Create assignment submission
    new_submission = AssignmentSubmission(
        assignment_id=submission.assignment_id,
        course_id=submission.course_id,
        week_id=submission.week_id,
        student_id=submission.student_id,
        assignment_type=submission.assignment_type,
        submission_content=submission.submission_content,
        submitted_at=datetime.utcnow(),
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return {"message": "Assignment submitted successfully", "submission_id": new_submission.id}
