import secrets

def generate_api_key() -> str:
    return "sk_" + secrets.token_urlsafe(32)

def mask_key(key: str) -> str:
    if len(key) <= 8:
        return "****************"
    return f"{key[:4]}****************{key[-4:]}"
