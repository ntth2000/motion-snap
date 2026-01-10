import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from src.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)

    file_url = Column(String, nullable=False)
    filename = Column(String, nullable=False)

    view_index = Column(Integer, nullable=False, default=0)
    duration = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationships
    post = relationship("Post", back_populates="videos")
