import os
from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 60 #minutes
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY", "default_key")