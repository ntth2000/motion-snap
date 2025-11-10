from fastapi import FastAPI
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

app.include_router(auth_router.router)
app.include_router(video_router.router)

if (not os.path.exists(VIDEO_PATH)):
    os.makedirs(VIDEO_PATH)
if (not os.path.exists(RESULT_PATH)):
    os.makedirs(RESULT_PATH)

app.mount("/storage/inputs", StaticFiles(directory=VIDEO_PATH), name="inputs")
app.mount("/storage/outputs", StaticFiles(directory=RESULT_PATH), name="outputs")