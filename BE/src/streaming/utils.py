import os
import base64
import cv2
import glob
import threading
import shutil
import numpy as np
from src.models import User, APIKey, Job, Video, Post
from src.auth.exceptions import UserNotFound
from src.api_keys.utils import verify_key
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Header, Depends, BackgroundTasks
from src.posts.constants import VIDEO_PATH
from sqlalchemy.orm import Session
from src.database import get_db, SessionLocal
from datetime import datetime
from src.videos.enums import JobStatus, ProcessingStage
from src.videos.service import extract_poses


def verify_credentials(x_username: str, x_api_key: str, db: Session) -> User:
    """
    Verify credentials from headers
    """
    print("x_username: ", x_username)
    print("x_api_key: ", x_api_key)
    user = db.query(User).filter(User.username == x_username).first()
    if not user:
        raise UserNotFound()

    api_key = db.query(APIKey).filter(APIKey.user_id == user.id).first()

    if not api_key or not verify_key(api_key.hashed_key, x_api_key):
        raise HTTPException(status_code=401, detail="Invalid API Keys")

    return user


def process_finished_session(post_id: int, session_status: dict, background_tasks: BackgroundTasks) -> None:
    """
    Chạy khi cả 2 camera đã gửi xong.
    Nhiệm vụ: Gộp ảnh -> MP4 -> Lưu vào bảng Video/Job -> Trigger EasyMocap
    """
    db = SessionLocal()

    try:
        for x in range(2):
            frames_dir = os.path.join(
                VIDEO_PATH, str(post_id), f"00{x+1}", "images", "video"
            )
            final_dir = os.path.join(VIDEO_PATH, str(post_id), f"00{x+1}", "videos")
            os.makedirs(final_dir, exist_ok=True)

            filename = "video.mp4"
            thumb_filename = "video_thumb.jpg"
            video_path = os.path.join(final_dir, filename)
            thumb_path = os.path.join(final_dir, thumb_filename)

            images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")))
            if not images:
                print(f"[Post {post_id}] No images for camera {x+1}")
                continue

            first_frame = cv2.imread(images[0])
            height, width, _ = first_frame.shape

            fourcc = cv2.VideoWriter_fourcc(*"avc1")
            out = cv2.VideoWriter(video_path, fourcc, 30, (width, height))
            cv2.imwrite(thumb_path, first_frame)

            for file in images:
                print("file", file)
                frame = cv2.imread(file)
                out.write(frame)

            out.release()
            cv2.destroyAllWindows()

            file_url = f"{VIDEO_PATH}/{post_id}/00{x+1}/videos/{filename}"
            thumb_url = f"{VIDEO_PATH}/{post_id}/00{x+1}/videos/{thumb_filename}"

            new_video = Video(
                post_id=post_id,
                file_url=file_url,
                thumbnail_url=thumb_url,
                filename=filename,
                view_index=x + 1,
                width=width,
                height=height,
                duration=len(images) / 30.0,
            )
            if x == 0:           
                # Query Post và update
                post = db.query(Post).filter(Post.id == post_id).first()
                if post:
                    # 👇 LƯU Ý: Đảm bảo model Post có cột thumbnail_url
                    post.thumbnail_url = thumb_url
                    db.commit()

            db.add(new_video)
            db.commit()
            db.refresh(new_video)

            # 3. Tạo Record trong bảng 'jobs' (Để worker EasyMocap quét thấy)
            new_job = Job(
                video_id=new_video.id,
                status=JobStatus.COMPLETED,  # Chờ xử lý
                stage=ProcessingStage.UPLOADING,  # Hoặc giai đoạn khởi tạo
                progress=0,
                message="Video uploaded via streaming",
            )
            db.add(new_job)
            db.commit()

            print(
                f"✅ [Post {post_id}] Saved DB: Video ID {new_video.id}, Job ID {new_job.id}"
            )
            background_tasks.add_task(extract_poses(new_video.id, db))

    except Exception as e:
        print(f"❌ [Post {post_id}] Error processing session: {str(e)}")
        raise
    finally:
        db.close()
        if post_id in session_status:
            del session_status[post_id]
