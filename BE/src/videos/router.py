from fastapi import (APIRouter, BackgroundTasks, Depends, HTTPException, Query,
                     UploadFile, status)
from fastapi.params import File
from sqlalchemy.orm import Session, joinedload

from src import database
from src.auth.dependencies import get_current_user
from src.users import schemas as user_schemas
from src.videos import service
from src.videos.models import Job, Video

from .enums import JobStatus, ProcessingStage
from .schemas import GetVideoUrlResponse, VideoListResponse, VideoResponse

router = APIRouter(
    prefix="/api/videos",
    tags=["videos"],
)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=VideoListResponse)
def get_all(
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    return service.get_videos_by_user(current_user.id, db)


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    return service.get_video_by_id(video_id, current_user.id, db)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_video(
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    return await service.upload_video(user_id=current_user.id, file=video, db=db)


@router.post("/extract_poses/{video_id}")
def extract(
    video_id: int,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    video = (
        db.query(Video)
        .filter(Video.id == video_id)
        .options(joinedload(Video.job), joinedload(Video.post))
        .first()
    )
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    job = db.query(Job).filter(Job.video_id == video.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = JobStatus.PROCESSING
    job.stage = ProcessingStage.EXTRACTING_POSES
    db.commit()

    background_tasks.add_task(service.extract_poses, video_id)

    return {"message": "Start to extract poses from the video."}


@router.post("/draw_3d/{video_id}")
def draw_poses(
    video_id: int,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    video = (
        db.query(Video)
        .filter(Video.id == video_id)
        .options(joinedload(Video.job), joinedload(Video.post))
        .first()
    )
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    job = db.query(Job).filter(Job.video_id == video.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = JobStatus.PROCESSING
    job.stage = ProcessingStage.DRAWING_3D
    db.commit()

    background_tasks.add_task(service.draw_3d, video_id)
    return {"message": "Start to draw 3d."}


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    service.delete_video(video_id, current_user.id, db)
    return None


@router.get("/{video_id}/extracted_poses", response_model=GetVideoUrlResponse)
async def get_extracted_frames(video_id: int, db: Session = Depends(get_db)):
    return service.get_extracted_poses(video_id, db)


@router.get("/{video_id}/drawn_3d", response_model=GetVideoUrlResponse)
def get_draw_3d_frames(
    video_id: int,
    db: Session = Depends(get_db),
):
    return service.get_3d(video_id, db)


@router.get("/status/{video_id}")
def get_job_status(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
):
    return service.get_job_status(video_id, current_user.id, db)


@router.get("/{video_id}/export")
def export(
    video_id: int,
    export_type: str = Query(..., regex="^(extracted_poses|3d)$"),
    db: Session = Depends(get_db),
    current_user: user_schemas.UserDetailResponse = Depends(get_current_user),
    background_tasks: BackgroundTasks = None,
):
    return service.export_video_data(
        video_id, export_type, current_user.id, db, background_tasks
    )
