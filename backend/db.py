import os
import sys
import sqlite3
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone


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


def get_connection() -> sqlite3.Connection:
    """
    Create a new SQLite connection with Row factory enabled.
    """
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """
    Initialize SQLite schema:
    - watchlist: saved movies & TV shows
    - watch_history: playback resume state (season/episode for TV, movie tracking)
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS watchlist (
                imdb_id TEXT PRIMARY KEY,
                media_type TEXT NOT NULL,
                title TEXT NOT NULL,
                poster TEXT,
                rating REAL,
                added_at TEXT NOT NULL
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS watch_history (
                imdb_id TEXT PRIMARY KEY,
                media_type TEXT NOT NULL,
                title TEXT NOT NULL,
                poster TEXT,
                season INTEGER,
                episode INTEGER,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


# Watchlist Operations
def get_watchlist() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT imdb_id, media_type, title, poster, rating, added_at FROM watchlist ORDER BY added_at DESC"
        )
        return [dict(row) for row in cursor.fetchall()]


def is_in_watchlist(imdb_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM watchlist WHERE imdb_id = ? LIMIT 1", (imdb_id,))
        return cursor.fetchone() is not None


def add_to_watchlist(imdb_id: str, media_type: str, title: str, poster: Optional[str] = None, rating: Optional[float] = None) -> Dict[str, Any]:
    added_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO watchlist (imdb_id, media_type, title, poster, rating, added_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(imdb_id) DO UPDATE SET
                media_type = excluded.media_type,
                title = excluded.title,
                poster = excluded.poster,
                rating = excluded.rating,
                added_at = excluded.added_at
            """,
            (imdb_id, media_type, title, poster, rating, added_at)
        )
        conn.commit()
    return {
        "imdb_id": imdb_id,
        "media_type": media_type,
        "title": title,
        "poster": poster,
        "rating": rating,
        "added_at": added_at,
    }


def remove_from_watchlist(imdb_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM watchlist WHERE imdb_id = ?", (imdb_id,))
        conn.commit()
        return cursor.rowcount > 0


# Watch History Operations
def get_watch_history() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT imdb_id, media_type, title, poster, season, episode, updated_at FROM watch_history ORDER BY updated_at DESC"
        )
        return [dict(row) for row in cursor.fetchall()]


def get_history_item(imdb_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT imdb_id, media_type, title, poster, season, episode, updated_at FROM watch_history WHERE imdb_id = ? LIMIT 1",
            (imdb_id,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def save_watch_history(
    imdb_id: str,
    media_type: str,
    title: str,
    poster: Optional[str] = None,
    season: Optional[int] = None,
    episode: Optional[int] = None
) -> Dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO watch_history (imdb_id, media_type, title, poster, season, episode, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(imdb_id) DO UPDATE SET
                media_type = excluded.media_type,
                title = excluded.title,
                poster = excluded.poster,
                season = excluded.season,
                episode = excluded.episode,
                updated_at = excluded.updated_at
            """,
            (imdb_id, media_type, title, poster, season, episode, updated_at)
        )
        conn.commit()
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
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM watch_history WHERE imdb_id = ?", (imdb_id,))
        conn.commit()
        return cursor.rowcount > 0
