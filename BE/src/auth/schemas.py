from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.schemas import BaseSchema


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str = Field(
        ..., min_length=6, max_length=100, description="Password user"
    )


class LoginResponse(BaseModel):
    role: str


class RegisterRequest(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseSchema):
    id: int
    username: str
    email: EmailStr
    role: str


class TokenSchema(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
