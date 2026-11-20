import asyncio
import httpx
from typing import List, Dict, Any, Optional

CINEMETA_BASE_URL = "https://v3-cinemeta.strem.io"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}


async def fetch_catalog(
    media_type: str,
    sort: str = "top",
    genre: Optional[str] = None,
    skip: int = 0
) -> List[Dict[str, Any]]:
    """
    Fetch catalog items from Cinemeta.
    - media_type: 'movie' or 'series'
    - sort: 'top' (trending) or 'imdbRating' (top rated)
    - genre: e.g. 'Action', 'Drama', etc.
    - skip: pagination offset (e.g. 0, 50, 100)
    """
    # Construct Stremio addon path
    parts = []
    if genre and genre.lower() != "all":
        # Format: genre=Action or genre=Action&skip=50
        genre_cap = genre.capitalize()
        if skip > 0:
            parts.append(f"genre={genre_cap}&skip={skip}")
        else:
            parts.append(f"genre={genre_cap}")
    elif skip > 0:
        parts.append(f"skip={skip}")

    if parts:
        url = f"{CINEMETA_BASE_URL}/catalog/{media_type}/{sort}/{parts[0]}.json"
    else:
        url = f"{CINEMETA_BASE_URL}/catalog/{media_type}/{sort}.json"

    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=HEADERS) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            return data.get("metas", [])
        except Exception as e:
            # Return empty list on failure rather than crashing
            return []


async def fetch_meta(media_type: str, imdb_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch full metadata for a movie or TV show, including episode details.
    """
    url = f"{CINEMETA_BASE_URL}/meta/{media_type}/{imdb_id}.json"
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=HEADERS) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            return data.get("meta")
        except Exception:
            return None


def calculate_search_score(item: Dict[str, Any], query: str) -> float:
    """
    Rank search results by:
    - Exact title match (+100)
    - Starts with query (+40)
    - Contains query (+15)
    - IMDb rating (float(imdbRating) * 10)
    - Has poster (+15)
    """
    score = 0.0
    title = str(item.get("name") or item.get("title") or "").strip().lower()
    q = query.strip().lower()

    # Title match scoring
    if title == q:
        score += 100.0
    elif title.startswith(q):
        score += 40.0
    elif q in title:
        score += 15.0

    # IMDb rating scoring
    imdb_rating = item.get("imdbRating")
    if imdb_rating:
        try:
            score += float(imdb_rating) * 10.0
        except (ValueError, TypeError):
            pass

    # Poster scoring
    if item.get("poster"):
        score += 15.0

    return score


async def search_media(query: str, limit: int = 24) -> List[Dict[str, Any]]:
    """
    Query Cinemeta movie and series search endpoints in parallel via asyncio.gather,
    deduplicate by id, and rank results using the weighted formula.
    Returns top ranked items up to limit (default 24).
    """
    q_clean = query.strip()
    if not q_clean:
        return []

    movie_url = f"{CINEMETA_BASE_URL}/catalog/movie/top/search={q_clean}.json"
    series_url = f"{CINEMETA_BASE_URL}/catalog/series/top/search={q_clean}.json"

    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=HEADERS) as client:
        results = await asyncio.gather(
            client.get(movie_url),
            client.get(series_url),
            return_exceptions=True
        )

    all_items: List[Dict[str, Any]] = []
    for res in results:
        if isinstance(res, httpx.Response) and res.status_code == 200:
            try:
                metas = res.json().get("metas", [])
                all_items.extend(metas)
            except Exception:
                pass

    # Deduplicate by id (IMDb ID)
    seen_ids = set()
    deduped_items = []
    for item in all_items:
        item_id = item.get("id") or item.get("imdb_id")
        if item_id and item_id not in seen_ids:
            seen_ids.add(item_id)
            deduped_items.append(item)

    # Rank items
    scored_items = [
        (calculate_search_score(item, q_clean), item)
        for item in deduped_items
    ]
    # Sort descending by score
    scored_items.sort(key=lambda x: x[0], reverse=True)

    # Return top `limit` items
    return [item for _, item in scored_items[:limit]]
