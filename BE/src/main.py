from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src import database
from src.auth import router as auth_router
from src.videos import router as video_router

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