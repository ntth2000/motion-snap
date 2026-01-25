import logging
import os
import shutil
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import BackgroundTasks, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Query, Session, joinedload

import src.posts.utils as file_handler
from src.comments.models import Comment, CommentLike
from src.comments.schemas import CommentResponseDTO
from src.models import Job, Post, PostLike, User, UserRole
from src.posts import schemas
from src.posts.constants import RESULT_PATH, VIDEO_PATH
from src.videos.enums import JobStatus, ProcessingStage
from src.videos.models import Video, VideoStatus
from src.videos.utils import remove_file

from .exceptions import (
    PermissionDeniedException,
    PostNotFoundException,
    ResourceDeletedException,
    UploadFilesFailedException,
)
from .schemas import PostResponseDTO
from .video_processor import (
    draw_2d_vertices,
    draw_3d_vertices,
    extract_2d,
    extract_frames,
    get_video_fps,
    render_frames_to_video,
)

logger = logging.getLogger(__name__)


def get_posts(db: Session, username: Optional[str]):
    query = (
        db.query(Post)
        .options(joinedload(Post.user), joinedload(Post.videos).joinedload(Video.job))
        .filter(Post.is_deleted == 0)
    )

    if username is not None:
        query = query.join(User).filter(User.username == username)

    query = query.order_by(Post.created_at.desc())

    all_posts = query.all()

    for post in all_posts:
        if post.videos and len(post.videos) > 1:
            post.view_mode = "multi"
        elif post.videos:
            post.view_mode = "single"

        for video in post.videos:
            video.file_url = video.file_url
            video.status = video.job.status if video.job else JobStatus.COMPLETED
            video.stage = video.job.stage if video.job else ProcessingStage.UPLOADED
            video.thumbnail_url = video.thumbnail_url
            video.job_id = video.job.id if video.job else None

    return all_posts


def get_post_by_id(db: Session, post_id: int, user_id: Optional[int]):
    post = (
        db.query(Post)
        .options(joinedload(Post.user), joinedload(Post.videos))
        .filter(Post.id == post_id)
        .first()
    )

    if not post:
        raise PostNotFoundException()

    if post.is_deleted:
        raise ResourceDeletedException(message="This post has been deleted.")
    post.username = post.user.username if post.user else "Unknown"
    post.userId = post.user_id
    if post.videos and len(post.videos) > 1:
        post.view_mode = "multi"
    elif post.videos:
        post.view_mode = "single"
    else:
        post.view_mode = None

    if user_id:
        is_liked = (
            db.query(PostLike)
            .filter(PostLike.post_id == post_id, PostLike.user_id == user_id)
            .first()
        )
        if is_liked:
            post.liked = True

    if post.videos:
        post.videos.sort(key=lambda x: x.view_index)
        for v in post.videos:
            v.file_url = "http://localhost:8000/api/" + v.file_url
            v.status = v.job.status if v.job else JobStatus.COMPLETED
            v.stage = v.job.stage if v.job else ProcessingStage.UPLOADED
            v.job_id = v.job.id if v.job else None

    return post


def create_post(title: str, content: str, current_user: User, db: Session):
    new_post = Post(caption=content, user_id=current_user.id)

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    db.refresh(new_post, attribute_names=["user"])

    return new_post


async def create_post_with_video(
    caption: str,
    view_mode: str,
    video_main: UploadFile | None,
    video_view1: UploadFile | None,
    video_view2: UploadFile | None,
    current_user,
    db: Session,
):
    files_to_process = []

    if view_mode == "single":
        if not video_main:
            raise HTTPException(400, "Missing video")
        file_handler.validate_extension(video_main)
        await file_handler.validate_duration(video_main)
        files_to_process.append((video_main, 0, "000"))

    elif view_mode == "multi":
        if not video_view1 or not video_view2:
            raise HTTPException(400, "Missing videos")

        for v in [video_view1, video_view2]:
            file_handler.validate_extension(v)
            await file_handler.validate_duration(v)

        files_to_process.append((video_view1, 0, "000"))
        files_to_process.append((video_view2, 1, "001"))

    post_id_backup = None
    try:
        new_post = Post(caption=caption, user_id=current_user.id)
        db.add(new_post)
        db.flush()
        post_id_backup = new_post.id

        videos_db = []
        created_video_ids = (
            []
        )  # List để lưu ID các video vừa tạo (để extract frames sau)
        thumbnail_created = False
        processing_queue = []
        print("loging here 2")

        # --- 3. SAVE FILES & CREATE VIDEO RECORDS ---
        for file_obj, v_index, sub_folder_name in files_to_process:
            dest_folder = os.path.join(
                VIDEO_PATH, str(new_post.id), sub_folder_name, "videos"
            )

            original_filename = file_obj.filename
            file_ext = os.path.splitext(original_filename)[1].lower()
            new_filename = f"video{file_ext}"
            file_obj.filename = new_filename

            saved_path = file_handler.save_upload_file(
                file_obj, dest_folder, new_filename
            )

            width, height = file_handler.get_video_resolution(saved_path)

            # Tạo record Video
            new_video = Video(
                post_id=new_post.id,
                filename=original_filename,
                file_url=saved_path,
                view_index=v_index,
                width=width,
                height=height,
            )
            db.add(new_video)
            db.flush()
            new_job = Job(
                video_id=new_video.id,
                status=JobStatus.COMPLETED,
                stage=ProcessingStage.UPLOADING,
            )
            db.add(new_job)
            db.flush()

            processing_queue.append(
                {"video": new_video, "job": new_job, "sub_folder_name": sub_folder_name}
            )

            if not thumbnail_created:
                thumb_path = file_handler.generate_thumbnail(saved_path, dest_folder)
                if thumb_path:
                    new_post.thumbnail_url = thumb_path
                    thumbnail_created = True
                    new_video.thumbnail_url = thumb_path

            db.commit()
            db.refresh(new_job)

        for v in processing_queue:
            created_video_ids.append(v["video"].id)
            job = v["job"]
            sub_folder = v["sub_folder_name"]
            job.stage = ProcessingStage.EXTRACTING_FRAMES
            job.status = JobStatus.PROCESSING
            db.commit()
            db.refresh(job)
            extract_frames(new_post.id, sub_folder)
            job.status = JobStatus.COMPLETED
            db.commit()
            db.refresh(job)

        db.refresh(new_post)

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()

        if post_id_backup:
            folder = Path(VIDEO_PATH) / str(post_id_backup)
            if folder.exists():
                shutil.rmtree(folder)

        raise UploadFilesFailedException()


def update_post(post_id: int, caption: str, current_user: User, db: Session):
    logger.info(f"===> [Post {post_id}] Updating post...")
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise PostNotFoundException()

    if post.is_deleted:
        raise ResourceDeletedException(message="Cannot edit a deleted post.")

    # Check quyền: Chỉ chủ bài viết mới được sửa
    if post.user_id != current_user.id:
        raise PermissionDeniedException(
            message="You are not authorized to edit this post."
        )

    post.caption = caption
    post.updated_at = datetime.now()

    db.commit()
    db.refresh(post)

    return post


def delete_post(post_ids: list[int], current_user: User, db: Session):
    for post_id in post_ids:
        logger.info(f"===> [Post {post_id}] Deleting post...")

        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            raise PostNotFoundException()

        if post.is_deleted:
            raise ResourceDeletedException(message="Post is already deleted.")

        if post.user_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise PermissionDeniedException(
                message="You are not authorized to delete this post."
            )

        post.is_deleted = 1

    db.commit()

    # Xóa folder chứa video
    for post_id in post_ids:
        folder = Path(VIDEO_PATH) / str(post_id)
        if folder.exists():
            shutil.rmtree(folder)
        result = Path(RESULT_PATH) / str(post_id)
        if result.exists():
            shutil.rmtree(result)

    return {"message": "Post deleted successfully"}


def extract_poses(post_id: int, db: Session):
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .options(joinedload(Post.videos))
        .first()
    )

    if not post:
        raise PostNotFoundException()

    if post.is_deleted:
        raise ResourceDeletedException(message="Post is already deleted.")

    try:
        # 1. Update Status
        post.video.job.status = JobStatus.PROCESSING
        post.video.job.stage = ProcessingStage.EXTRACTING_POSES
        db.commit()
        db.refresh(post)  # Refresh để lấy data mới nhất

        # 2. Tính toán sub_folders dựa trên video
        extract_2d(post_id, "001")
        draw_2d_vertices(post_id, "001")

        post.job.status = JobStatus.COMPLETED
        post.job.stage = ProcessingStage.EXTRACTING_POSES
        db.commit()
        fps = get_video_fps(
            Path(VIDEO_PATH) / str(post_id) / "001" / "videos" / "video.mp4"
        )
        render_frames_to_video(
            frames_dir=Path(RESULT_PATH) / str(post_id) / "001" / "vis_keypoints2d",
            output_path=Path(RESULT_PATH) / str(post_id) / "001" / "vis_2d.mp4",
            fps=fps,
        )
        return {"message": "Pose extraction completed"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Pose extraction failed")


def get_status(post_id: int, db: Session):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise PostNotFoundException()

    if post.is_deleted:
        raise ResourceDeletedException(message="Post is already deleted.")

    return post.job


def draw_3d(post_id: int, db: Session):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    post.job.status = JobStatus.PROCESSING
    post.job.stage = ProcessingStage.DRAWING_3D
    db.commit()
    draw_3d_vertices(post_id)

    fps = get_video_fps(
        Path(VIDEO_PATH) / str(post_id) / "001" / "videos" / "video.mp4"
    )

    render_frames_to_video(
        frames_dir=Path(RESULT_PATH) / str(post_id) / "001" / "render",
        output_path=Path(RESULT_PATH) / str(post_id) / "001" / "vis_3d.mp4",
        fps=fps,
    )

    post.job.status = JobStatus.COMPLETED
    post.job.stage = ProcessingStage.DRAWING_3D
    db.commit()

    return {"frame_count": 0, "message": "3D drawing completed"}


def get_status(post_id: int, db: Session):
    post = (
        db.query(Post).filter(Post.id == post_id).options(joinedload(Post.job)).first()
    )

    if not post:
        raise PostNotFoundException()

    if post.is_deleted:
        raise ResourceDeletedException(message="Post is already deleted.")

    return {
        "post_id": post.id,
        "status": post.job.status,
        "stage": post.job.stage,
    }


def get_extracted_poses(post_id: int, db: Session):
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .options(joinedload(Post.videos), joinedload(Post.job), joinedload(Post.user))
        .first()
    )
    if not post:
        return None

    if not post.videos:
        return None

    result = {}
    result["id"] = post.id
    result["caption"] = post.caption
    result["created_at"] = post.created_at
    result["thumbnail_url"] = post.thumbnail_url
    result["user_id"] = post.user_id
    result["username"] = post.user.username

    base_url = "http://localhost:8000/api"
    result["videos"] = []
    for v in post.videos:
        video_url = (
            f"{base_url}/storage/outputs/{post_id}/{(v.view_index):03}/vis_2d.mp4"
        )
        result["videos"].append(
            {"id": v.id, "file_url": video_url, "view_index": v.view_index}
        )

    return result


def get_drawn_3d(post_id: int, db: Session):
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .options(joinedload(Post.videos), joinedload(Post.job), joinedload(Post.user))
        .first()
    )
    if not post:
        return None

    if not post.videos:
        return None

    result = {}
    result["id"] = post.id
    result["caption"] = post.caption
    result["created_at"] = post.created_at
    result["thumbnail_url"] = post.thumbnail_url
    result["user_id"] = post.user_id
    result["username"] = post.user.username
    result["current_stage"] = post.job.current_stage
    result["status"] = post.job.status

    base_url = "http://localhost:8000/api"
    result["videos"] = []
    for v in post.videos:
        video_url = (
            f"{base_url}/storage/outputs/{post_id}/{(v.view_index):03}/vis_3d.mp4"
        )
        result["videos"].append(
            {"id": v.id, "file_url": video_url, "view_index": v.view_index}
        )

    return result


def get_comments_by_post_id(db: Session, post_id: int, user_id: Optional[int]):
    print("hello")
    root_comments = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.likes),
        )
        .filter(
            Comment.post_id == post_id,
            Comment.is_deleted == 0,
        )
        .order_by(Comment.created_at.desc())
        .all()
    )

    liked_comment_ids = set()

    if user_id:
        likes = (
            db.query(CommentLike.comment_id)
            .join(Comment)
            .filter(CommentLike.user_id == user_id, Comment.post_id == post_id)
            .all()
        )
        liked_comment_ids = {like.comment_id for like in likes}
        print(liked_comment_ids)

    result = []

    for root in root_comments:
        is_root_liked = root.id in liked_comment_ids
        print(is_root_liked)
        root_dto = schemas.CommentResponseDTO(
            id=root.id,
            user_id=root.user_id,
            username=root.user.username,
            content=root.content,
            is_deleted=bool(root.is_deleted),
            created_at=root.created_at,
            like_count=root.like_count,
            liked=is_root_liked,
        )

        result.append(root_dto)

    return {"comments": result, "count": len(result)}


def post_comment(post_id: int, content: str, current_user, db: Session):
    new_comment = Comment(
        user_id=current_user.id,
        post_id=post_id,
        content=content,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment, attribute_names=["user"])

    return schemas.CommentResponseDTO(
        id=new_comment.id,
        user_id=new_comment.user_id,
        username=current_user.username,
        content=new_comment.content,
        is_deleted=False,
        created_at=new_comment.created_at,
    )


def export_data(
    post_id: int,
    db: Session,
    background_tasks: BackgroundTasks,
):
    post = (
        db.query(Post)
        .options(joinedload(Post.user), joinedload(Post.videos))
        .filter(Post.id == post_id)
        .first()
    )
    if not post:
        raise PostNotFoundException()
    if post.is_deleted:
        raise ResourceDeletedException(message="This post has been deleted.")

    export_base_dir = Path(RESULT_PATH) / str(post_id) / "export_data"
    export_base_dir.mkdir(parents=True, exist_ok=True)

    temp_export_dir = export_base_dir / f"package_post_{post_id}"
    if temp_export_dir.exists():
        shutil.rmtree(temp_export_dir)
    temp_export_dir.mkdir(parents=True)

    for video in post.videos:
        view_index = f"{video.view_index:03d}"
        video_export_dir = temp_export_dir / f"video_{view_index}"
        video_export_dir.mkdir(parents=True, exist_ok=True)

        output_dir = Path("storage/outputs") / str(video.post_id) / view_index
        input_dir = Path("storage/inputs") / str(video.post_id) / view_index

        original_video_path = input_dir / "videos" / "video.mp4"
        if original_video_path.exists():
            original_dir = video_export_dir / "original"
            original_dir.mkdir(exist_ok=True)
            shutil.copy(original_video_path, original_dir / "video.mp4")

        pose_2d_video = output_dir / "vis_2d.mp4"
        if pose_2d_video.exists():
            poses_2d_dir = video_export_dir / "extracted_poses"
            poses_2d_dir.mkdir()

            frames_dir = output_dir / "vis_keypoints2d"
            json_parent = input_dir / "annots"

            if frames_dir.exists():
                shutil.copytree(frames_dir, poses_2d_dir / "frames")

            if json_parent.exists():
                subfolders = [f for f in json_parent.iterdir() if f.is_dir()]
                if subfolders:
                    shutil.copytree(subfolders[0], poses_2d_dir / "jsons")

            shutil.copy(pose_2d_video, poses_2d_dir / "video.mp4")

        pose_3d_video = output_dir / "vis_3d.mp4"
        if pose_3d_video.exists():
            poses_3d_dir = video_export_dir / "3d"
            poses_3d_dir.mkdir()

            frames_3d = output_dir / "render"
            jsons_3d = output_dir / "keypoints3d"

            if frames_3d.exists():
                shutil.copytree(frames_3d, poses_3d_dir / "frames")

            if jsons_3d.exists():
                shutil.copytree(jsons_3d, poses_3d_dir / "jsons")

            shutil.copy(pose_3d_video, poses_3d_dir / "video.mp4")

    zip_path = export_base_dir / f"post_{post_id}_export.zip"
    if zip_path.exists():
        zip_path.unlink()

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in temp_export_dir.rglob("*"):
            zipf.write(file, file.relative_to(temp_export_dir))

    background_tasks.add_task(remove_file, str(export_base_dir))

    return FileResponse(
        path=str(zip_path),
        filename=f"post_{post_id}_export.zip",
        media_type="application/zip",
    )


def toggle_like_comment(post_id: int, user_id: int, db):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise PostNotFoundException()

    existing_like = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.user_id == user_id)
        .first()
    )

    if existing_like:
        db.delete(existing_like)
        post.like_count -= 1
        is_liked = False
    else:
        new_like = PostLike(user_id=user_id, post_id=post_id)
        db.add(new_like)
        post.like_count += 1
        is_liked = True

    db.commit()
    db.refresh(post)

    return {"liked": is_liked, "like_count": post.like_count, "post_id": post.id}
