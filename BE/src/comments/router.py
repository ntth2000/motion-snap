from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.comments import schemas, service
from src.database import get_db
from src.users.models import User

router = APIRouter(
    prefix="/api/posts",
    tags=["comments"],
)


# GET /api/posts/{post_id}/comments
@router.get(
    "/{post_id}/comments",
    response_model=schemas.GetAllCommentsResponseDTO,
)
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return service.get_comments_by_post_id(post_id, db)


# POST /api/posts/{post_id}/comments
@router.post(
    "/{post_id}/comments",
    response_model=schemas.CommentResponseDTO,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: int,
    payload: schemas.CreateCommentRequestDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.post_comment(
        post_id, payload.parent_comment_id, payload.content, current_user, db
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_endpoint(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.delete_comment(comment_id, current_user, db)


@router.put("/comments/{comment_id}")
def update_comment_endpoint(
    comment_id: int,
    payload: schemas.CreateCommentRequestDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.put_comment(comment_id, payload.content, current_user, db)
