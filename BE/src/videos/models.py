from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Enum
from src.database import Base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

class Video(Base):
    __tablename__ = 'videos'

    id = Column(Integer, primary_key=True, autoincrement=True)
    uploaded_at = Column(DateTime, default=datetime.now())
    filename = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=True)

    # Relationships
    user = relationship("User", back_populates="videos")
    job = relationship("Job", back_populates="video")


class JobStatus(enum.Enum):
    PENDING = "PENDING"
    UPLOADING = "UPLOADING"
    EXTRACTING = "EXTRACTING"
    DRAWING="DRAWING"
    DONE = "DONE"
    FAILED = "FAILED"


class Job(Base):
    __tablename__ = 'jobs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    result_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now())

    # Relationship
    video = relationship("Video", back_populates="job", uselist=False)