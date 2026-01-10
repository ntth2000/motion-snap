from pydantic import BaseModel

from src.schemas import BaseSchema


class UserDetailResponse(BaseSchema):
    id: int
    username: str
    email: str
    role: str

    class Config:
        orm_mode = True


class CreateUserRequest(BaseSchema):
    username: str
    password: str
    email: str
