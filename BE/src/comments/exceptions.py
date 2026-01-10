from fastapi import status

from src.exceptions import BaseCustomException


class PostNotFoundException(BaseCustomException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="POST_NOT_FOUND",
            message="Post not found.",
        )


class CommentNotFoundException(BaseCustomException):
    def __init__(self, detail="Comment not found."):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="COMMENT_NOT_FOUND",
            message=detail,
        )


class PermissionDeniedException(BaseCustomException):
    def __init__(self, message="You do not have permission to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
        )


class ResourceDeletedException(BaseCustomException):
    def __init__(self, message="This resource has been deleted."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="RESOURCE_DELETED",
            message=message,
        )


class CommentAlreadyDeletedException(BaseCustomException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="COMMENT_ALREADY_DELETED",
            message="This comment has already been deleted.",
        )
