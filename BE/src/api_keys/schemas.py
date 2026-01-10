from typing import Optional

from pydantic import BaseModel, ConfigDict

from src.schemas import BaseSchema


class CreateApiKeyResponse(BaseSchema):
    key: str


class ApiKeyGet(BaseSchema):
    key: Optional[str] = None
