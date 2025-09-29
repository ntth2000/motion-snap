from fastapi import FastAPI

import database, models
from src.auth import router as auth_router
from src.users import router as user_router

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.include_router(auth_router.router)
app.include_router(user_router.router)