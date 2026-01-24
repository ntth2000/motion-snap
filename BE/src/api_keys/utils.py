import hashlib
import secrets


def generate_api_key() -> str:
    return "sk_" + secrets.token_urlsafe(32)


def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def mask_key(key: str) -> str:
    if len(key) <= 8:
        return "****************"
    return f"{key[:4]}****************{key[-4:]}"


def get_prefix(key: str) -> str:
    return key[:7]  # sk_ + 4 characters


def verify_key(raw_key, hashed_key):
    return raw_key == hashed_key