from typing import List
from fastapi import APIRouter, Depends, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src import database
from src.users import schemas as user_schemas
from src.comments import service
from src.auth.dependencies import get_current_user
from .schemas import GetAllCommentsResponseDTO, CreateCommentRequestDTO


router = APIRouter(
    prefix="/api",
    tags=["comment"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="comments")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/videos/{video_id}/comments", response_model=GetAllCommentsResponseDTO, status_code=status.HTTP_200_OK)
def get_all(
    video_id: int,
    db: Session = Depends(get_db)
):
    return service.get_comments_by_video_id(video_id, db)


@router.post("/videos/{video_id}/comments", status_code=status.HTTP_201_CREATED)
def post_comment(
    video_id: int,
    payload: CreateCommentRequestDTO,
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.post_comment(video_id, payload.parent_comment_id, payload.content, current_user, db)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    parent_comment_id: int,
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.delete_comment(comment_id, parent_comment_id, current_user, db)


@router.put("/comments/{comment_id}", status_code=status.HTTP_200_OK)
def put_comment(
    comment_id: int,
    content: str = Query(..., min_length=1),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return service.put_comment(comment_id, content, current_user, db)