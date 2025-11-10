from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from src.videos.models import JobStatus


class VideoUpload(BaseModel):
    file_name: Optional[str] = Field(..., description="Name of the video file")
    description: Optional[str] = Field(..., description="Description of the video content")

    class Config:
        json_schema_extra = {
            "example": {
                "file_name": "my_video.mp4",
                "description": "A short video about..."
            }
        }


class VideoResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    thumbnail_url: Optional[str] = None
    status: str = None
    video_url: Optional[str] = None

    class Config:
        orm_mode = True


class VideoListResponse(BaseModel):
    videos: List[VideoResponse]

class ExtractFrame(BaseModel):
    frame_count: int
    message: str


class DrawPosesResponse(BaseModel):
    frame_count: int
    message: str
