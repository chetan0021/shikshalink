import os


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        return url
    return "sqlite:///./shiksha_link.db"


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [o.strip() for o in raw.split(",") if o.strip()]
