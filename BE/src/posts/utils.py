import os
import shutil
import tempfile
from pathlib import Path

import cv2
from fastapi import HTTPException, UploadFile, status
from moviepy import VideoFileClip

from .constants import VIDEO_PATH
from .exceptions import (UnsupportedVideoExtensionException,
                         VideoTooLongException)

# Move constants here or import from config
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "mov", "avi", "mkv"}
MAX_DURATION_IN_SECONDS = 60  # Ví dụ


def get_video_resolution(video_path: str):
    """
    Return (width, height) of video.
    Return (0, 0) if error.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return 0, 0

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        cap.release()
        return width, height
    except Exception as e:
        print(f"Error reading video resolution: {e}")
        return 0, 0


def validate_extension(file: UploadFile) -> bool:
    filename = file.filename if file.filename else ""
    file_extension = Path(filename).suffix.lower().replace(".", "")
    if file_extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise UnsupportedVideoExtensionException(file_extension)
    return True


async def validate_duration(file: UploadFile) -> bool:
    filename = file.filename if file.filename else "temp"
    file_extension = Path(filename).suffix.lower()

    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file.flush()
        temp_path = temp_file.name

    try:
        clip = VideoFileClip(temp_path)
        duration = clip.duration
        clip.close()

        if duration > MAX_DURATION_IN_SECONDS:
            raise VideoTooLongException(duration)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid video file: {str(e)}")
    finally:
        await file.seek(0)
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    return True


def save_upload_file(file: UploadFile, destination_folder: str, filename: str) -> str:
    """
    Hàm mới: Lưu file vào folder chỉ định (Generic hơn hàm cũ)
    """
    os.makedirs(destination_folder, exist_ok=True)

    file_path = os.path.join(destination_folder, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}",
        )

    return file_path


def generate_thumbnail(video_path: str, output_folder: str) -> str:
    """
    Cắt frame ở giây thứ 1 (hoặc 0.1) để làm thumbnail.
    Lưu vào cùng folder với video.
    Returns: Đường dẫn file thumbnail
    """
    try:
        video_filename = Path(video_path).stem
        thumb_filename = f"{video_filename}_thumb.jpg"
        thumb_path = os.path.join(output_folder, thumb_filename)

        clip = VideoFileClip(video_path)
        clip = VideoFileClip(video_path)

        t = 0.5 if clip.duration > 0.5 else 0.1
        clip.save_frame(thumb_path, t=t)

        clip.close()  # Quan trọng: Đóng clip để giải phóng RAM

        return thumb_path
    except Exception as e:
        print(f"Failed to generate thumbnail: {e}")
        return None


def check_empty_post(post_id: int, view_index: str):
    images_path = os.path.join(VIDEO_PATH, str(post_id), view_index, "images", "video")
    videos_path = os.path.join(
        VIDEO_PATH, str(post_id), view_index, "videos", "video.mp4"
    )

    if not os.path.exists(images_path):
        return True

    for item in os.listdir(images_path):
        if os.path.isfile(os.path.join(images_path, item)):
            return False

    if os.path.exists(videos_path):
        return False

    return True
