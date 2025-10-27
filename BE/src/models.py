# src/models.py
from src.videos.models import Video, Job
from src.users.models import User

# Giúp Alembic phát hiện tất cả các model
__all__ = ["User", "Video", "Job"]
