from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    fullName: str = Field(min_length=2, max_length=80)
    role: UserRole = UserRole.CANDIDATE


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    fullName: str | None = None
    role: UserRole


class AuthResponse(BaseModel):
    success: bool = True
    token: str
    user: UserOut


class MeResponse(BaseModel):
    success: bool = True
    user: UserOut
