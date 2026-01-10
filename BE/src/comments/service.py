from src.models import Comment, User
from .exceptions import CommentNotFoundException, UnauthorizedCommentDeletionException

def get_comments_by_video_id(video_id: int, db):
    comments = (
        db.query(Comment)
        .filter(
            Comment.video_id == video_id,
            Comment.is_deleted == 0
        )
        .order_by(Comment.created_at.asc())
        .all()
    )

    response = []

    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()

        response.append({
            "id": comment.id,
            "userId": comment.user_id,
            "username": user.username if user else "Unknown",
            "content": comment.content,
            "parentId": comment.parent_id,
            "depth": comment.depth,
            "createdAt": comment.created_at.isoformat(),
            "isDeleted": bool(comment.is_deleted)
        })

    return {
        "comments": response,
        "count": len(response)
    }


def post_comment(video_id: int, parent_comment_id: int | None, content: str, current_user, db):
    new_comment = Comment(
        user_id=current_user.id,
        video_id=video_id,
        content=content,
        parent_id=parent_comment_id
    )

    if parent_comment_id is not None:
        parent_comment = db.query(Comment).filter(Comment.id == parent_comment_id).first()
        if not parent_comment:
            raise ValueError("Parent comment not found")

        new_comment.depth = parent_comment.depth + 1
        new_comment.path = (
            f"{parent_comment.path}.{parent_comment.id}"
            if parent_comment.path
            else str(parent_comment.id)
        )
    else:
        new_comment.depth = 0
        new_comment.path = None

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "user_id": new_comment.user_id,
        "username": current_user.username,
        "video_id": new_comment.video_id,
        "created_at": new_comment.created_at.isoformat(),
        "updated_at": new_comment.updated_at.isoformat(),
        "content": new_comment.content,
        "is_deleted": new_comment.is_deleted,
        "parent_id": new_comment.parent_id,
        "depth": new_comment.depth,
        "path": new_comment.path,
    }


def put_comment(comment_id: int, content: str, current_user, db):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise CommentNotFoundException()

    if comment.user_id != current_user.id:
        raise UnauthorizedCommentDeletionException()

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
        "path": comment.path
    }


def delete_comment(comment_id: int, current_user, db):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise CommentNotFoundException()

    if comment.user_id != current_user.id and current_user.role != "ADMIN":
        UnauthorizedCommentDeletionException()

    comment.is_deleted = 1
    db.commit()
    return {"message": "Comment deleted successfully"}