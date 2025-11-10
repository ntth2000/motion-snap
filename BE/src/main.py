from sqlalchemy.orm import Session
from src.videos.models import Job, JobStatus
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from src import database
from src.auth import router as auth_router
from src.videos import router as video_router
from src.videos.constants import VIDEO_PATH, RESULT_PATH

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def rollback_incomplete_jobs():
    db: Session = next(get_db())
    incomplete_jobs = db.query(Job).filter(Job.status == JobStatus.DRAWING_3D).all()
    for job in incomplete_jobs:
        job.status = JobStatus.EXTRACTED_POSES
    incomplete_jobs = db.query(Job).filter(Job.status == JobStatus.EXTRACTING_POSES).all()
    for job in incomplete_jobs:
        job.status = JobStatus.UPLOADED
    db.commit()

app.include_router(auth_router.router)
app.include_router(video_router.router)

@app.middleware("http")
async def disable_cache_for_storage(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/storage/"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

if (not os.path.exists(VIDEO_PATH)):
    os.makedirs(VIDEO_PATH)
if (not os.path.exists(RESULT_PATH)):
    os.makedirs(RESULT_PATH)

app.mount("/storage/inputs", StaticFiles(directory=VIDEO_PATH), name="inputs")
app.mount("/storage/outputs", StaticFiles(directory=RESULT_PATH), name="outputs")