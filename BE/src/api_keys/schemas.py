from typing import Optional
from pydantic import BaseModel

class CreateApiKeyReponse(BaseModel):
    key: str

class ApiKeyGet(BaseModel):
    key: Optional[str] = None