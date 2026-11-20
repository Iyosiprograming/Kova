import asyncio
import httpx
from typing import List, Dict, Any, Optional

EMBEDSE_BASE_URL = "https://api.embedse.com/v1"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

LEAGUE_PRIORITY: Dict[str, int] = {
    "champions-league": 100,
    "uefa-champions-league": 100,
    "premier-league": 95,
    "english-premier-league": 95,
    "la-liga": 85,
    "laliga": 85,
    "serie-a": 80,
    "ufc": 75,
    "mma": 75,
    "boxing": 70,
    "nba": 70,
    "nfl": 65,
    "f1": 55,
    "formula-1": 55,
    "formula 1": 55,
    "tennis": 45,
    "atp": 45,
    "wta": 45,
    "golf": 30,
    "pga": 30,
}


def get_league_weight(match: Dict[str, Any]) -> int:
    """
    Match league priority based on category_slug, league name, sport, or title.
    """
    candidates = [
        str(match.get("category_slug") or "").lower(),
        str(match.get("league") or "").lower().replace(" ", "-"),
        str(match.get("category") or "").lower().replace(" ", "-"),
        str(match.get("sport") or "").lower(),
        str(match.get("title") or "").lower(),
    ]

    for key, weight in LEAGUE_PRIORITY.items():
        for candidate in candidates:
            if key in candidate:
                return weight
    return 0


def calculate_match_score(match: Dict[str, Any]) -> float:
    """
    Weighted priority:
    - status == 'live' (+200)
    - online_streams > 0 (+50)
    - League priority (0 to 100)
    """
    score = 0.0

    status = str(match.get("status") or "").lower()
    if status == "live":
        score += 200.0

    online_streams = match.get("online_streams") or 0
    try:
        if int(online_streams) > 0:
            score += 50.0
    except (ValueError, TypeError):
        pass

    score += get_league_weight(match)
    return score


async def fetch_matches() -> List[Dict[str, Any]]:
    """
    Fetch matches from EmbedSE.
    Combines /v1/matches?embeddable=1 and /v1/matches to capture both live embeddable
    streams and scheduled upcoming matches with countdowns.
    Sorts descending using weighted priority.
    """
    url_embeddable = f"{EMBEDSE_BASE_URL}/matches?embeddable=1"
    url_all = f"{EMBEDSE_BASE_URL}/matches"

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=HEADERS) as client:
        results = await asyncio.gather(
            client.get(url_embeddable),
            client.get(url_all),
            return_exceptions=True
        )

    all_matches: List[Dict[str, Any]] = []
    for res in results:
        if isinstance(res, httpx.Response) and res.status_code == 200:
            try:
                data = res.json()
                matches = data.get("matches", [])
                if isinstance(matches, list):
                    all_matches.extend(matches)
            except Exception:
                pass

    # Deduplicate by match id
    seen_ids = set()
    deduped: List[Dict[str, Any]] = []
    for m in all_matches:
        mid = m.get("id")
        if mid and mid not in seen_ids:
            seen_ids.add(mid)
            deduped.append(m)

    # Sort descending by weighted priority
    deduped.sort(key=calculate_match_score, reverse=True)
    return deduped


async def fetch_match_streams(match_id: str) -> Dict[str, Any]:
    """
    Fetch fresh stream servers for a specific match directly from EmbedSE (no cache).
    Also includes the Auto fallback embed URL (https://embedse.com/m/{id}).
    """
    url = f"{EMBEDSE_BASE_URL}/matches/{match_id}/streams"
    auto_url = f"https://embedse.com/m/{match_id}"

    streams_data: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=HEADERS) as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                streams_data = data.get("streams", [])
        except Exception:
            pass

    return {
        "match_id": match_id,
        "auto_embed_url": auto_url,
        "streams": streams_data,
        "count": len(streams_data),
    }
