import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.admin.view import router
from ai_platform.schemas.courses import AssignCourseRequest
from ai_platform.supafast.models.users import User
from ai_platform.supafast.models.courses import Course, Assignment, AssignmentSubmission
from ai_platform.schemas.admin import AssignmentGradeRequest, CourseCreate, CourseUpdate
from datetime import datetime
from unittest.mock import Mock, patch

# Create a test client for the router
client = TestClient(router)

# Mock users
mock_ta_user = User(id=1, role="ta")
mock_student_user = User(id=2, role="student")
mock_course = Course(id=1, title="Test Course")
mock_submission = AssignmentSubmission(id=1, score=None, submitted_at=datetime.utcnow())


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def mock_ta_auth():
    """Fixture to mock TA authentication"""
    with patch("ai_platform.apis.admin.view.get_current_user", return_value=mock_ta_user):
        yield


def test_assign_course_success(mock_db, mock_ta_auth):
    """Test successful course assignment"""
    request_data = AssignCourseRequest(student_id=2, course_id=1)

    mock_db.query.return_value.filter.return_value.first.side_effect = [
        mock_student_user,  # Student exists
        mock_course,  # Course exists
        None  # No existing assignment
    ]
    mock_db.commit.return_value = None

    response = client.post(
        "/admin/ta/assign-course",
        json=request_data.dict(),
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Course assigned successfully"


def test_assign_course_unauthorized(mock_db):
    """Test course assignment with unauthorized user"""
    with patch("ai_platform.apis.admin.view.get_current_user", return_value=User(id=3, role="student")):
        response = client.post(
            "/admin/ta/assign-course",
            json={"student_id": 2, "course_id": 1},
            headers={"Authorization": "Bearer test"}
        )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only TAs, instructors, and admins can assign courses"


def test_assign_course_student_not_found(mock_db, mock_ta_auth):
    """Test course assignment when student doesn't exist"""
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.post(
        "/admin/ta/assign-course",
        json={"student_id": 2, "course_id": 1},
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Student not found"


def test_assign_course_already_assigned(mock_db, mock_ta_auth):
    """Test course assignment when course is already assigned"""
    mock_db.query.return_value.filter.return_value.first.side_effect = [
        mock_student_user,  # Student exists
        mock_course,  # Course exists
        Assignment(student_id=2, course_id=1)  # Existing assignment
    ]

    response = client.post(
        "/admin/ta/assign-course",
        json={"student_id": 2, "course_id": 1},
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Course already assigned to the student"


def test_get_ungraded_assignments_success(mock_db):
    """Test successful retrieval of ungraded assignments"""
    mock_db.query.return_value.filter.return_value.all.return_value = [mock_submission]

    response = client.get("/admin/grade/assignment")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == 1
    assert response.json()[0]["score"] is None


def test_get_ungraded_assignments_not_found(mock_db):
    """Test retrieval when no ungraded assignments exist"""
    mock_db.query.return_value.filter.return_value.all.return_value = []

    response = client.get("/admin/grade/assignment")

    assert response.status_code == 404
    assert response.json()["detail"] == "No ungraded assignments found"


def test_grade_assignment_success(mock_db):
    """Test successful grading of an assignment"""
    grade_data = AssignmentGradeRequest(submission_id=1, score=85)

    mock_db.query.return_value.filter.return_value.first.return_value = mock_submission
    mock_db.commit.return_value = None
    mock_db.refresh.return_value = None

    response = client.post(
        "/admin/grade/assignment",
        json=grade_data.dict()
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Assignment graded successfully"
    assert response.json()["submission_id"] == 1


def test_grade_assignment_not_found(mock_db):
    """Test grading non-existent assignment"""
    grade_data = AssignmentGradeRequest(submission_id=1, score=85)

    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.post(
        "/admin/grade/assignment",
        json=grade_data.dict()
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Assignment submission not found"


def test_grade_assignment_already_graded(mock_db):
    """Test grading already graded assignment"""
    grade_data = AssignmentGradeRequest(submission_id=1, score=85)
    graded_submission = AssignmentSubmission(id=1, score=90)

    mock_db.query.return_value.filter.return_value.first.return_value = graded_submission

    response = client.post(
        "/admin/grade/assignment",
        json=grade_data.dict()
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Assignment already graded"


def test_create_course_success(mock_db):
    """Test successful course creation"""
    course_data = CourseCreate(title="New Course")

    with patch("ai_platform.apis.admin.view.create_course", return_value=mock_course):
        response = client.post(
            "/admin/course/create",
            json=course_data.dict()
        )

    assert response.status_code == 201
    assert response.json()["id"] == 1
    assert response.json()["title"] == "Test Course"


def test_get_course_success(mock_db):
    """Test successful retrieval of a course"""
    with patch("ai_platform.apis.admin.view.get_course", return_value=mock_course):
        response = client.get("/admin/course/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_get_courses_success(mock_db):
    """Test successful retrieval of courses list"""
    with patch("ai_platform.apis.admin.view.get_courses", return_value=[mock_course]):
        response = client.get("/admin/courses")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == 1


def test_update_course_success(mock_db):
    """Test successful course update"""
    update_data = CourseUpdate(title="Updated Course")

    with patch("ai_platform.apis.admin.view.update_course", return_value=mock_course):
        response = client.put(
            "/admin/course/1",
            json=update_data.dict(exclude_unset=True)
        )

    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_delete_course_success(mock_db):
    """Test successful course deletion"""
    with patch("ai_platform.apis.admin.view.delete_course", return_value=True):
        response = client.delete("/admin/course/1")

    assert response.status_code == 200
    assert response.json()["message"] == "Course deleted successfully"


@pytest.mark.parametrize("role,expected_status", [
    ("ta", 200),
    ("instructor", 200),
    ("admin", 200),
    ("student", 403),
])
def test_assign_course_role_based(mock_db, role, expected_status):
    """Test course assignment access for different user roles"""
    with patch("ai_platform.apis.admin.view.get_current_user", return_value=User(id=1, role=role)):
        if role in ["ta", "instructor", "admin"]:
            mock_db.query.return_value.filter.return_value.first.side_effect = [
                mock_student_user, None, None
            ]
            mock_db.commit.return_value = None

        response = client.post(
            "/admin/ta/assign-course",
            json={"student_id": 2, "course_id": 1},
            headers={"Authorization": "Bearer test"}
        )

        assert response.status_code == expected_status


if __name__ == "__main__":
    pytest.main()