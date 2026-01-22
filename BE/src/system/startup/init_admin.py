import os

from dotenv import load_dotenv

from src.auth.utils import hash_password
from src.models import User, UserRole

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "default_email@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "default_password")


def init_admin(db):
    admin = db.query(User).filter(User.role == "ADMIN").first()
    if not admin:
        new_admin = User(
            name="Administrator",
            username="admin",
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(new_admin)
        db.commit()
