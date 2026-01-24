import enum
from datetime import datetime

from sqlalchemy import (Column, DateTime, Enum, Float, ForeignKey, Integer,
                        String, Text, func)
from sqlalchemy.orm import relationship

from src.database import Base
from src.videos.enums import JobStatus, ProcessingStage


class VideoStatus(enum.Enum):
    UPLOADED = "UPLOADED"
    EXTRACTED_FRAMES = "EXTRACTED_FRAMES"
    EXTRACTED_POSES = "EXTRACTED_POSES"
    DRAWN_3D = "DRAWN_3D"


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)

    file_url = Column(String, nullable=False)
    filename = Column(String, nullable=False)

    view_index = Column(Integer, nullable=False, default=0)
    duration = Column(Float, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)

    # Relationships
    post = relationship("Post", back_populates="videos")
    job = relationship(
        "Job", back_populates="video", uselist=False, cascade="all, delete-orphan"
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    stage = Column(Enum(ProcessingStage), default=ProcessingStage.UPLOADING)
    progress = Column(Integer, default=0)
    message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)

    # Relationship
    video = relationship("Video", back_populates="job")
