from fastapi import status

from src.exceptions import BaseCustomException


class PostNotFoundException(BaseCustomException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="POST_NOT_FOUND",
            message="Post not found.",
        )


class PermissionDeniedException(BaseCustomException):
    def __init__(self, message="You do not have permission to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
        )


class ResourceDeletedException(BaseCustomException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="RESOURCE_ALREADY_DELETED",
            message="This resource has already been deleted.",
        )


class UploadFilesFailedException(BaseCustomException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="UPLOAD_FILES_FAILED",
            message="Failed to upload.",
        )


class VideoTooLongException(BaseCustomException):
    def __init__(self, duration):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VIDEO_TOO_LONG",
            message=f"Video is too long ({duration}s). Max allowed is {MAX_DURATION_IN_SECONDS}s.",
        )


class UnsupportedVideoExtensionException(BaseCustomException):
    def __init__(self, ext):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="UNSUPPORTED_VIDEO_EXTENSION",
            message=f"Unsupported video extension: {ext}",
        )


class EmptyPostException(BaseCustomException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="EMPTY_POST",
            message="This post is empty.",
        )
