import logging

from sqlalchemy.orm import Session

from src.auth.exceptions import UserNotFound
from src.users.models import User, UserRole

logger = logging.getLogger(__name__)


def get_user(username: str, db: Session):
    logger.debug("Getting user: %s", username)
    logger.debug("Query: %s", db.query(User))
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise UserNotFound()

    return user
