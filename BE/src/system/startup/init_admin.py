import os

from dotenv import load_dotenv

from src.auth.utils import hash_password
from src.models import User, UserRole

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "default_email@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "default_password")


def init_admin(db):
    admin = db.query(User).filter(User.id == -1).first() 
    
    if not admin:
        new_admin = User(
            id=-1,
            name="Administrator",
            username="admin",
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(new_admin)
        try:
            db.commit()
            print("Admin account seeded with ID -1.")
        except Exception as e:
            db.rollback()
            print(f"Failed to seed admin: {e}")
    else:
        print("Admin with ID -1 already exists.")
