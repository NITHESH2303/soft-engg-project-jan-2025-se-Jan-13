import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.auth.auth import router, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ai_platform.supafast.models.users import User, Role
from ai_platform.schemas.auth import SignupRequest
from datetime import timedelta
from unittest.mock import MagicMock, patch

# Initialize the TestClient with your router
client = TestClient(router)


# Mock database dependency
@pytest.fixture
def mock_db():
    db = MagicMock(spec=Session)
    return db


# Mock password hashing
@pytest.fixture
def mock_pwd_context():
    with patch("ai_platform.apis.auth.auth.pwd_context") as mock:
        mock.hash.return_value = "hashed_password"
        mock.verify.return_value = True
        yield mock


# Mock authenticate_user
@pytest.fixture
def mock_authenticate_user():
    with patch("ai_platform.apis.auth.auth.authenticate_user") as mock:
        yield mock


# Mock get_current_user
@pytest.fixture
def mock_get_current_user():
    with patch("ai_platform.apis.auth.auth.get_current_user") as mock:
        yield mock


# Test signup endpoint - successful case
@pytest.mark.asyncio
async def test_signup_success(mock_db):
    signup_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword",
        "role": "STUDENT"
    }
    mock_db.query().filter().first.return_value = None  # No existing user

    response = client.post("/signup", json=signup_data)
    assert response.status_code == 200
    assert response.json()["message"] == "User created successfully"
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


# Test signup endpoint - username already exists
@pytest.mark.asyncio
async def test_signup_username_exists(mock_db):
    signup_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword",
        "role": "STUDENT"
    }
    mock_db.query().filter().first.return_value = User(
        username="testuser", email="testuser@example.com", hashed_password="hashed_password", role=Role.STUDENT
    )

    response = client.post("/signup", json=signup_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"


# Test login endpoint - successful case
@pytest.mark.asyncio
async def test_login_success(mock_db, mock_authenticate_user):
    form_data = {"username": "testuser", "password": "testpassword"}
    mock_user = User(username="testuser", email="testuser@example.com", hashed_password="hashed_password",
                     role=Role.STUDENT)
    mock_authenticate_user.return_value = mock_user

    response = client.post("/login", data=form_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


# Test login endpoint - incorrect credentials
@pytest.mark.asyncio
async def test_login_failure(mock_db, mock_authenticate_user):
    form_data = {"username": "testuser", "password": "wrongpassword"}
    mock_authenticate_user.return_value = None

    response = client.post("/login", data=form_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


# Helper to create a valid token
def create_test_token(role):
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(data={"sub": "testuser", "role": role}, expires_delta=access_token_expires)


# Test student dashboard - authorized
@pytest.mark.asyncio
async def test_student_dashboard_authorized(mock_get_current_user):
    token = create_test_token(Role.STUDENT)
    mock_get_current_user.return_value = User(username="testuser", role=Role.STUDENT)

    response = client.get("/student", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the student dashboard"


# Test student dashboard - unauthorized role
@pytest.mark.asyncio
async def test_student_dashboard_unauthorized(mock_get_current_user):
    token = create_test_token(Role.TA)
    mock_get_current_user.return_value = User(username="testuser", role=Role.TA)

    response = client.get("/student", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403  # Assuming has_role raises 403 for wrong role


# Test TA dashboard - authorized
@pytest.mark.asyncio
async def test_ta_dashboard_authorized(mock_get_current_user):
    token = create_test_token(Role.TA)
    mock_get_current_user.return_value = User(username="testuser", role=Role.TA)

    response = client.get("/ta", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the TA dashboard"


# Test instructor dashboard - authorized
@pytest.mark.asyncio
async def test_instructor_dashboard_authorized(mock_get_current_user):
    token = create_test_token(Role.INSTRUCTOR)
    mock_get_current_user.return_value = User(username="testuser", role=Role.INSTRUCTOR)

    response = client.get("/instructor", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the instructor dashboard"


# Test admin dashboard - authorized
@pytest.mark.asyncio
async def test_admin_dashboard_authorized(mock_get_current_user):
    token = create_test_token(Role.ADMIN)
    mock_get_current_user.return_value = User(username="testuser", role=Role.ADMIN)

    response = client.get("/admin", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the admin dashboard"


# Test protected endpoint without token
@pytest.mark.asyncio
async def test_protected_endpoint_no_token():
    response = client.get("/admin")
    assert response.status_code == 401  # Assuming OAuth2 enforces this
    assert "WWW-Authenticate" in response.headers