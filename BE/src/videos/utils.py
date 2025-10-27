from fastapi import UploadFile
from pathlib import Path
from moviepy import VideoFileClip
import tempfile
import os

from src.videos.exceptions import UnsupportedVideoExtensionException, VideoTooLongException
from src.videos.constants import ALLOWED_VIDEO_EXTENSIONS, MAX_DURATION_IN_SECONDS, VIDEO_PATH


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
            with VideoFileClip(temp_file.file) as video:
                duration = video.duration
                if duration > MAX_DURATION_IN_SECONDS:
                    raise VideoTooLongException(duration)
        finally:
            await file.seek(0)  # Reset file pointer
            os.unlink(temp_file.name)  # Delete temporary file
    
    return True


def save_upload_file(upload_file: UploadFile, destination: Path) -> Path:
    """
    Save an uploaded file to a destination path
    Args:
        upload_file: UploadFile object to save
        destination: Path where the file should be saved
    Returns:
        null
    """

    folder_path = os.path.join(VIDEO_PATH, destination)
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, upload_file.filename)

    with open(file_path, "wb") as buffer:
        content = upload_file.file.read()
        buffer.write(content)
    
    return file_path
