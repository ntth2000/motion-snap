from typing import Optional
from pydantic import BaseModel, Field

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