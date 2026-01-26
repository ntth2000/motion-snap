from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from src.admin import service
from src.auth.constants import (ACCESS_TOKEN_EXPIRE_MINUTES,
                                REFRESH_TOKEN_EXPIRE_DAYS)
from src.auth.dependencies import get_current_admin
from src.auth.schemas import LoginRequest, UserResponse
from src.database import get_db
from src.models import User

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])


@router.post("/login", response_model=UserResponse)
def login(response: Response, form_data: LoginRequest, db: Session = Depends(get_db)):
    print(form_data)
    access_token, refresh_token, user = service.admin_login(
        db, form_data.email, form_data.password
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "name": user.name,
    }


@router.get("/dashboard", dependencies=[Depends(get_current_admin)])
def get_dashboard_stats(db: Session = Depends(get_db)):
    return service.get_dashboard_stats(db)


@router.patch("/api-keys/{key_id}/revoke", dependencies=[Depends(get_current_admin)])
def revoke_api_key(key_id: int, db: Session = Depends(get_db)):
    success = service.revoke_api_key(db, key_id)
    if not success:
        raise HTTPException(404, "API Key not found")
    return {"message": "API Key revoked successfully"}


@router.get("/api-keys", dependencies=[Depends(get_current_admin)])
def get_all_api_keys(
    skip: int = 0, limit: int = 10, search: str = None, db: Session = Depends(get_db)
):
    return service.get_all_api_keys(db, skip, limit, search)


@router.get("/posts", dependencies=[Depends(get_current_admin)])
def get_all_posts(
    skip: int = 0, limit: int = 10, search: str = None, db: Session = Depends(get_db)
):
    return service.get_all_posts(db, skip, limit, search)


@router.delete("/posts/{post_id}", dependencies=[Depends(get_current_admin)])
def admin_delete_post(post_id: int, db: Session = Depends(get_db)):
    return service.admin_delete_post(db, post_id)


@router.get("/users", dependencies=[Depends(get_current_admin)])
def get_all_users(
    skip: int = 0, limit: int = 10, search: str = None, db: Session = Depends(get_db)
):
    return service.get_all_users(db, skip, limit, search)
