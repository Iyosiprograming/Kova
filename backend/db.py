import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from contextlib import contextmanager

from sqlalchemy import create_engine, String, Float, Integer, select
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    sessionmaker,
    Session,
)


# ---------------------------------------------------------
# PyInstaller Safe Path Resolution
# ---------------------------------------------------------
def get_db_path() -> Path:
    """
    Resolve path to kova.db safely:
    - When bundled with PyInstaller (frozen), store next to the .exe file.
    - In dev mode, store in the project root directory.
    """
    if getattr(sys, "frozen", False):
        base_dir = Path(sys.executable).resolve().parent
    else:
        # backend/db.py -> parent of backend is project root
        base_dir = Path(__file__).resolve().parent.parent
    return base_dir / "kova.db"


def get_sqlite_url() -> str:
    db_path = get_db_path()
    return f"sqlite:///{db_path}"


# ---------------------------------------------------------
# SQLAlchemy 2.0 Base & Models
# ---------------------------------------------------------
class Base(DeclarativeBase):
    pass


class Watchlist(Base):
    __tablename__ = "watchlist"

    imdb_id: Mapped[str] = mapped_column(String, primary_key=True)
    media_type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    poster: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    added_at: Mapped[str] = mapped_column(String, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "imdb_id": self.imdb_id,
            "media_type": self.media_type,
            "title": self.title,
            "poster": self.poster,
            "rating": self.rating,
            "added_at": self.added_at,
        }


class WatchHistory(Base):
    __tablename__ = "watch_history"

    imdb_id: Mapped[str] = mapped_column(String, primary_key=True)
    media_type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    poster: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    season: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    episode: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[str] = mapped_column(String, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "imdb_id": self.imdb_id,
            "media_type": self.media_type,
            "title": self.title,
            "poster": self.poster,
            "season": self.season,
            "episode": self.episode,
            "updated_at": self.updated_at,
        }


# ---------------------------------------------------------
# Database Engine & Session Management
# ---------------------------------------------------------
engine = create_engine(
    get_sqlite_url(),
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def init_db() -> None:
    """Create tables if they don't already exist."""
    Base.metadata.create_all(bind=engine)


@contextmanager
def get_session():
    """Provide a transactional scope around a series of operations."""
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# ---------------------------------------------------------
# Watchlist Operations (SQLAlchemy 2.0 ORM)
# ---------------------------------------------------------
def get_watchlist() -> List[Dict[str, Any]]:
    with get_session() as session:
        stmt = select(Watchlist).order_by(Watchlist.added_at.desc())
        results = session.scalars(stmt).all()
        return [item.to_dict() for item in results]


def is_in_watchlist(imdb_id: str) -> bool:
    with get_session() as session:
        stmt = select(Watchlist).where(Watchlist.imdb_id == imdb_id)
        return session.scalars(stmt).first() is not None


def add_to_watchlist(
    imdb_id: str,
    media_type: str,
    title: str,
    poster: Optional[str] = None,
    rating: Optional[float] = None,
) -> Dict[str, Any]:
    added_at = datetime.now(timezone.utc).isoformat()
    with get_session() as session:
        item = Watchlist(
            imdb_id=imdb_id,
            media_type=media_type,
            title=title,
            poster=poster,
            rating=rating,
            added_at=added_at,
        )
        session.merge(item)
    return {
        "imdb_id": imdb_id,
        "media_type": media_type,
        "title": title,
        "poster": poster,
        "rating": rating,
        "added_at": added_at,
    }


def remove_from_watchlist(imdb_id: str) -> bool:
    with get_session() as session:
        item = session.get(Watchlist, imdb_id)
        if item:
            session.delete(item)
            return True
        return False


# ---------------------------------------------------------
# Watch History Operations (SQLAlchemy 2.0 ORM)
# ---------------------------------------------------------
def get_watch_history() -> List[Dict[str, Any]]:
    with get_session() as session:
        stmt = select(WatchHistory).order_by(WatchHistory.updated_at.desc())
        results = session.scalars(stmt).all()
        return [item.to_dict() for item in results]


def get_history_item(imdb_id: str) -> Optional[Dict[str, Any]]:
    with get_session() as session:
        item = session.get(WatchHistory, imdb_id)
        return item.to_dict() if item else None


def save_watch_history(
    imdb_id: str,
    media_type: str,
    title: str,
    poster: Optional[str] = None,
    season: Optional[int] = None,
    episode: Optional[int] = None,
) -> Dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_session() as session:
        history = WatchHistory(
            imdb_id=imdb_id,
            media_type=media_type,
            title=title,
            poster=poster,
            season=season,
            episode=episode,
            updated_at=updated_at,
        )
        session.merge(history)
    return {
        "imdb_id": imdb_id,
        "media_type": media_type,
        "title": title,
        "poster": poster,
        "season": season,
        "episode": episode,
        "updated_at": updated_at,
    }


def delete_history_item(imdb_id: str) -> bool:
    with get_session() as session:
        item = session.get(WatchHistory, imdb_id)
        if item:
            session.delete(item)
            return True
        return False
