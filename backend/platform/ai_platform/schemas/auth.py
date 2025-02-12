from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., example="student1")
    password: str = Field(..., example="studentpass")
