from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, case
from src.models import User, Post, Job, RefreshToken, Video
from src.videos.enums import JobStatus, ProcessingStage
from typing import Optional
from src.auth.utils import verify_password, create_access_token, create_refresh_token
from src.auth.exceptions import InvalidUserInfoException
from datetime import datetime


def admin_login(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.role == "ADMIN").first()
    if user:
      print(user.email)

    if not verify_password(password, user.password_hash):
        raise InvalidUserInfoException()

    access_token = create_access_token({"sub": user.email, "id": user.id})
    refresh_token = create_refresh_token({"sub": user.email, "id": user.id})

    new_refresh_token = RefreshToken(
        token=refresh_token, user_id=user.id, created_at=datetime.utcnow()
    )
    db.add(new_refresh_token)
    db.commit()

    return access_token, refresh_token, user


def get_dashboard_stats(db: Session):
    total_users = db.query(func.count(User.id)).scalar()
    
    total_posts = db.query(func.count(Post.id)).filter(Post.is_deleted == 0).scalar()

    job_stats = db.query(
        func.count(Job.id).label("total"),
        func.sum(case((Job.status == JobStatus.FAILED, 1), else_=0)).label("failed"),
        func.sum(case((Job.status == JobStatus.PENDING, 1), else_=0)).label("pending"),
        func.sum(case((Job.status == JobStatus.PROCESSING, 1), else_=0)).label("processing"),
        func.sum(case((Job.status == JobStatus.COMPLETED, 1), else_=0)).label("completed")
    ).first()

    total_jobs = job_stats.total or 0
    failed_jobs = job_stats.failed or 0
    pending_jobs = job_stats.pending or 0
    processing_jobs = job_stats.processing or 0
    completed_jobs = job_stats.completed or 0

    success_rate = 0
    if total_jobs > 0:
        success_rate = round((completed_jobs / total_jobs) * 100, 2)

    recent_failures_query = (
        db.query(Job)
        .join(Video, Job.video_id == Video.id)
        .join(Post, Video.post_id == Post.id)
        .join(User, Post.user_id == User.id)
        .filter(Job.status == JobStatus.FAILED)
        .options(
            joinedload(Job.video).joinedload(Video.post).joinedload(Post.user)
        )
        .order_by(desc(Job.created_at))
        .limit(5)
        .all()
    )

    recent_failed_jobs_data = []
    for job in recent_failures_query:
        filename = job.video.filename if job.video else "Unknown"
        user_email = job.video.post.user.email if (job.video and job.video.post and job.video.post.user) else "Unknown"
        
        recent_failed_jobs_data.append({
            "id": job.id,
            "video_filename": filename,
            "created_at": job.created_at,
            "user_email": user_email
        })

    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "total_jobs": total_jobs,
        "pending_jobs": pending_jobs,
        "processing_jobs": processing_jobs,
        "failed_jobs": failed_jobs,
        "completed_jobs": completed_jobs,
        "success_rate": success_rate,
        "recent_failed_jobs": recent_failed_jobs_data
    }


def get_all_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = None
):
    """
    Get user list and pagination
    """
    query = db.query(User)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                User.username.ilike(search_fmt),
                User.email.ilike(search_fmt),
                User.name.ilike(search_fmt)
            )
        )

    total = query.count()

    users = (
        query.order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"total": total, "items": users}


def get_all_posts(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = None,
    show_deleted: bool = False
):
    """
    Get post list.
    - Include User (who posted).
    - Include Video (to show thumbnail/status).
    """
    query = db.query(Post).options(
        joinedload(Post.user),
        joinedload(Post.videos).joinedload(Video.job)
    )

    if not show_deleted:
        query = query.filter(Post.is_deleted == 0)

    if search:
        search_fmt = f"%{search}%"
        query = query.join(User).filter(
            or_(
                Post.caption.ilike(search_fmt),
                User.email.ilike(search_fmt)
            )
        )

    total = query.count()

    posts = (
        query.order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {"total": total, "items": posts}


def delete_post(db: Session, post_id: int):
    """
    Soft delete posts (Admin delete post)
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return False
    
    post.is_deleted = 1
    db.commit()
    return True

  
def get_all_api_keys(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = None
):
    """
    Get API Key list.
    """
    query = db.query(ApiKey).join(User).options(joinedload(ApiKey.user))

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                User.email.ilike(search_fmt),
                ApiKey.prefix.ilike(search_fmt),
                ApiKey.name.ilike(search_fmt)
            )
        )

    total = query.count()

    api_keys = (
        query.order_by(ApiKey.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"total": total, "items": api_keys}


def revoke_api_key(db: Session, key_id: int):
    """
    Revoke API Key
    """
    api_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if not api_key:
        return False
    
    api_key.is_active = False
    db.commit()
    return True