from datetime import datetime
from typing import Optional

from src.schemas import BaseSchema


class CommentResponseDTO(BaseSchema):
    id: int
    user_id: int
    username: str
    content: str
    is_deleted: bool
    created_at: datetime
    like_count: int = 0
    liked: bool = False
    parent_id: Optional[int] = None
    depth: int = 0
    replies: Optional[list["CommentResponseDTO"]] = None


class GetAllCommentsResponseDTO(BaseSchema):
    comments: list[CommentResponseDTO]
    count: int = 0


class CreateCommentRequestDTO(BaseSchema):
    content: str
    parent_comment_id: Optional[int] = None


class LikeResponseDTO(BaseSchema):
    comment_id: int
    liked: bool
    like_count: int
