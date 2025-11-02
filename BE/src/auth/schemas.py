from pydantic import BaseModel

class Login(BaseModel):
  email: str
  password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    username: str
    password: str
    email: str