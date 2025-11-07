from datetime import datetime
from src.auth.exceptions import ExistingUserException, InvalidUserInfoException, TokenExpiredException, InvalidTokenException, NotRegisteredEmail
from src.auth.utils import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from src.auth import models


def register_user(db, user):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise ExistingUserException()

    hashed_pw = hash_password(user.password)
    new_user = models.User(username=user.username, password_hash=hashed_pw, email=user.email)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def login_user(db, email, password):
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise NotRegisteredEmail()
    if not verify_password(password, user.password_hash):
        raise InvalidUserInfoException()

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})
    return { "access_token": access_token, "refresh_token": refresh_token }


def refresh_tokens(refresh_token, db):
    payload = verify_token(refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise TokenExpiredException()
    
    email = payload.get("sub")
    access_token = create_access_token({"sub": email})
    new_refresh_token = create_refresh_token({"sub": email})

    current_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == refresh_token)
    current_token.update({
        "token": new_refresh_token,
    })

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token
    }


def logout_user(db, refresh_token, response):
    payload = verify_token(refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise InvalidTokenException()
    
    db.query(models.RefreshToken).filter(models.RefreshToken.token == refresh_token).delete()
    db.commit()

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    
    return True


def get_me(db, token):
    payload = verify_token(token)
    if payload is None:
        raise InvalidTokenException()

    username = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    return user