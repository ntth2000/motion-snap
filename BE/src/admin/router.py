from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.dependencies import get_current_admin
from src.models import User
from src.admin import service
from src.auth.schemas import UserResponse, LoginRequest
from fastapi import Response
from src.auth.constants import (ACCESS_TOKEN_EXPIRE_MINUTES,
                                REFRESH_TOKEN_EXPIRE_DAYS)
                                
router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Dashboard"] 
)

@router.post("/login", response_model=UserResponse)
def login(
    response: Response, form_data: LoginRequest, db: Session = Depends(get_db)
):
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

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return service.get_dashboard_stats(db)

@router.patch("/api-keys/{key_id}/revoke")
def revoke_api_key(key_id: int, db: Session = Depends(get_db)):
    success = service.revoke_user_key(db, key_id)
    if not success:
        raise HTTPException(404, "API Key not found")
    return {"message": "API Key revoked successfully"}

@router.delete("/posts/{post_id}")
def admin_delete_post(post_id: int, db: Session = Depends(get_db)):
    return {"message": "Post deleted"}