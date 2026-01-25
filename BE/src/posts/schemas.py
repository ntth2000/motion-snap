from datetime import datetime
from typing import List, Optional

from src.comments.schemas import CommentResponseDTO
from src.schemas import BaseSchema
from src.users.schemas import UserDetailResponse
from src.videos.enums import JobStatus, ProcessingStage


# --- Basic ---
class PostBaseDTO(BaseSchema):
    caption: str


class VideoDTO(BaseSchema):
    id: int
    file_url: str
    view_index: int
    status: JobStatus
    stage: ProcessingStage
    thumbnail_url: Optional[str] = None
    job_id: Optional[int] = None


class UpdatePostRequestDTO(PostBaseDTO):
    pass


# --- Response ---
class PostResponseDTO(PostBaseDTO):
    id: int
    created_at: datetime
    thumbnail_url: Optional[str] = None
    view_mode: Optional[str] = None
    videos: Optional[List[VideoDTO]] = None
    like_count: int = 0
    liked: bool = False
    user: Optional[UserDetailResponse]


class CreatePostResponseDTO(PostResponseDTO):
    pass


# --- Detail Response (Kèm Video & Job status) ---
class PostDetailResponseDTO(PostResponseDTO):
    pass


class GetAllCommentsResponseDTO(BaseSchema):
    comments: list[CommentResponseDTO]
    count: int = 0


class CreateCommentRequestDTO(BaseSchema):
    content: str
    parent_comment_id: Optional[int] = None


class LikeResponseDTO(BaseSchema):
    post_id: int
    liked: bool
    like_count: int
