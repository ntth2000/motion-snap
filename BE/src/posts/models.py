from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from src.database import Base

from .enums import JobStatus, ProcessingStage


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caption = Column(Text, nullable=True)

    job_status = Column(Enum(JobStatus), default=JobStatus.PENDING)

    result_mesh_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    is_deleted = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="posts")
    videos = relationship("Video", back_populates="post", cascade="all, delete-orphan")
    comments = relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )
    job = relationship(
        "Job", back_populates="post", uselist=False, cascade="all, delete-orphan"
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    current_stage = Column(Enum(ProcessingStage), default=ProcessingStage.INIT)
    progress = Column(Integer, default=0)
    message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)

    # Relationship
    post = relationship("Post", back_populates="job")
