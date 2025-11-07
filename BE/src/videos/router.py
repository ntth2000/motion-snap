from typing import List
from fastapi import APIRouter, Depends, UploadFile, status
from fastapi.params import File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src import database
from src.auth import schemas as authSchemas
from src.videos import service
from src.videos.video_processor import draw_3d_vertices
from src.auth.dependencies import get_current_user
from .schemas import DrawPosesResponse, VideoListResponse


router = APIRouter(
    prefix="/api/videos",
    tags=["videos"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="videos")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=VideoListResponse)
def get_all(
    db: Session = Depends(get_db),
    current_user: authSchemas.UserOut = Depends(get_current_user)
):
    return service.get_videos_by_user(current_user.id, db)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_video(
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: authSchemas.UserOut = Depends(get_current_user)
):
    return await service.upload_video(user_id = current_user.id, file=video, db=db) 


@router.get("/extract/{video_id}")
def extract(
    video_id: int,
    db: Session = Depends(get_db),
    # current_user: authSchemas.UserOut = Depends(get_current_user)
):
    return service.extract_poses(video_id, db)


@router.get('/draw_poses/{video_id}', response_model=DrawPosesResponse)
def draw_poses(video_id: int, db: Session = Depends(get_db)):
    return draw_3d_vertices(video_id)
