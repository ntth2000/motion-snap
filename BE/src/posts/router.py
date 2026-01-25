from typing import Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user, get_optional_current_user
from src.database import get_db
from src.posts import schemas, service
from src.users.models import User

router = APIRouter(
    prefix="/api/posts",
    tags=["posts"],
)


# GET /api/posts/{post_id}
@router.get(
    "/{post_id}",
    response_model=schemas.PostDetailResponseDTO,
)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    return service.get_post_by_id(
        db, post_id, current_user.id if current_user else None
    )


# GET /api/posts
@router.get(
    "/",
    response_model=list[schemas.PostResponseDTO],
)
def get_posts(
    username: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return service.get_posts(db, username)


# POST /api/posts/
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
async def create_post(
    caption: str = Form(""),
    view_mode: str = Form(...),
    video_main: Optional[UploadFile] = File(None),
    video_view1: Optional[UploadFile] = File(None),
    video_view2: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await service.create_post_with_video(
        caption=caption,
        view_mode=view_mode,
        video_main=video_main,
        video_view1=video_view1,
        video_view2=video_view2,
        current_user=current_user,
        db=db,
    )


# DELETE /api/posts
@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_posts_endpoint(
    post_ids: list[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.delete_post(post_ids, current_user, db)


# PUT /api/posts/{post_id}
@router.put("/{post_id}", response_model=schemas.UpdatePostRequestDTO)
def update_post(
    post_id: int,
    payload: schemas.UpdatePostRequestDTO,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.update_post(post_id, payload.caption, current_user, db)


# GET /api/posts/{post_id}/comments
@router.get(
    "/{post_id}/comments",
    response_model=schemas.GetAllCommentsResponseDTO,
)
def get_comments(
    post_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    return service.get_comments_by_post_id(
        db, post_id, current_user.id if current_user else None
    )


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
    return service.post_comment(post_id, payload.content, current_user, db)


@router.get("/{post_id}/export")
def export(
    post_id: int,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
):
    return service.export_data(post_id, db, background_tasks)


@router.post("/{post_id}/like", response_model=schemas.LikeResponseDTO)
def like_comment_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.toggle_like_comment(post_id, current_user.id, db)
