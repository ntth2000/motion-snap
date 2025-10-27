from fastapi import FastAPI

from src import database
from src.auth import router as auth_router
from src.users import router as user_router
from src.videos import router as video_router

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(video_router.router)