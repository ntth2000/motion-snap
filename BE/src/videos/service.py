import os, base64

from pathlib import Path
import shutil
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
import zipfile
from src.models import Video, Job
from src.videos.models import JobStatus
from src.videos.utils import validate_duration, validate_extension, save_upload_file
from src.videos.exceptions import UploadFilesFailedException
from src.videos.video_processor import extract_frames, extract_2d, draw_2d_vertices, draw_3d_vertices, render_frames_to_video, get_video_fps
from src.videos.schemas import VideoListResponse, VideoResponse
from src.videos.constants import VIDEO_PATH, RESULT_PATH


def get_video_by_id(video_id: int, user_id: int, db: Session):
    """
    Get a video by its ID and user ID
    """
    video = (
        db.query(Video)
        .options(joinedload(Video.job))
        .filter(Video.id == video_id, Video.user_id == user_id)
        .first()
    )

    if not video:
        return None

    video_id_str = str(video.id)
    video_dir = os.path.join(VIDEO_PATH, str(video.id))

    if not os.path.exists(video_dir):
        return None

    thumbnail_path = os.path.join(
        "storage", "inputs", video_id_str, "images", video.filename.split('.')[0], "000000.jpg"
    )

    thumbnail_b64 = None
    if os.path.exists(thumbnail_path):
        with open(thumbnail_path, "rb") as f:
            thumbnail_b64 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

    status = video.job.status.value if video.job else ""
    base_url = "http://localhost:8000"
    video_url =  f"{base_url}/storage/inputs/{video_id}/videos/{video.filename}"

    return VideoResponse(
        id=video.id,
        filename=video.filename,
        uploaded_at=video.uploaded_at,
        thumbnail_url=thumbnail_b64,
        status=status,
        video_url=video_url
    )


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


def delete_video(video_id: int, user_id: int, db: Session):
    """
    Delete a video by its ID and user ID
    """
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user_id).first()
    if not video:
        return

    video_dir = os.path.join(VIDEO_PATH, str(video.id))
    output_dir = os.path.join(RESULT_PATH, str(video.id))
    if os.path.exists(video_dir):
        for root, dirs, files in os.walk(video_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(video_dir)
    
    if os.path.exists(output_dir):
        for root, dirs, files in os.walk(output_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(output_dir)

    db.delete(video)
    db.commit()


def extract_poses(video_id: int, db):
    video=db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return None
    
    job= db.query(Job).filter(Job.id == video.job_id).first()
    if not job:
        return None
    
    job.status= JobStatus.EXTRACTING_POSES
    db.commit()
    extract_2d(video_id)
    draw_2d_vertices(video_id)
    job.status= JobStatus.EXTRACTED_POSES
    db.commit()

    fps = get_video_fps(Path(VIDEO_PATH) / str(video_id) / "videos"/ video.filename)

    render_frames_to_video(
        frames_dir=Path(RESULT_PATH) / str(video_id) / "vis_keypoints2d",
        output_path=Path(RESULT_PATH) / str(video_id) / "vis_2d.mp4",
        fps=fps
    )

    return {"message": "Pose extraction completed"}


def get_extracted_poses(video_id: int, user_id: int, db: Session):
    """
    Get extracted poses for a video by its ID and user ID
    """
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user_id).first()
    if not video:
        return None
    base_url = "http://localhost:8000"

    annot_path = Path(VIDEO_PATH) / str(video_id) / "annots" / f"{video.filename.split('.')[0]}"
    if not annot_path.exists():
        return None
    
    poses_folder_path = Path(RESULT_PATH) / str(video_id) / "vis_keypoints2d"
    if not poses_folder_path.exists():
        return None

    poses = []
    for file in sorted(poses_folder_path.iterdir()):
        if file.suffix.lower() in [".jpg", ".png"]:
            poses.append(f"{base_url}/{poses_folder_path}/{file.name}")
    
    video_url =  f"{base_url}/storage/outputs/{video_id}/vis_2d.mp4"

    return {"video_id": video_id, "video_url": video_url, "pose_frames": poses}


def get_extracted_frames(video_id: int, user_id: int, db: Session):
    """
    Get extracted frames for a video by its ID and user ID
    """
    video_input_dir = Path(VIDEO_PATH)/ str(video_id) / "images"
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user_id).first()
    if not video:
        return None

    subdirs = [d for d in video_input_dir.iterdir() if d.is_dir()]
    if not subdirs:
        raise HTTPException(status_code=404, detail="No frames directory found")

    frames_dir = subdirs[0]  # Giả sử chỉ có 1 folder cho video_name

    frame_files = sorted([f for f in frames_dir.iterdir() if f.is_file() and f.suffix.lower() in [".jpg", ".png"]])

    base_url = "http://localhost:8000"  # có thể lấy dynamic qua request.base_url nếu cần
    frame_urls = [
        f"{base_url}/storage/inputs/{video_id}/images/{frames_dir.name}/{f.name}"
        for f in frame_files
    ]

    return {"video_id": video_id, "frame_count": len(frame_urls), "frames": frame_urls}


def draw_3d(video_id: int, db: Session):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return None
    
    job = db.query(Job).filter(Job.id == video.job_id).first()
    if not job:
        return None
    
    job.status = JobStatus.DRAWING_3D
    db.commit()
    draw_3d_vertices(video_id)

    job.status = JobStatus.DRAWN_3D
    db.commit()

    fps = get_video_fps(Path(VIDEO_PATH) / str(video_id) / "videos"/ video.filename)

    render_frames_to_video(
        frames_dir=Path(RESULT_PATH) / str(video_id) / "render",
        output_path=Path(RESULT_PATH) / str(video_id) / "vis_3d.mp4",
        fps=fps
    )

    return {"frame_count": 0, "message": "3D drawing completed"}


def get_draw_3d_frames(video_id: int, user_id: int, db: Session):
    """
    Get 3D drawn frames for a video by its ID and user ID
    """
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user_id).first()
    if not video:
        return None
    
    video_output_dir = Path(RESULT_PATH) / str(video_id)

    subdirs = [d for d in video_output_dir.iterdir() if d.is_dir()]
    if not subdirs:
        raise HTTPException(status_code=404, detail="No 3D drawn frames directory found")

    frames_dir = video_output_dir / "smpl"
    frames_dir = subdirs

    # frame_files = sorted([f for f in frames_dir.iterdir() if f.is_file() and f.suffix.lower() in [".jpg", ".png"]])

    # base_url = "http://localhost:8000"  # có thể lấy dynamic qua request.base_url nếu cần
    # frame_urls = [
    #     f"{base_url}/storage/outputs/{video_id}/render/{f.name}"
    #     for f in frame_files
    # ]
    base_url = "http://localhost:8000"
    video_url =  f"{base_url}/storage/outputs/{video_id}/vis_3d.mp4"

    return {"video_id": video_id, "video_url": video_url}


def export_video_data(video_id: int, export_type: str, user_id: int, db: Session):
    output_base_dir = Path(RESULT_PATH) / str(video_id)
    input_base_dir = Path(VIDEO_PATH) / str(video_id)
    export_dir = output_base_dir/"export_data"
    export_dir.mkdir(exist_ok=True)
    temp_export = export_dir / f"package_{export_type}"
    if temp_export.exists():
        shutil.rmtree(temp_export)
    temp_export.mkdir(parents=True)

    if export_type == "extracted_poses":
        frames_dir = output_base_dir / "vis_keypoints2d"
        json_2d_parent_folder = input_base_dir / "annots"
        subfolders = [f for f in json_2d_parent_folder.iterdir() if f.is_dir()]
        jsons_dir = subfolders[0]
        video_file = output_base_dir / "vis_2d.mp4"
    
    if export_type == "3d":
        frames_dir = output_base_dir / "render"
        jsons_dir = output_base_dir / "keypoints3d"
        video_file = output_base_dir / "vis_3d.mp4"
    
    if frames_dir.exists():
        shutil.copytree(frames_dir, temp_export / "frames")
    if jsons_dir.exists():
        shutil.copytree(jsons_dir, temp_export / "jsons")
    if video_file.exists():
        shutil.copy(video_file, temp_export / "video.mp4")
    
    zip_path = export_dir / f"video_{video_id}_{export_type}_export.zip"
    print(zip_path)

    # Tạo zip
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for folder_name in ["frames", "jsons", "video.mp4"]:
            path_to_add = temp_export / folder_name
            if path_to_add.exists():
                if path_to_add.is_dir():
                    for file in path_to_add.rglob('*'):
                        zipf.write(file, file.relative_to(temp_export))
                else:
                    zipf.write(path_to_add, path_to_add.name)
    file_size = os.path.getsize(zip_path)
    print(f"[DEBUG] Zip file path: {zip_path}, size: {file_size} bytes")
    
    # Trả về FileResponse để download
    return FileResponse(
        path=str(zip_path),
        filename=f"video_{video_id}_{export_type}_export.zip",
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=video_{video_id}_{export_type}_export.zip"}
    )