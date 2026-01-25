from datetime import datetime
from typing import Optional

from sqlalchemy import case, desc, func
from sqlalchemy.orm import Session, joinedload

from src.auth.exceptions import InvalidUserInfoException
from src.auth.utils import create_access_token, create_refresh_token, verify_password
from src.models import APIKey, Job, Post, RefreshToken, User, Video
from src.videos.enums import JobStatus, ProcessingStage


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
    total_api_keys = db.query(func.count(APIKey.id)).scalar()

    total_posts = db.query(func.count(Post.id)).filter(Post.is_deleted == 0).scalar()

    job_stats = db.query(
        func.count(Job.id).label("total"),
        func.sum(case((Job.status == JobStatus.FAILED, 1), else_=0)).label("failed"),
        func.sum(case((Job.status == JobStatus.PENDING, 1), else_=0)).label("pending"),
        func.sum(case((Job.status == JobStatus.PROCESSING, 1), else_=0)).label(
            "processing"
        ),
        func.sum(case((Job.status == JobStatus.COMPLETED, 1), else_=0)).label(
            "completed"
        ),
    ).first()

    total_jobs = job_stats.total or 0
    failed_jobs = job_stats.failed or 0
    pending_jobs = job_stats.pending or 0
    processing_jobs = job_stats.processing or 0
    completed_jobs = job_stats.completed or 0

    success_rate = 0
    if total_jobs > 0:
        success_rate = round((completed_jobs / total_jobs) * 100, 2)

    # Recent Jobs
    recent_jobs_query = (
        db.query(Job)
        .join(Video, Job.video_id == Video.id)
        .join(Post, Video.post_id == Post.id)
        .join(User, Post.user_id == User.id)
        .options(joinedload(Job.video).joinedload(Video.post).joinedload(Post.user))
        .order_by(desc(Job.created_at))
        .limit(5)
        .all()
    )

    recent_jobs_data = []
    for job in recent_jobs_query:
        filename = job.video.filename if job.video else "Unknown"
        user_email = (
            job.video.post.user.email
            if (job.video and job.video.post and job.video.post.user)
            else "Unknown"
        )
        username = (
            job.video.post.user.username
            if (job.video and job.video.post and job.video.post.user)
            else "Unknown"
        )
        recent_jobs_data.append(
            {
                "id": job.id,
                "video_filename": filename,
                "created_at": job.created_at,
                "status": job.status,
                "progress": job.progress,
                "user_email": user_email,
                "username": username,
            }
        )

    # Recent Users
    recent_users_query = (
        db.query(User)
        .filter(User.role == "USER")
        .order_by(desc(User.created_at))
        .limit(5)
        .all()
    )

    recent_users_data = []
    for user in recent_users_query:
        recent_users_data.append(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar": None,
                "created_at": user.created_at,
            }
        )

    return {
        "total_users": total_users,
        "total_api_keys": total_api_keys,
        "total_posts": total_posts,
        "total_jobs": total_jobs,
        "pending_jobs": pending_jobs,
        "processing_jobs": processing_jobs,
        "failed_jobs": failed_jobs,
        "completed_jobs": completed_jobs,
        "success_rate": success_rate,
        "recent_users": recent_users_data,
        "recent_jobs": recent_jobs_data,
    }


def get_all_users(
    db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None
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
                User.name.ilike(search_fmt),
            )
        )

    total = query.count()

    users = (
        query.order_by(User.created_at.desc())
        .filter(User.role == "USER")
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
    show_deleted: bool = False,
):
    """
    Get post list.
    - Include User (who posted).
    - Include Video (to show thumbnail/status).
    """
    query = db.query(Post).options(
        joinedload(Post.user), joinedload(Post.videos).joinedload(Video.job)
    )

    if not show_deleted:
        query = query.filter(Post.is_deleted == 0)

    if search:
        search_fmt = f"%{search}%"
        query = query.join(User).filter(
            or_(Post.caption.ilike(search_fmt), User.email.ilike(search_fmt))
        )

    total = query.count()

    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

    return {"total": total, "items": posts}


def admin_delete_post(db: Session, post_id: int):
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
    db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None
):
    """
    Get API Key list.
    """
    query = db.query(APIKey).join(User).options(joinedload(APIKey.user))

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(User.email.ilike(search_fmt), APIKey.prefix.ilike(search_fmt))
        )

    total = query.count()

    api_keys = query.order_by(APIKey.created_at.desc()).offset(skip).limit(limit).all()

    return {"total": total, "items": api_keys}


def revoke_api_key(db: Session, key_id: int):
    """
    Revoke API Key
    """
    api_key = db.query(APIKey).filter(APIKey.id == key_id).first()
    if not api_key:
        return False

    api_key.is_revoked = 1
    db.commit()
    return True
