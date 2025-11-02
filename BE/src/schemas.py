# app/schemas.py
from pydantic import BaseModel

class ExtractFrame(BaseModel):
    frame_count: int
    message: str
