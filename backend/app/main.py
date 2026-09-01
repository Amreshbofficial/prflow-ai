import os
import logging
from dotenv import load_dotenv

# Load .env file from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1 import auth, leads, outreach, followups, analytics, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Only auto-create tables in development/demo mode
if settings.ENVIRONMENT in ("development", "demo"):
    from app.db.session import engine, Base
    Base.metadata.create_all(bind=engine)
    logger.info("Development mode: tables created automatically")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(leads.router, prefix=f"{settings.API_V1_STR}/leads", tags=["leads"])
app.include_router(outreach.router, prefix=f"{settings.API_V1_STR}/outreach", tags=["outreach"])
app.include_router(followups.router, prefix=f"{settings.API_V1_STR}/followups", tags=["followups"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler to prevent stack trace leakage."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )


@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {"status": "ok", "version": settings.VERSION, "environment": settings.ENVIRONMENT}
