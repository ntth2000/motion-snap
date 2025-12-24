from pydantic import BaseModel

class UserDetailResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    class Config:
        orm_mode = True


class CreateUserRequest(BaseModel):
    username: str
    password: str
    email: str