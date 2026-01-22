import random
import re
import string

from unidecode import unidecode


def generate_username(name: str):
    clean_name = unidecode(name).lower()
    clean_name = re.sub(r"[^a-z0-9_]", "", clean_name)

    base_username = "-".join(clean_name.split())

    random_str = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))

    return f"{base_username}_{random_str}"
