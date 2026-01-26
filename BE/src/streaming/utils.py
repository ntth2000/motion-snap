import base64
import glob
import logging
import os

import cv2
from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from src.api_keys.utils import verify_key
from src.auth.exceptions import UserNotFound
from src.database import SessionLocal
from src.models import APIKey, Job, Post, User, Video
from src.posts.constants import VIDEO_PATH
from src.videos.enums import JobStatus, ProcessingStage
from src.videos.service import extract_poses

logger = logging.getLogger(__name__)


def verify_credentials(x_username: str, x_api_key: str, db: Session) -> User:
    """
    Verify credentials from headers
    """
    print("x_username: ", x_username)
    print("x_api_key: ", x_api_key)
    user = db.query(User).filter(User.username == x_username).first()
    if not user:
        raise UserNotFound()

    api_key = (
        db.query(APIKey)
        .filter(APIKey.user_id == user.id, APIKey.is_revoked == 0)
        .first()
    )

    if not api_key or not verify_key(api_key.hashed_key, x_api_key):
        raise HTTPException(status_code=401, detail="Invalid API Keys")

    return user


def process_finished_session(
    post_id: int, session_status: dict, background_tasks: BackgroundTasks
) -> None:
    """
    Chạy khi cả 2 camera đã gửi xong.
    Nhiệm vụ: Gộp ảnh -> MP4 -> Lưu vào bảng Video/Job -> Trigger EasyMocap
    """
    db = SessionLocal()
    try:
        video_ids = []
        for x in range(2):
            frames_dir = os.path.join(
                VIDEO_PATH, str(post_id), f"00{x}", "images", "video"
            )
            final_dir = os.path.join(VIDEO_PATH, str(post_id), f"00{x}", "videos")
            os.makedirs(final_dir, exist_ok=True)

            filename = "video.mp4"
            thumb_filename = "video_thumb.jpg"
            video_path = os.path.join(final_dir, filename)
            thumb_path = os.path.join(final_dir, thumb_filename)

            images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")))
            if not images:
                print(f"[Post {post_id}] No images for camera {x}")
                continue

            first_frame = cv2.imread(images[0])
            height, width, _ = first_frame.shape

            fourcc = cv2.VideoWriter_fourcc(*"avc1")
            out = cv2.VideoWriter(video_path, fourcc, 5, (width, height))
            cv2.imwrite(thumb_path, first_frame)

            for file in images:
                print("file", file)
                frame = cv2.imread(file)
                out.write(frame)

            out.release()
            cv2.destroyAllWindows()

            file_url = f"{VIDEO_PATH}/{post_id}/00{x}/videos/{filename}"
            thumb_url = f"{VIDEO_PATH}/{post_id}/00{x}/videos/{thumb_filename}"

            new_video = Video(
                post_id=post_id,
                file_url=file_url,
                thumbnail_url=thumb_url,
                filename=filename,
                view_index=x,
                width=width,
                height=height,
                duration=len(images) / 30.0,
            )
            post = db.query(Post).filter(Post.id == post_id).first()
            if post and not post.thumbnail_url:
                post.thumbnail_url = thumb_url
                db.commit()

            db.add(new_video)
            db.commit()
            db.refresh(new_video)
            video_ids.append(new_video.id)

            new_job = Job(
                video_id=new_video.id,
                status=JobStatus.COMPLETED,
                stage=ProcessingStage.UPLOADING,
                progress=0,
                message="Video uploaded via streaming",
            )
            db.add(new_job)
            db.commit()
            db.refresh(new_job)

            logger.info(
                f"[Post {post_id}] Saved DB: Video ID {new_video.id}, Job ID {new_job.id}"
            )

            new_job.status = JobStatus.PROCESSING
            new_job.stage = ProcessingStage.EXTRACTING_POSES
            db.commit()

        for video_id in video_ids:
            extract_poses(video_id=video_id, fps=5)

    except Exception as e:
        logger.error(f"[Post {post_id}] Error processing session: {str(e)}")
        videos = (
            db.query(Video)
            .filter(Video.post_id == post_id)
            .options(joinedload(Video.jobs))
            .all()
        )
        for video in videos:
            video.job.status = JobStatus.FAILED
        raise
    finally:
        db.close()
        if post_id in session_status:
            del session_status[post_id]
