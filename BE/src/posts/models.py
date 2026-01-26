from sqlalchemy import (Column, DateTime, Enum, ForeignKey, Integer, String,
                        Text, func)
from sqlalchemy.orm import relationship

from src.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caption = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    is_deleted = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    like_count = Column(Integer, default=0)
    # Relationships
    user = relationship("User", back_populates="posts")
    videos = relationship("Video", back_populates="post", cascade="all, delete-orphan")
    comments = relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )
    likes = relationship("PostLike", backref="post", cascade="all, delete-orphan")


class PostLike(Base):
    __tablename__ = "post_likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
