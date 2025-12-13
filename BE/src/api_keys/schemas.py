from typing import Optional
from pydantic import BaseModel

class ApiKeyCreate(BaseModel):
    key: str

class ApiKeyGet(BaseModel):
    key: Optional[str] = None