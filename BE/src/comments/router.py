from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.comments import schemas, service
from src.database import get_db
from src.users.models import User

router = APIRouter(
    prefix="/api/comments",
    tags=["comments"],
)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_endpoint(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.delete_comment(comment_id, current_user, db)


@router.put("/{comment_id}")
def update_comment_endpoint(
    comment_id: int,
    payload: schemas.CreateCommentRequestDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.put_comment(comment_id, payload.content, current_user, db)


@router.post("/{comment_id}/like", response_model=schemas.LikeResponseDTO)
def like_comment_endpoint(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.toggle_like_comment(comment_id, current_user.id, db)
