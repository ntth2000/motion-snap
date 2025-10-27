from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.params import File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src import database, models, schemas
from src.auth.service import verify_token
from src.videos.video_processor import extract_frames, draw_poses_on_frame
import os
from .schemas import VideoUpload

from pydantic import BaseModel

class DrawPosesResponse(BaseModel):
    frame_count: int
    message: str

router = APIRouter(
    prefix="/videos",
    tags=["videos"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="videos")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_video(
    video_data: VideoUpload,
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Here you would handle the upload logic, e.g., save the file, create DB entry, etc.
    return {"filename": file.filename, "description": video_data.description, "message": "Video uploaded successfully"}


@router.get("/extract", response_model=schemas.ExtractFrame)
def extract(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    video_path = 'src/videos/video.mp4'
    output_path = 'src/videos/root/images/1'
    if os.path.exists(video_path):
        frames = extract_frames(video_path, output_path)
        return {"frame_count": len(frames), "message": "Frames extracted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Video file not found")

@router.get('/draw_poses', response_model=DrawPosesResponse)
def draw_poses(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    input_dir = "src/videos/root/images/1"
    output_dir = "src/videos/root/vis/1"
    annots_dir = "src/videos/root/annots/1"

    # Tạo thư mục đầu ra
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(annots_dir, exist_ok=True)

    # Lấy danh sách file ảnh
    frame_files = sorted([
        f for f in os.listdir(input_dir)
        if f.lower().endswith((".jpg", ".png"))
    ])

    if not frame_files:
        raise HTTPException(status_code=404, detail="No frames found in input directory")

    processed_count = 0

    for frame_file in frame_files:
        frame_path = os.path.join(input_dir, frame_file)
        output_path = os.path.join(output_dir, frame_file)
        json_filename = os.path.splitext(frame_file)[0] + ".json"
        json_output_path = os.path.join(annots_dir, json_filename)

        print(f"🔹 Processing {frame_file} ...")

        draw_poses_on_frame(
            frame_path=frame_path,
            output_path=output_path,
            json_output_path=json_output_path
        )
        processed_count += 1

    return {
        "frame_count": processed_count,
        "message": f"✅ Poses drawn successfully for {processed_count} frames."
    }
