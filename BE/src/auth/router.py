from fastapi import APIRouter, Depends, Response, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src import database
from src.auth import schemas, service
from src.auth.constants import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from src.auth.exceptions import InvalidUserInfoException


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=schemas.UserOut)
def register(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    return service.register_user(db, form_data)


@router.post("/login")
def login(response: Response, form_data: schemas.Login, db: Session = Depends(get_db)):
    tokens = service.login_user(db, form_data.email, form_data.password)
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 7 * 24 * 60,  # 7 days
    )

    return {
        "message": "Login successful"
    }
    

@router.post('/refresh')
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    access_token, refresh_token = service.refresh_tokens(response, refresh_token)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return { "message": "Tokens refreshed successfully" }
    

@router.get("/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    user = service.get_me(db, token = request.cookies.get("access_token"))

    return { "username": user.username, "email": user.email }
    

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    service.logout_user(db, refresh_token, response)

    return {"message": "Logged out successfully"}
