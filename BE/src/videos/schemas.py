from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from src.schemas import BaseSchema

from .enums import JobStatus, ProcessingStage


class VideoUpload(BaseSchema):
    file_name: Optional[str] = Field(..., description="Name of the video file")
    description: Optional[str] = Field(
        ..., description="Description of the video content"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "file_name": "my_video.mp4",
                "description": "A short video about...",
            }
        }


class VideoResponse(BaseSchema):
    id: int
    filename: str
    uploaded_at: datetime
    thumbnail_url: Optional[str] = None
    status: Optional[JobStatus] = None
    current_stage: Optional[ProcessingStage] = None
    video_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None

    class Config:
        orm_mode = True


class VideoListResponse(BaseSchema):
    videos: List[VideoResponse]


class ExtractFrame(BaseSchema):
    frame_count: int
    message: str


class DrawPosesResponse(BaseSchema):
    frame_count: int
    message: str


class GetVideoUrlResponse(BaseSchema):
    video_id: int
    video_url: Optional[str] = None
