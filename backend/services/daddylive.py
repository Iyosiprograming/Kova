import re
import hashlib
import httpx
from typing import List, Dict, Any, Optional

DADDYLIVE_EVENTS_URL = "https://daddylive.app/api/events"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

# In-memory lookup table for DaddyLive streams by generated match ID
_DADDYLIVE_STREAMS_CACHE: Dict[str, List[Dict[str, Any]]] = {}


def clean_text(text: str) -> str:
    """Strip emojis and trim extra whitespace."""
    if not text:
        return ""
    # Remove surrogate pairs and emojis
    cleaned = re.sub(r"[\U00010000-\U0010ffff]", "", text, flags=re.UNICODE)
    cleaned = re.sub(r"[\u2600-\u27BF]", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def detect_sport(category: str, event_title: str) -> str:
    """Infer sport category from category name or event title."""
    combined = f"{category} {event_title}".lower()

    if any(k in combined for k in ["soccer", "foot", "fifa", "uefa", "liga", "serie a", "premier", "coppa", "fa cup", "bundesliga", "eredivisie"]):
        return "Soccer"
    if any(k in combined for k in ["motor", "f1", "formula", "motogp", "nascar", "racing"]):
        return "Motorsport"
    if any(k in combined for k in ["basket", "nba", "euroleague"]):
        return "Basketball"
    if any(k in combined for k in ["tennis", "atp", "wta"]):
        return "Tennis"
    if any(k in combined for k in ["ufc", "mma", "box", "fight", "wwe", "combat"]):
        return "Combat"
    if any(k in combined for k in ["cricket", "ipl", "t20"]):
        return "Cricket"
    if any(k in combined for k in ["nfl", "american foot", "rugby"]):
        return "Football"
    if any(k in combined for k in ["golf", "pga"]):
        return "Golf"
    if any(k in combined for k in ["hockey", "nhl"]):
        return "Hockey"

    return "Live Events"


async def fetch_daddylive_events() -> List[Dict[str, Any]]:
    """
    Fetch all live events from DaddyLive (/api/events).
    Normalizes into unified SportsMatch format and indexes streams.
    """
    global _DADDYLIVE_STREAMS_CACHE
    matches: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=HEADERS) as client:
            res = await client.get(DADDYLIVE_EVENTS_URL)
            if res.status_code != 200:
                return []
            data = res.json()
    except Exception:
        return []

    categories = data.get("categories", {})
    if not isinstance(categories, dict):
        return []

    for cat_name, event_list in categories.items():
        if not isinstance(event_list, list):
            continue
        cleaned_cat = clean_text(cat_name) or cat_name

        for ev in event_list:
            if not isinstance(ev, dict):
                continue

            event_title = str(ev.get("event") or "").strip()
            if not event_title:
                continue

            time_val = str(ev.get("time") or "").strip()
            is_live = "live" in time_val.lower() or time_val == "" or "now" in time_val.lower()

            channels = ev.get("channels") or []
            if not isinstance(channels, list) or not channels:
                continue

            # Parse league and team names
            league = cleaned_cat
            teams_part = event_title
            if " : " in event_title:
                l_part, t_part = event_title.split(" : ", 1)
                league = clean_text(l_part) or league
                teams_part = t_part.strip()

            if " vs " in teams_part:
                home, away = teams_part.split(" vs ", 1)
            elif " - " in teams_part and not teams_part.startswith("-"):
                home, away = teams_part.split(" - ", 1)
            else:
                home = teams_part
                away = ""

            home = clean_text(home)
            away = clean_text(away)
            sport = detect_sport(cat_name, event_title)

            # Generate unique match ID
            hash_key = hashlib.md5(f"{event_title}_{cat_name}".encode("utf-8")).hexdigest()[:10]
            match_id = f"dl_{hash_key}"

            # Format individual stream channels
            streams: List[Dict[str, Any]] = []
            for i, ch in enumerate(channels):
                url = ch.get("url")
                if not url:
                    continue
                ch_name = ch.get("channel_name") or f"Link - {i+1}"
                streams.append({
                    "name": f"{ch_name} (DaddyLive)",
                    "source": "DaddyLive",
                    "embed_url": url,
                    "online": True,
                    "quality": "HD",
                })

            if not streams:
                continue

            _DADDYLIVE_STREAMS_CACHE[match_id] = streams

            matches.append({
                "id": match_id,
                "title": clean_text(event_title),
                "sport": sport,
                "league": league,
                "category": cleaned_cat,
                "category_slug": sport.lower(),
                "home": home or clean_text(event_title),
                "away": away,
                "home_logo": None,
                "away_logo": None,
                "start": "Live" if is_live else time_val,
                "status": "live" if is_live else "upcoming",
                "online_streams": len(streams),
                "streams_count": len(streams),
                "embed_url": streams[0]["embed_url"],
                "provider": "daddylive",
                "streams": streams,
            })

    return matches


async def fetch_daddylive_streams(match_id: str) -> Dict[str, Any]:
    """
    Fetch stream links for a DaddyLive match.
    """
    global _DADDYLIVE_STREAMS_CACHE

    if match_id not in _DADDYLIVE_STREAMS_CACHE:
        await fetch_daddylive_events()

    streams = _DADDYLIVE_STREAMS_CACHE.get(match_id, [])
    auto_url = streams[0]["embed_url"] if streams else "https://daddylive.app/"

    return {
        "match_id": match_id,
        "auto_embed_url": auto_url,
        "streams": streams,
        "count": len(streams),
    }
