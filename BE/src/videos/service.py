import os, base64
from typing import List
from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from src.models import Video, Job
from src.videos.models import JobStatus
from src.videos.utils import validate_duration, validate_extension, save_upload_file
from src.videos.exceptions import UploadFilesFailedException
from src.videos.video_processor import extract_frames, extract_2d, draw_2d_vertices
from src.videos.schemas import VideoListResponse, VideoResponse
from src.videos.constants import VIDEO_PATH


def get_videos_by_user(user_id: int, db: Session):
    """
    Get all videos by user_id
    """
    videos = (
        db.query(Video)
        .options(joinedload(Video.job))
        .filter(Video.user_id == user_id)
        .order_by(Video.uploaded_at.desc())
        .all()
    )

    if not videos:
        return VideoListResponse(videos=[])
    
    result = []
    for video in videos:
        video_id = str(video.id)
        video_dir = os.path.join(VIDEO_PATH, str(video.id))

        if not os.path.exists(video_dir):
            continue

        thumbnail_path = os.path.join(
            "storage", "inputs", video_id, "images", video.filename.split('.')[0], "000000.jpg"
        )

        thumbnail_b64 = None
        print(thumbnail_path)
        if os.path.exists(thumbnail_path):
            with open(thumbnail_path, "rb") as f:
                thumbnail_b64 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

        status = video.job.status.value if video.job else ""

        result.append(
            VideoResponse(
                id=video.id,
                filename=video.filename,
                uploaded_at=video.uploaded_at,
                thumbnail_url=thumbnail_b64,
                status=status
            )
        )

    return VideoListResponse(videos=result)


async def upload_video(user_id: int, file: UploadFile, db: Session):
    """
    Handle full process of uploading a video:
    1. Validate file extension
    2. Validate video duration
    3. Save file to server
    4. Create Video record in database
    """
    try:
        new_job = Job(status=JobStatus.UPLOADING)
        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        validate_extension(file)
        await validate_duration(file)

        new_video = Video(
            filename=file.filename,
            file_path="",
            user_id=user_id,
            job_id=new_job.id,
            uploaded_at=None
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)

        saved_video = save_upload_file(file, new_video.id)
        new_video.file_path = saved_video["file_path"]
        new_video.uploaded_at = saved_video["uploaded_at"]

        db.commit()
        db.refresh(new_video)

        new_job.status = JobStatus.UPLOADED
        new_job.video = new_video
        db.commit()
        db.refresh(new_job)

        extract_frames(new_video.id)
        new_job.status = JobStatus.UPLOADED

        return {
            "id": new_video.id,
            "filename": new_video.filename,
            "path": new_video.file_path,
            "uploaded_at": new_video.uploaded_at
        }

    except Exception as e:
        print(e)
        db.rollback()
        raise UploadFilesFailedException(file)



def extract_poses(video_id: int, db):
    extract_2d(video_id)
    draw_2d_vertices(video_id)