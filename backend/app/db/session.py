from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

_url = settings.DATABASE_URL

if _url.startswith("sqlite"):
    # ── SQLite (development only) ────────────────────────────────────
    engine = create_engine(
        _url,
        connect_args={"check_same_thread": False},
    )
else:
    # ── PostgreSQL / Neon ────────────────────────────────────────────
    # Neon's pooler (pgbouncer) runs in transaction mode and does NOT
    # support prepared statements.  We disable them at the connection
    # level so psycopg2 works reliably behind the pooler.
    engine = create_engine(
        _url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
        pool_recycle=300,
    )

    @event.listens_for(engine, "connect")
    def _set_pg_defaults(dbapi_conn, connection_record):
        """Disable prepared statements for pgbouncer compatibility."""
        cursor = dbapi_conn.cursor()
        cursor.execute("SET default_transaction_isolation = 'read committed'")
        cursor.execute("SET statement_timeout = '30s'")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
