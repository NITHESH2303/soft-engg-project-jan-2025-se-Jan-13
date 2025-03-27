import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.students.profile import router
from ai_platform.supafast.models.users import User, Student
from ai_platform.supafast.models.courses import Course, Deadline
from ai_platform.schemas.student import StudentProfileCreate
from datetime import datetime
from unittest.mock import Mock, patch

# Create a test client for the router
client = TestClient(router)

# Mock user for authentication
mock_user = User(id=1, role="student")
mock_student = Student(
    id=1,
    first_name="John",
    last_name="Doe",
    email_id="john.doe@example.com",
    roll_number="BS2023001",
    current_term=1
)


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def mock_auth():
    """Fixture to mock authentication"""
    with patch("ai_platform.apis.students.profile.get_current_user", return_value=mock_user):
        yield


def test_create_student_profile_success(mock_db, mock_auth):
    """Test successful creation of student profile"""
    profile_data = StudentProfileCreate(
        first_name="John",
        middle_name=None,
        last_name="Doe",
        email_id="john.doe@example.com"
    )

    # Mock database queries
    mock_db.query.return_value.filter.return_value.first.return_value = None  # No existing profile
    mock_db.add.return_value = None
    mock_db.commit.return_value = None
    mock_db.refresh.side_effect = lambda x: setattr(x, "roll_number", "BS2023001")

    with patch.object(Student, "generate_roll_number", return_value="BS2023001"):
        response = client.post(
            "/student/student-profile",
            json=profile_data.dict(exclude_unset=True),
            headers={"Authorization": "Bearer test"}
        )

    assert response.status_code == 200
    assert response.json()["first_name"] == "John"
    assert response.json()["last_name"] == "Doe"
    assert response.json()["roll_number"] == "BS2023001"


def test_create_student_profile_non_student(mock_db):
    """Test profile creation with non-student user"""
    non_student_user = User(id=2, role="instructor")
    with patch("ai_platform.apis.students.profile.get_current_user", return_value=non_student_user):
        response = client.post(
            "/student/student-profile",
            json={"first_name": "John", "last_name": "Doe", "email_id": "john@example.com"},
            headers={"Authorization": "Bearer test"}
        )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only students can create a student profile"


def test_create_student_profile_already_exists(mock_db, mock_auth):
    """Test profile creation when profile already exists"""
    mock_db.query.return_value.filter.return_value.first.return_value = mock_student

    response = client.post(
        "/student/student-profile",
        json={"first_name": "John", "last_name": "Doe", "email_id": "john@example.com"},
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Student profile already exists"


def test_create_student_profile_db_error(mock_db, mock_auth):
    """Test profile creation with database error"""
    mock_db.query.return_value.filter.return_value.first.return_value = None
    mock_db.add.side_effect = Exception("Database error")

    response = client.post(
        "/student/student-profile",
        json={"first_name": "John", "last_name": "Doe", "email_id": "john@example.com"},
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "An error occurred while creating the student profile"


def test_get_student_profile_success(mock_db, mock_auth):
    """Test successful retrieval of student profile"""
    # Mock student with courses
    mock_student.completed_courses = [Course(id=1, title="Completed Course")]
    mock_student.pending_courses = [Course(id=2, title="Pending Course")]
    mock_student.current_courses = [Course(id=3, title="Current Course")]

    # Mock database queries
    mock_db.query.return_value.filter.return_value.first.side_effect = [
        mock_student,  # First call for student profile
        [Deadline(course_id=3, status="completed"), Deadline(course_id=3, status="pending")]
        # Second call for deadlines
    ]

    response = client.get("/student/profile", headers={"Authorization": "Bearer test"})

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert len(response.json()["completed_courses"]) == 1
    assert len(response.json()["pending_courses"]) == 1
    assert len(response.json()["current_courses"]) == 1
    assert response.json()["current_courses"][0]["progress"] == 8.33  # 1/12 weeks completed


def test_get_student_profile_non_student(mock_db):
    """Test profile retrieval with non-student user"""
    non_student_user = User(id=2, role="instructor")
    with patch("ai_platform.apis.students.profile.get_current_user", return_value=non_student_user):
        response = client.get("/student/profile", headers={"Authorization": "Bearer test"})

    assert response.status_code == 403
    assert response.json()["detail"] == "Only students can access this endpoint"


def test_get_student_profile_not_found(mock_db, mock_auth):
    """Test profile retrieval when profile doesn't exist"""
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.get("/student/profile", headers={"Authorization": "Bearer test"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Student profile not found"


@pytest.mark.parametrize("role,expected_status", [
    ("student", 200),
    ("ta", 403),
    ("instructor", 403),
    ("admin", 403),
])
def test_profile_access_role_based(mock_db, role, expected_status):
    """Test profile endpoint access for different user roles"""
    with patch("ai_platform.apis.students.profile.get_current_user", return_value=User(id=1, role=role)):
        if role == "student":
            mock_db.query.return_value.filter.return_value.first.return_value = mock_student
        else:
            mock_db.query.return_value.filter.return_value.first.return_value = None

        response = client.get("/student/profile", headers={"Authorization": "Bearer test"})

        assert response.status_code == expected_status


if __name__ == "__main__":
    pytest.main()