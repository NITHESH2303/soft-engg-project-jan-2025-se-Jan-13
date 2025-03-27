import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.students import router
from ai_platform.supafast.models.courses import Course, Assignment, AssignmentSubmission
from ai_platform.supafast.models.users import User, Student as StudentModel
from ai_platform.schemas.student import AssignmentSubmissionCreate
from datetime import datetime
from unittest.mock import Mock, patch

# Create a test client for the router
client = TestClient(router)

# Mock user for authentication
mock_user = User(id=1, role="student")
mock_student = StudentModel(id=1, current_courses=[Course(id=1, name="Test Course")])


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def mock_auth():
    """Fixture to mock authentication"""
    with patch("ai_platform.apis.students.get_current_user", return_value=mock_user):
        yield


def test_get_student_courses_success(mock_db, mock_auth):
    """Test successful retrieval of student courses"""
    # Mock database query responses
    mock_db.query.return_value.filter.return_value.first.return_value = mock_student
    mock_db.query.return_value.filter.return_value.all.return_value = [
        Course(id=1, name="Test Course")
    ]

    response = client.get("/student/course/current", headers={"Authorization": "Bearer test"})

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == 1
    assert response.json()[0]["name"] == "Test Course"


def test_get_student_courses_not_found(mock_db, mock_auth):
    """Test when student profile is not found"""
    # Mock database query to return None for student
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.get("/student/course/current", headers={"Authorization": "Bearer test"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Student profile not found"


def test_get_course_content_success(mock_db):
    """Test successful retrieval of course content"""
    with patch("ai_platform.apis.students.get_course_weeks") as mock_get_course_weeks:
        mock_get_course_weeks.return_value = {
            "course_id": 1,
            "weeks": [{"week_id": 1, "week_number": 1}]
        }

        response = client.get("/student/course/1/weeks")

        assert response.status_code == 200
        assert response.json()["course_id"] == 1
        assert len(response.json()["weeks"]) == 1


def test_submit_assignment_success(mock_db):
    """Test successful assignment submission"""
    submission_data = AssignmentSubmissionCreate(
        assignment_id=1,
        course_id=1,
        week_id=1,
        student_id=1,
        assignment_type="graded",
        submission_content="Test submission"
    )

    # Mock database queries
    mock_db.query.return_value.filter.return_value.first.side_effect = [
        Assignment(id=1),  # First call for assignment
        StudentModel(id=1)  # Second call for student
    ]

    mock_submission = AssignmentSubmission(id=1)
    mock_db.add.return_value = None
    mock_db.commit.return_value = None
    mock_db.refresh.side_effect = lambda x: setattr(x, "id", 1)

    response = client.post(
        "/student/assignment/submit",
        json=submission_data.dict()
    )

    assert response.status_code == 201
    assert response.json()["message"] == "Assignment submitted successfully"
    assert "submission_id" in response.json()


def test_submit_assignment_not_found(mock_db):
    """Test assignment submission when assignment doesn't exist"""
    submission_data = AssignmentSubmissionCreate(
        assignment_id=1,
        course_id=1,
        week_id=1,
        student_id=1,
        assignment_type="graded",
        submission_content="Test submission"
    )

    # Mock database query to return None for assignment
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.post(
        "/student/assignment/submit",
        json=submission_data.dict()
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Assignment not found"


def test_get_student_analytics_success(mock_db, mock_auth):
    """Test successful retrieval of student analytics"""
    # Mock database query response
    mock_result = Mock()
    mock_result._asdict.return_value = {
        "course_id": 1,
        "total_submissions": 5,
        "graded_submissions": 3,
        "average_score": 85.0
    }
    mock_db.query.return_value.filter.return_value.group_by.return_value.all.return_value = [mock_result]

    response = client.get("/student/analytics", headers={"Authorization": "Bearer test"})

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["course_id"] == 1
    assert response.json()[0]["total_submissions"] == 5


def test_get_student_analytics_unauthorized(mock_db):
    """Test analytics endpoint with unauthorized access"""
    # Mock a non-student user
    with patch("ai_platform.apis.students.get_current_user", return_value=User(id=1, role="other")):
        response = client.get("/student/analytics", headers={"Authorization": "Bearer test"})

        assert response.status_code == 403
        assert response.json()["detail"] == "Unauthorized access"


# Add parametrized test for different roles
@pytest.mark.parametrize("role,expected_status", [
    ("student", 200),
    ("ta", 200),
    ("instructor", 200),
    ("admin", 200),
    ("other", 403),
])
def test_get_analytics_role_based_access(mock_db, role, expected_status):
    """Test analytics endpoint access for different user roles"""
    with patch("ai_platform.apis.students.get_current_user", return_value=User(id=1, role=role)):
        # Mock minimal query response
        mock_db.query.return_value.filter.return_value.group_by.return_value.all.return_value = []

        response = client.get("/student/analytics", headers={"Authorization": "Bearer test"})

        assert response.status_code == expected_status


if __name__ == "__main__":
    pytest.main()