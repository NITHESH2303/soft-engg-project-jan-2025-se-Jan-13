from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ai_platform.schemas.auth import LoginRequest
from ai_platform.supafast.database import get_db
from ai_platform.supafast.models.users import User, Role
from ai_platform.apis.auth.auth import (
    Token,
    SignupRequest,
    authenticate_user,
    create_access_token,
    get_current_user,
    has_role,
    pwd_context, ACCESS_TOKEN_EXPIRE_MINUTES,
)
from datetime import timedelta
from sqlalchemy.orm import Session

router = APIRouter()


# Signup endpoint
@router.post("/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    **Register a new user.**
    
    This endpoint allows a new user to sign up by providing a username, email, password, and role.

    **Args:**
        request (SignupRequest): The signup request containing user details.
        db (Session): Database session dependency.

    **Returns:**
        dict: Success message confirming user creation.

    **Raises:**
        HTTPException: If the username is already registered.
    """
    # Check if user already exists
    db_user = db.query(User).filter(User.username == request.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Hash password
    hashed_password = pwd_context.hash(request.password)

    # Create new user
    new_user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        role=request.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username, "role": new_user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "message": "User created successfully"}


# Login endpoint
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    **Authenticate a user and issue a JWT access token.**
    
    This endpoint verifies the provided username and password. If valid, it returns an access token.

    **Args:**
        form_data (OAuth2PasswordRequestForm): Form data containing `username` and `password`.
        db (Session): Database session dependency.

    **Returns:**
        Token: A dictionary containing the access token and token type.

    **Raises:**
        HTTPException: If the username or password is incorrect.
    """
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoint for students
@router.get("/student")
async def student_dashboard(current_user: User = Depends(has_role(Role.STUDENT))):
    """
    **Access the student dashboard.**
    
    This is a protected endpoint accessible only to users with the **STUDENT** role.

    **Args:**
        current_user (User): The authenticated user with the required role.

    **Returns:**
        dict: Welcome message for students.
    """
    return {"message": "Welcome to the student dashboard"}


# Protected endpoint for TAs
@router.get("/ta")
async def ta_dashboard(current_user: User = Depends(has_role(Role.TA))):
    """
    **Access the TA dashboard.**
    
    This is a protected endpoint accessible only to users with the **TA** role.

    **Args:**
        current_user (User): The authenticated user with the required role.

    **Returns:**
        dict: Welcome message for TAs.
    """
    return {"message": "Welcome to the TA dashboard"}


# Protected endpoint for instructors
@router.get("/instructor")
async def instructor_dashboard(current_user: User = Depends(has_role(Role.INSTRUCTOR))):
    """
    **Access the instructor dashboard.**
    
    This is a protected endpoint accessible only to users with the **INSTRUCTOR** role.

    **Args:**
        current_user (User): The authenticated user with the required role.

    **Returns:**
        dict: Welcome message for instructors.
    """
    return {"message": "Welcome to the instructor dashboard"}


# Protected endpoint for admins
@router.get("/admin")
async def admin_dashboard(current_user: User = Depends(has_role(Role.ADMIN))):
    """
    **Access the admin dashboard.**
    
    This is a protected endpoint accessible only to users with the **ADMIN** role.

    **Args:**
        current_user (User): The authenticated user with the required role.

    **Returns:**
        dict: Welcome message for admins.
    """
    return {"message": "Welcome to the admin dashboard"}
