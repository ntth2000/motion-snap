from sqlalchemy.orm import Session

from .models import APIKey
from .utils import generate_api_key, get_prefix, hash_key


def get_api_key(db: Session, user_id: int):
    api_key = db.query(APIKey).filter(APIKey.user_id == user_id).first()

    if not api_key:
        return {"key": None}

    return {
        "key": f"{api_key.prefix}****************",
        "is_revoked": api_key.is_revoked,
    }


def create_api_key(db: Session, user_id: int):
    new_raw_key = generate_api_key()
    hashed_key = hash_key(new_raw_key)
    prefix = get_prefix(new_raw_key)

    current_key_record = db.query(APIKey).filter(APIKey.user_id == user_id).first()

    if current_key_record:
        current_key_record.hashed_key = hashed_key
        current_key_record.prefix = prefix
        current_key_record.is_revoked = 0
    else:
        api_key = APIKey(hashed_key=hashed_key, prefix=prefix, user_id=user_id)
        db.add(api_key)

    db.commit()

    return {"key": new_raw_key}
