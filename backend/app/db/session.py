from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    # SQLite: pool argümanları geçersiz; tek dosya, thread paylaşımı açılır.
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"check_same_thread": False},
    )
else:
    # Postgres vb.: bağlantı havuzu ayarlı.
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


if _is_sqlite:
    # WAL modu: eşzamanlı okuma + tek yazar; kalıcı diskte veri kaybı olmaz.
    # busy_timeout: yazma kilidi varken kısa süre bekle (lock hatasını azaltır).
    @event.listens_for(Engine, "connect")
    def _sqlite_pragmas(dbapi_conn, _rec):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA busy_timeout=5000")
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
