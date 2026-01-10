from sqlalchemy.orm import Session, joinedload

from src.models import Comment, Post, User, UserRole

from .exceptions import (
    CommentAlreadyDeletedException,
    CommentNotFoundException,
    PermissionDeniedException,
    ResourceDeletedException,
)
from .schemas import CommentResponseDTO


def get_comments_by_post_id(post_id: int, db: Session):
    root_comments = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user),
        )
        .filter(
            Comment.post_id == post_id,
            Comment.parent_id == None,
            Comment.is_deleted == 0,
        )
        .order_by(Comment.created_at.desc())
        .all()
    )

    result = []

    for root in root_comments:
        root_dto = CommentResponseDTO(
            id=root.id,
            user_id=root.user_id,
            username=root.user.username,
            content=root.content,
            is_deleted=bool(root.is_deleted),
            created_at=root.created_at,
            parent_id=None,
            depth=0,
            replies=[],
        )

        for reply in root.replies:
            if reply.is_deleted:
                continue
            reply_dto = CommentResponseDTO(
                id=reply.id,
                user_id=reply.user_id,
                username=reply.user.username,
                content=reply.content,
                is_deleted=bool(reply.is_deleted),
                created_at=reply.created_at,
                parent_id=reply.parent_id,
                depth=reply.depth,
            )
            root_dto.replies.append(reply_dto)

        root_dto.replies.sort(key=lambda x: x.created_at)
        result.append(root_dto)

    return {"comments": result, "count": len(result)}


def post_comment(
    post_id: int, parent_comment_id: int | None, content: str, current_user, db: Session
):
    depth = 0

    if parent_comment_id is not None:
        parent_comment = (
            db.query(Comment)
            .filter(Comment.id == parent_comment_id, Comment.is_deleted == 0)
            .first()
        )
        if not parent_comment:
            raise CommentNotFoundException()
        depth = 1

    new_comment = Comment(
        user_id=current_user.id,
        post_id=post_id,
        content=content,
        depth=depth,
        parent_id=parent_comment_id,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment, attribute_names=["user"])

    return CommentResponseDTO(
        id=new_comment.id,
        user_id=new_comment.user_id,
        username=current_user.username,
        content=new_comment.content,
        is_deleted=False,
        created_at=new_comment.created_at,
        parent_id=new_comment.parent_id,
        depth=new_comment.depth,
    )


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
        "video_id": comment.video_id,
        "created_at": comment.created_at.isoformat(),
        "content": comment.content,
        "is_deleted": comment.is_deleted,
        "path": comment.path,
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
