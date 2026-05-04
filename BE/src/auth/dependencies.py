from datetime import timedelta
from typing import Optional

from fastapi import Depends, Request, Response
from sqlalchemy.orm import Session

from src import database
from src.auth.constants import ACCESS_TOKEN_EXPIRE_MINUTES
from src.auth.exceptions import TokenExpiredException, UserNotFound
from src.auth.utils import create_access_token, verify_token
from src.models import User
from src.users.enums import UserRole


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_optional_current_user(
    request: Request, response: Response, db: Session = Depends(get_db)
):
    try:
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")

        if not access_token and not refresh_token:
            return None

        payload = None

        if access_token:
            payload = verify_token(access_token)

        if payload is None:
            if not refresh_token:
                return None

            refresh_payload = verify_refresh_token(refresh_token)
            if refresh_payload is None:
                return None

            # Tạo access token mới
            new_access_token = create_access_token(
                {"sub": refresh_payload["sub"]},
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            )

            response.set_cookie(
                key="access_token",
                value=new_access_token,
                httponly=True,
                samesite="lax",
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )

            payload = verify_token(new_access_token)

        user = db.query(User).filter(User.email == payload["sub"]).first()
        return user

    except Exception as e:
        return None


def get_current_user(user: Optional[User] = Depends(get_optional_current_user)):
    if not user:
        raise TokenExpiredException()

    return user
