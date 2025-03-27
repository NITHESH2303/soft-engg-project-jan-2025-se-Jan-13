import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.courses.view import router
from ai_platform.supafast.models.users import User, Student
from ai_platform.supafast.models.courses import Course, Assignment
from ai_platform.supafast.models.weekwise_content import WeekwiseContent, VideoLecture, PracticeAssignment, \
    GradedAssignment
from ai_platform.schemas.courses import CourseRegistrationRequest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch

# Create a test client for the router
client = TestClient(router)

# Mock user and student
mock_student_user = User(id=1, role="student")
mock_admin_user = User(id=2, role="admin")
mock_student = Student(id=1, current_term=1)


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def mock_student_auth():
    """Fixture to mock student authentication"""
    with patch("ai_platform.apis.courses.view.get_current_user", return_value=mock_student_user):
        yield


@pytest.fixture
def mock_admin_auth():
    """Fixture to mock admin authentication"""
    with patch("ai_platform.apis.courses.view.get_current_user", return_value=mock_admin_user):
        yield


def test_register_courses_success(mock_db, mock_student_auth):
    """Test successful course registration"""
    request_data = CourseRegistrationRequest(course_ids=[1, 2])
    mock_courses = [Course(id=1, title="Course 1"), Course(id=2, title="Course 2")]

    mock_db.query.return_value.filter.return_value.first.return_value = mock_student
    mock_db.query.return_value.filter.return_value.all.return_value = mock_courses
    mock_db.commit.return_value = None

    with patch.object(Student, "generate_roll_number", return_value="BS2023001"):
        response = client.post(
            "/student/register-courses",
            json=request_data.dict(),
            headers={"Authorization": "Bearer test"}
        )

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["id"] == 1
    assert response.json()[1]["id"] == 2


def test_register_courses_unauthorized(mock_db):
    """Test course registration with unauthorized user"""
    with patch("ai_platform.apis.courses.view.get_current_user", return_value=User(id=3, role="ta")):
        response = client.post(
            "/student/register-courses",
            json={"course_ids": [1, 2]},
            headers={"Authorization": "Bearer test"}
        )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only students and admins can register for courses"


def test_register_courses_no_profile(mock_db, mock_student_auth):
    """Test course registration without student profile"""
    mock_db.query.return_value.filter.return_value.first.return_value = None

    response = client.post(
        "/student/register-courses",
        json={"course_ids": [1]},
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Student profile not found. Please create a profile first."


def test_register_courses_invalid_ids(mock_db, mock_student_auth):
    """Test course registration with invalid course IDs"""
    mock_db.query.return_value.filter.return_value.first.return_value = mock_student
    mock_db.query.return_value.filter.return_value.all.return_value = [Course(id=1)]

    response = client.post(
        "/student/register-courses",
        json={"course_ids": [1, 2]},
        headers={"Authorization": "Bearer test"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "One or more course IDs are invalid"


def test_get_course_content_success(mock_db):
    """Test successful retrieval of course content"""
    mock_weeks = [WeekwiseContent(id=1, course_id=1, week_no=1, term=1, upload_date=datetime.now())]
    mock_videos = [VideoLecture(course_id=1, week_no=1, title="Video 1")]
    mock_practice = [PracticeAssignment(course_id=1, week_no=1, title="Practice 1")]
    mock_graded = [GradedAssignment(course_id=1, week_no=1, title="Graded 1")]

    mock_db.query.return_value.filter.return_value.all.side_effect = [
        mock_weeks,  # Weeks query
        mock_videos,  # Videos query
        mock_practice,  # Practice assignments query
        mock_graded  # Graded assignments query
    ]

    response = client.get("/student/courses/1")

    assert response.status_code == 200
    assert response.json()["course_id"] == 1
    assert len(response.json()["weeks"]) == 1
    assert len(response.json()["weeks"][0]["videos"]) == 1


def test_get_course_content_not_found(mock_db):
    """Test course content retrieval when no content exists"""
    mock_db.query.return_value.filter.return_value.all.return_value = []

    response = client.get("/student/courses/1")

    assert response.status_code == 404
    assert response.json()["detail"] == "No content found for this course"


def test_get_student_deadlines_success(mock_db, mock_student_auth):
    """Test successful retrieval of student deadlines"""
    future_date = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    mock_graded = Mock(
        id=1,
        course_id=1,
        assignment_no=1,
        deadline=future_date,
        title="Graded Assignment",
        course_title="Course 1"
    )
    mock_practice = Mock(
        id=2,
        course_id=1,
        assignment_no=1,
        deadline=future_date,
        title="Practice Assignment",
        course_title="Course 1"
    )

    mock_db.query.return_value.join.return_value.filter.return_value.all.side_effect = [
        [mock_graded],  # Graded assignments
        [mock_practice]  # Practice assignments
    ]

    response = client.get("/student/deadlines", headers={"Authorization": "Bearer test"})

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["assignment_type"] == "graded"
    assert response.json()[1]["assignment_type"] == "practice"
    assert response.json()[0]["is_passed"] == False


def test_get_student_deadlines_unauthorized(mock_db):
    """Test deadlines endpoint with non-student user"""
    with patch("ai_platform.apis.courses.view.get_current_user", return_value=User(id=3, role="ta")):
        response = client.get("/student/deadlines", headers={"Authorization": "Bearer test"})

    assert response.status_code == 403
    assert response.json()["detail"] == "Only students can access this endpoint"


@pytest.mark.parametrize("role,expected_status", [
    ("student", 200),
    ("admin", 200),
    ("ta", 403),
    ("instructor", 403),
])
def test_register_courses_role_based(mock_db, role, expected_status):
    """Test course registration access for different user roles"""
    with patch("ai_platform.apis.courses.view.get_current_user", return_value=User(id=1, role=role)):
        if role in ["student", "admin"]:
            mock_db.query.return_value.filter.return_value.first.return_value = mock_student
            mock_db.query.return_value.filter.return_value.all.return_value = [Course(id=1)]
            mock_db.commit.return_value = None

        response = client.post(
            "/student/register-courses",
            json={"course_ids": [1]},
            headers={"Authorization": "Bearer test"}
        )

        assert response.status_code == expected_status


if __name__ == "__main__":
    pytest.main()