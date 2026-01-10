from pydantic import BaseModel
from typing import Optional


class GetCommentDTO(BaseModel):
    id: int
    userId: int
    username: str
    createdAt: str
    content: str
    isDeleted: int
    depth: Optional[int] = None
    parentId: Optional[int] = None


class GetAllCommentsResponseDTO(BaseModel):
    comments: list[GetCommentDTO]
    count: int = 0


class CreateCommentRequestDTO(BaseModel):
    content: str
    parent_comment_id: Optional[int] = None