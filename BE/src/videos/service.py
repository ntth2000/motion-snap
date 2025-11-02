from fastapi import UploadFile
from sqlalchemy.orm import Session
from src.models import Video, Job
from src.videos.models import JobStatus
from src.videos.utils import validate_duration, validate_extension, save_upload_file

async def upload_video(file: UploadFile, user_id: int, title: str, description: str, db: Session):
    """
    Handle full process of uploading a video:
    1. Validate file extension
    2. Validate video duration
    3. Save file to server
    4. Create Video record in database
    """
    new_job = Job(status=JobStatus.UPLOADING)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    validate_extension(file)

    await validate_duration(file)

    saved_video = await save_upload_file(file, user_id)

    new_video = Video(
        filename=file.filename,
        description=description,
        title=title,
        file_path=saved_video["file_path"],
        user_id=user_id,
        job_id=new_job.id,
        uploaded_at=saved_video["uploaded_at"],
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    new_job.status = JobStatus.PENDING
    db.commit()

    return {
        "id": new_video.id,
        "filename": new_video.filename,
        "path": new_video.file_path,
        "uploaded_at": new_video.uploaded_at
    }