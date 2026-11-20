import sys
import time
from pathlib import Path
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from backend.db import (
    init_db,
    get_watchlist,
    add_to_watchlist,
    remove_from_watchlist,
    is_in_watchlist,
    get_watch_history,
    save_watch_history,
    delete_history_item,
)
from backend.cache import (
    memory_cache,
    TTL_CATALOG,
    TTL_META,
    TTL_SPORTS,
)
from backend.services.cinemeta import (
    fetch_catalog,
    fetch_meta,
    search_media,
)
from backend.services.embedse import (
    fetch_matches,
    fetch_match_streams,
)


# ---------------------------------------------------------
# Path Resolution (PyInstaller Safe)
# ---------------------------------------------------------
def get_frontend_dist_path() -> Path:
    """
    Resolve path to the built frontend dist/ directory.
    - If bundled in PyInstaller (.exe), sys._MEIPASS holds extracted resources.
    - If running in development, check frontend/dist or root dist/.
    """
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / "dist"
    
    # Dev: check frontend/dist first, then root dist
    dev_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if dev_path.exists():
        return dev_path
    
    root_dist = Path(__file__).resolve().parent.parent / "dist"
    return root_dist


# ---------------------------------------------------------
# Lifespan Context Manager
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on startup
    init_db()
    yield
    # Cleanup on shutdown if needed
    memory_cache.clear()


app = FastAPI(
    title="Kova Desktop Streaming API",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------
# CORS Middleware (Allows Vite dev server on localhost:5173)
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Heartbeat / Auto-shutdown tracking
# ---------------------------------------------------------
LAST_HEARTBEAT: float = time.time()
HEARTBEAT_RECEIVED: bool = False

@app.post("/api/heartbeat")
def receive_heartbeat():
    global LAST_HEARTBEAT, HEARTBEAT_RECEIVED
    LAST_HEARTBEAT = time.time()
    HEARTBEAT_RECEIVED = True
    return {"status": "ok"}


# ---------------------------------------------------------
# Pydantic Request Models
# ---------------------------------------------------------
class WatchlistItem(BaseModel):
    imdb_id: str = Field(..., description="IMDb ID (e.g. tt1375666)")
    media_type: str = Field(..., description="'movie' or 'series'")
    title: str = Field(..., description="Title of the movie or show")
    poster: Optional[str] = Field(None, description="Poster image URL")
    rating: Optional[float] = Field(None, description="IMDb rating")


class WatchHistoryItem(BaseModel):
    imdb_id: str = Field(..., description="IMDb ID")
    media_type: str = Field(..., description="'movie' or 'series'")
    title: str = Field(..., description="Title")
    poster: Optional[str] = Field(None, description="Poster image URL")
    season: Optional[int] = Field(None, description="Last watched season (TV)")
    episode: Optional[int] = Field(None, description="Last watched episode (TV)")


# ---------------------------------------------------------
# Cinemeta Routes (Catalog, Meta, Search)
# ---------------------------------------------------------
@app.get("/api/catalog/{media_type}")
async def get_catalog(
    media_type: str,
    sort: str = Query("top", pattern="^(top|imdbRating)$"),
    genre: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
):
    """
    Fetch trending or top-rated movies/series with optional genre filter & pagination.
    Cached in RAM for 15 minutes.
    """
    if media_type not in ("movie", "series"):
        raise HTTPException(status_code=400, detail="Invalid media_type. Must be 'movie' or 'series'.")

    cache_key = f"catalog:{media_type}:{sort}:{genre or 'all'}:{skip}"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return {"source": "cache", "metas": cached}

    metas = await fetch_catalog(media_type, sort=sort, genre=genre, skip=skip)
    memory_cache.set(cache_key, metas, ttl=TTL_CATALOG)
    return {"source": "live", "metas": metas}


@app.get("/api/meta/{media_type}/{imdb_id}")
async def get_meta(media_type: str, imdb_id: str):
    """
    Fetch full movie/show metadata, episodes, and cast.
    Cached in RAM for 30 minutes.
    """
    if media_type not in ("movie", "series"):
        raise HTTPException(status_code=400, detail="Invalid media_type. Must be 'movie' or 'series'.")

    cache_key = f"meta:{media_type}:{imdb_id}"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return {"source": "cache", "meta": cached}

    meta = await fetch_meta(media_type, imdb_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Media metadata not found.")

    memory_cache.set(cache_key, meta, ttl=TTL_META)
    return {"source": "live", "meta": meta}


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1)):
    """
    Parallel movie and series search with weighted ranking.
    Returns top 24 results.
    """
    results = await search_media(query=q, limit=24)
    return {"query": q, "count": len(results), "results": results}


# ---------------------------------------------------------
# Sports Routes (EmbedSE)
# ---------------------------------------------------------
@app.get("/api/sports/matches")
async def get_sports_matches():
    """
    Fetch live and upcoming sports matches ranked by status, streams, and league.
    Cached in RAM for 60 seconds.
    """
    cache_key = "sports:matches"
    cached = memory_cache.get(cache_key)
    if cached is not None:
        return {"source": "cache", "count": len(cached), "matches": cached}

    matches = await fetch_matches()
    memory_cache.set(cache_key, matches, ttl=TTL_SPORTS)
    return {"source": "live", "count": len(matches), "matches": matches}


@app.get("/api/sports/matches/{match_id}/streams")
async def get_sports_streams(match_id: str):
    """
    Fetch fresh stream servers for a match (no cache).
    """
    data = await fetch_match_streams(match_id)
    return data


# ---------------------------------------------------------
# Watchlist Routes (SQLite)
# ---------------------------------------------------------
@app.get("/api/watchlist")
async def list_watchlist():
    items = get_watchlist()
    return {"count": len(items), "items": items}


@app.get("/api/watchlist/check/{imdb_id}")
async def check_watchlist(imdb_id: str):
    return {"imdb_id": imdb_id, "in_watchlist": is_in_watchlist(imdb_id)}


@app.post("/api/watchlist", status_code=status.HTTP_201_CREATED)
async def create_watchlist_item(item: WatchlistItem):
    saved = add_to_watchlist(
        imdb_id=item.imdb_id,
        media_type=item.media_type,
        title=item.title,
        poster=item.poster,
        rating=item.rating,
    )
    return {"message": "Added to watchlist", "item": saved}


@app.delete("/api/watchlist/{imdb_id}")
async def delete_watchlist_item(imdb_id: str):
    success = remove_from_watchlist(imdb_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in watchlist.")
    return {"message": "Removed from watchlist", "imdb_id": imdb_id}


# ---------------------------------------------------------
# Watch History Routes (SQLite)
# ---------------------------------------------------------
@app.get("/api/history")
async def list_history():
    items = get_watch_history()
    return {"count": len(items), "items": items}


@app.post("/api/history")
async def create_history_item(item: WatchHistoryItem):
    saved = save_watch_history(
        imdb_id=item.imdb_id,
        media_type=item.media_type,
        title=item.title,
        poster=item.poster,
        season=item.season,
        episode=item.episode,
    )
    return {"message": "History updated", "item": saved}


@app.delete("/api/history/{imdb_id}")
async def remove_history_item(imdb_id: str):
    success = delete_history_item(imdb_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in history.")
    return {"message": "History item removed", "imdb_id": imdb_id}


# ---------------------------------------------------------
# Static Frontend Serving (SPA Fallback)
# ---------------------------------------------------------
dist_path = get_frontend_dist_path()

if dist_path.exists() and (dist_path / "index.html").exists():
    # Mount assets directory
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # Mount banners directory if present
    banners_path = dist_path / "banners"
    if banners_path.exists():
        app.mount("/banners", StaticFiles(directory=str(banners_path)), name="banners")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes to pass through or return 404 if not found
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = dist_path / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        
        return FileResponse(str(dist_path / "index.html"))
else:
    @app.get("/")
    async def index_placeholder():
        return {
            "name": "Kova Desktop API",
            "status": "ready",
            "message": "Frontend dist not found. Run Vite dev server or build frontend.",
        }
