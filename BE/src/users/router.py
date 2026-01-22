from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.auth import schemas, service
from src.auth.dependencies import get_current_user
from src.database import get_db
from src.users import schemas as user_schemas
from src.users import service as user_service

router = APIRouter(
    prefix="/api/users",
    tags=["users"],
)


# @router.get("/", response_model=list[user_schemas.UserDetailResponse])
# def get_users(
#     current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
# ):
#     return get_users()


@router.get("/{username}", response_model=user_schemas.UserDetailResponse)
def get_user(
    username: str,
    db: Session = Depends(get_db),
):
    return user_service.get_user(username, db)
