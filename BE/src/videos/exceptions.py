from fastapi import HTTPException, status
from .constants import MAX_DURATION_IN_SECONDS, ALLOWED_VIDEO_EXTENSIONS

class UnsupportedVideoExtensionException(HTTPException):
    def __init__(self, ext: str):
        super().__init__(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported video extension: {ext}. Allowed extensions: {', '.join(sorted(ext for ext in ALLOWED_VIDEO_EXTENSIONS))}.",
        )

class VideoTooLongException(HTTPException):
    def __init__(self, duration: float):
        super().__init__(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Video too long ({duration:.1f}s). Maximum allowed: {MAX_DURATION_IN_SECONDS}s",
        )
