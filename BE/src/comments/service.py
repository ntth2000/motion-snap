from sqlalchemy.orm import Session, joinedload

from src.models import Comment, CommentLike, Post, User, UserRole

from .exceptions import (
    CommentAlreadyDeletedException,
    CommentNotFoundException,
    PermissionDeniedException,
    ResourceDeletedException,
)
from .schemas import CommentResponseDTO


def put_comment(comment_id: int, content: str, current_user, db: Session):
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id, Comment.is_deleted == 0)
        .first()
    )
    if not comment:
        raise CommentNotFoundException()

    if comment.user_id != current_user.id:
        raise PermissionDeniedException()

    comment.content = content
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "user_id": comment.user_id,
        "username": current_user.username,
        "post_id": comment.post_id,
        "created_at": comment.created_at.isoformat(),
        "content": comment.content,
        "is_deleted": comment.is_deleted,
    }


def delete_comment(comment_id: int, current_user: User, db: Session):
    comment = (
        db.query(Comment)
        .options(joinedload(Comment.post))
        .filter(Comment.id == comment_id)
        .first()
    )

    if not comment:
        raise CommentNotFoundException()

    if comment.post.is_deleted:
        raise ResourceDeletedException(
            message="Cannot delete comment from a deleted post."
        )

    if comment.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise PermissionDeniedException()

    if comment.is_deleted:
        raise CommentAlreadyDeletedException()

    comment.is_deleted = 1
    db.commit()

    return {"message": "Comment deleted successfully"}


def toggle_like_comment(comment_id: int, user_id: int, db):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise CommentNotFoundException()

    existing_like = (
        db.query(CommentLike)
        .filter(CommentLike.comment_id == comment_id, CommentLike.user_id == user_id)
        .first()
    )

    if existing_like:
        db.delete(existing_like)
        comment.like_count -= 1
        is_liked = False
    else:
        new_like = CommentLike(user_id=user_id, comment_id=comment_id)
        db.add(new_like)
        comment.like_count += 1
        is_liked = True

    db.commit()
    db.refresh(comment)

    return {
        "liked": is_liked,
        "like_count": comment.like_count,
        "comment_id": comment.id,
    }
