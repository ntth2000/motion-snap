from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.api_keys import schemas, service
from src.auth.dependencies import get_current_user
from src.database import get_db
from src.users import schemas as user_schemas

router = APIRouter(
    prefix="/api/api-keys",
    tags=["api-keys"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.get("/", response_model=schemas.ApiKeyGet)
def getKey(
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    return service.get_api_key(db, current_user.id)


@router.post("/", response_model=schemas.CreateApiKeyResponse)
def createKey(
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    return service.generate_api_key(db, current_user.id)
