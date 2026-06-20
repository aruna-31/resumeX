from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserOut


def to_user_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, fullName=user.full_name, role=user.role)


def register_user(db: Session, payload: RegisterRequest) -> tuple[str, User]:
    existing = db.query(User).filter(func.lower(User.email) == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "email_exists", "message": "Email already in use."})
    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.fullName,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return create_access_token(str(user.id)), user


def authenticate_user(db: Session, email: str, password: str) -> tuple[str, User]:
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"error": "invalid_credentials", "message": "Invalid email or password"})
    return create_access_token(str(user.id)), user
