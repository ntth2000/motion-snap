from sqlalchemy.orm import Session

from src.auth.exceptions import UserNotFound
from src.users.models import User, UserRole


def get_user(username: str, db: Session):
    print(username)
    print(db.query(User))
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise UserNotFound()

    return user
