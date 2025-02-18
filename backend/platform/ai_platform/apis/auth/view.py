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
    return {"message": "User created successfully"}


# Login endpoint
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
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
    return {"message": "Welcome to the student dashboard"}


# Protected endpoint for TAs
@router.get("/ta")
async def ta_dashboard(current_user: User = Depends(has_role(Role.TA))):
    return {"message": "Welcome to the TA dashboard"}


# Protected endpoint for instructors
@router.get("/instructor")
async def instructor_dashboard(current_user: User = Depends(has_role(Role.INSTRUCTOR))):
    return {"message": "Welcome to the instructor dashboard"}


# Protected endpoint for admins
@router.get("/admin")
async def admin_dashboard(current_user: User = Depends(has_role(Role.ADMIN))):
    return {"message": "Welcome to the admin dashboard"}
