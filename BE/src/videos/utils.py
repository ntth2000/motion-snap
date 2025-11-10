from fastapi import UploadFile, HTTPException, status
from pathlib import Path
from moviepy import VideoFileClip
import shutil
import tempfile
import os
import json
from datetime import datetime

from src.models import Video, Job
from src.videos.models import JobStatus
from src.videos.exceptions import UnsupportedVideoExtensionException, VideoTooLongException
from src.videos.constants import ALLOWED_VIDEO_EXTENSIONS, MAX_DURATION_IN_SECONDS, VIDEO_PATH, COCO_12_POINTS


def validate_extension(file: UploadFile) -> bool:
    """
    Validates if the file extension is allowed
    Args:
        filename: Name of the file to validate
    Returns:
        bool: True if validation passes
    Raises:
        HTTPException: If file extension is not allowed
    """
    file_extension = Path(file.filename).suffix.lower().replace('.', '')
    if file_extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise UnsupportedVideoExtensionException(file_extension)
    return True


async def validate_duration(file: UploadFile) -> bool:
    """
    Validates if the video duration is within allowed limit
    Args:
        file: UploadFile object containing the video
    Returns:
        bool: True if validation passes
    Raises:
        HTTPException: If video duration exceeds limit
    """
    file_extension = Path(file.filename).suffix.lower()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file.flush()
        
        try:
            with VideoFileClip(temp_file.name) as video:
                duration = video.duration
                if duration > MAX_DURATION_IN_SECONDS:
                    raise VideoTooLongException(duration)
        finally:
            await file.seek(0)  # Reset file pointer
            os.unlink(temp_file.name)  # Delete temporary file
    
    return True


def save_upload_file(file: UploadFile, video_id: int):
    """
    Save an uploaded file to a destination path
    Args:
        upload_file: UploadFile object to save
        destination: Path where the file should be saved
    Returns:
        null
    """

    folder_path = os.path.join(VIDEO_PATH, str(video_id), "videos")
    os.makedirs(folder_path, exist_ok=True)

    current_time = datetime.now()
    file_path = os.path.join(folder_path, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving video: {str(e)}"
        )

    return {
        "filename": file.filename,
        "file_path": file_path,
        "uploaded_at": current_time,
    }


def remove_file(path: str):
    try:
        file = Path(path)
        if file.exists():
            shutil.rmtree(file)
    except Exception as e:
        print(f"Failed to remove {path}: {e}")


def convert_3d_keypoints_format(jsons_dir: Path):
    """
    Convert tất cả JSON 3D trong jsons_dir sang dict số thứ tự { "0": [x,y,z], ... }
    ghi đè trực tiếp lên file cũ.
    """
    for jf in jsons_dir.glob("*.json"):
        with open(jf, "r") as f:
            data = json.load(f)

        if isinstance(data, list) and len(data) > 0 and "keypoints3d" in data[0]:
            first_obj = data[0]
            keypoints3d = first_obj["keypoints3d"]

            # Convert sang dict số thứ tự
            named_keypoints3d = {str(i): coords for i, coords in enumerate(keypoints3d)}

            # Tạo JSON mới
            new_data = {
                "id": first_obj.get("id", 0),
                "keypoints3d": named_keypoints3d
            }

            # Ghi đè trực tiếp lên file gốc
            with open(jf, "w") as f:
                json.dump(new_data, f, indent=2)


def convert_2d_poses_format(jsons_dir: Path):
    """
    Chuyển các file JSON trong jsons_dir:
    - Giữ filename, height, width
    - Chỉ lấy annots[0]
    - Chỉ giữ 12 keypoints đầu tiên cho mỗi person
    - Đổi thành dict {point_name: [x,y,z]}
    """
    json_files = list(jsons_dir.glob("*.json"))
    for jf in json_files:
        with open(jf, "r") as f:
            data = json.load(f)
        
        if "annots" in data and len(data["annots"]) > 0:
            first_annot = data["annots"][0]
            # Lấy 12 keypoints đầu tiên
            keypoints = first_annot["keypoints"][:12]
            
            # Convert thành dict
            named_keypoints = {
                name: coords for name, coords in zip(COCO_12_POINTS, keypoints)
            }
            
            first_annot["keypoints"] = named_keypoints
            
            new_data = {
                "filename": data.get("filename", ""),
                "height": data.get("height", 0),
                "width": data.get("width", 0),
                "annots": [first_annot],
                "isKeyframe": data.get("isKeyframe", False)
            }
            
            with open(jf, "w") as f:
                json.dump(new_data, f, indent=2)


def get_video_size(video_file_path: Path):
    width = height = None
    if os.path.exists(video_file_path):
        with VideoFileClip(video_file_path) as clip:
            width, height = clip.size
    
    return width, height