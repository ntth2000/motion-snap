import base64
import logging
import os
import threading
from datetime import datetime

import cv2
import numpy as np
from fastapi import (APIRouter, BackgroundTasks, Depends, Header, WebSocket,
                     WebSocketDisconnect)
from sqlalchemy.orm import Session

from src.database import get_db
from src.models import Post
from src.posts.constants import VIDEO_PATH

from .utils import process_finished_session, verify_credentials

logger = logging.getLogger(__name__)

session_status = {}

router = APIRouter(
    prefix="/api/streaming",
    tags=["streaming"],
)

ALLOWED_CAMS = {"000", "001"}

@router.post("/start-recording")
def start_recording(
    x_username: str = Header(...),
    x_api_key: str = Header(...),
    db: Session = Depends(get_db),
):
    # 1. Auth
    user = verify_credentials(x_username, x_api_key, db)

    # 2. Tạo Post mới
    new_post = Post(
        user_id=user.id,
        caption=f"Multiview recording using Multiple Camera Remote at {datetime.now()}",
        is_deleted=0,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    post_id = new_post.id
    for cam in ["000", "001"]:
        os.makedirs(
            os.path.join(VIDEO_PATH, str(post_id), cam, "images", "video"),
            exist_ok=True,
        )

    return {"status": "ready", "post_id": post_id, "user": user.username}


@router.websocket("/upload/{post_id}/{cam_id}")
async def ws_upload(
    websocket: WebSocket,
    post_id: int,
    cam_id: str,
    x_username: str = Header(...),
    x_api_key: str = Header(...),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
):

    if cam_id not in ALLOWED_CAMS:
        await websocket.close(code=1008)
        logger.warning(f"[WS] Reject cam_id={cam_id}")
        return

    await websocket.accept()
    if post_id not in session_status:
        session_status[post_id] = {}
    session_status[post_id][cam_id] = False

    user = verify_credentials(x_username, x_api_key, db)
    if not user:
        await websocket.close()
        return

    save_dir = os.path.join(VIDEO_PATH, str(post_id), cam_id, "images", "video")
    os.makedirs(save_dir, exist_ok=True)
    logger.info(f"[WS] Camera {cam_id} connected → folder created: {save_dir}")

    frame_count = 0
    try:
        while True:
            data = await websocket.receive_text()

            # Log ra console cho chắc
            logger.info(f"[WS] post={post_id}, cam={cam_id}, len={len(data)}")

            if data == "STOP_RECORDING":
                await websocket.close()
                break

            os.makedirs(save_dir, exist_ok=True)
            if not os.path.exists(save_dir):
                logger.error(f"[WS] Không thể tạo thư mục: {save_dir}")
                await websocket.close()
                return

            try:
                img_bytes = base64.b64decode(data)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is None:
                    continue
                if img is not None:
                    filename = os.path.join(save_dir, f"{frame_count:06d}.jpg")
                    cv2.imwrite(filename, img)
                    frame_count += 1
            except Exception as e:
                logger.error(f"[Post {post_id}] {cam_id} error: {str(e)}")

    except WebSocketDisconnect:
        logger.info(f"[Post {post_id}] {cam_id} disconnected.")

    finally:
        if post_id in session_status:
            session_status[post_id][cam_id] = True
            logger.info(f"[WS] Post {post_id} {cam_id} finished recording. Session status: {session_status[post_id]}")
            if all(session_status[post_id].values()):
                threading.Thread(
                    target=process_finished_session,
                    args=(post_id, session_status, background_tasks),
                    daemon=True,
                ).start()
