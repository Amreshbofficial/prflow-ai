import os
import json
import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


def _resolve_database_url() -> str:
    """Return DATABASE_URL, falling back to local SQLite when PostgreSQL is unreachable."""
    env_url = os.getenv("DATABASE_URL", "")
    if not env_url or env_url.startswith("sqlite"):
        # Explicit SQLite or unset → use development DB file
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prflow_dev.db")
        url = f"sqlite:///{db_path}"
        logger.info(f"Using SQLite database: {db_path}")
        return url

    # PostgreSQL configured — verify connectivity
    try:
        import psycopg2  # noqa: F401
        conn = psycopg2.connect(env_url)
        conn.close()
        logger.info("PostgreSQL connection verified.")
        return env_url
    except Exception as e:
        logger.warning(
            f"PostgreSQL unreachable ({e}). Falling back to SQLite for development."
        )
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prflow_dev.db")
        return f"sqlite:///{db_path}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "PRFlow AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database — auto-resolves to SQLite if PostgreSQL is unavailable
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
