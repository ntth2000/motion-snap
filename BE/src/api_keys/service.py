from sqlalchemy.orm import Session
from src.api_keys import utils, models


def get_api_key(db: Session, user_id: int):
    api_key = db.query(models.APIKey).filter(models.APIKey.user_id == user_id).first()
    if not api_key:
        return {"key": None}

    return {"key": utils.mask_key(api_key.key) }
    
def generate_api_key(db: Session, user_id: int):
    current_key = db.query(models.APIKey).filter(models.APIKey.user_id == user_id).first()
    new_key = utils.generate_api_key()

    if current_key:
        current_key.key = new_key
    else:
        api_key = models.APIKey(key=new_key, user_id=1)
        db.add(api_key)

    db.commit()
    
    return { "key": new_key }
