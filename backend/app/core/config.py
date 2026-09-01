import os
import json
import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


def _resolve_database_url() -> str:
    """
    Return DATABASE_URL from environment.
    - Production: requires DATABASE_URL to be set (PostgreSQL).
    - Development/demo: falls back to local SQLite when DATABASE_URL is unset.
    """
    env_url = os.getenv("DATABASE_URL", "")
    environment = os.getenv("ENVIRONMENT", "development")

    if env_url:
        return env_url

    # No DATABASE_URL set — only allowed in development/demo
    if environment in ("production", "staging"):
        raise RuntimeError(
            "DATABASE_URL environment variable is required in production. "
            "Set it to your PostgreSQL connection string (e.g. Neon)."
        )

    # Development/demo fallback to local SQLite
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prflow_dev.db")
    url = f"sqlite:///{db_path}"
    logger.info(f"No DATABASE_URL set. Using SQLite: {db_path}")
    return url


class Settings(BaseSettings):
    PROJECT_NAME: str = "PRFlow AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database — resolved from DATABASE_URL env var
    DATABASE_URL: str = _resolve_database_url()

    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # AI Config
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Email (Resend)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")
    SENDER_NAME: str = os.getenv("SENDER_NAME", "PRFlow AI")

    # CORS — parse JSON array from env
    @property
    def CORS_ORIGINS(self) -> list[str]:
        raw = os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:3000"]

    class Config:
        case_sensitive = True


settings = Settings()
