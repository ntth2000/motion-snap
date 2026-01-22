from typing import List, Optional

from pydantic import BaseModel

from src.schemas import BaseSchema


class UserDetailResponse(BaseSchema):
    id: int
    name: str
    username: str
    email: Optional[str] = None
    role: Optional[str] = None

    class Config:
        orm_mode = True


class CreateUserRequest(BaseSchema):
    name: str
    password: str
    email: str
