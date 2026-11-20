import re
import hashlib
import asyncio
import httpx
from typing import List, Dict, Any, Optional

DADDYLIVE_EVENTS_URL = "https://daddylive.app/api/events"
DADDYLIVE_CHANNELS_URL = "https://daddylive.app/player/player6.json"
DADDYLIVE_CHANNELS_EXTRA_URL = "https://daddylive.app/player/player2.json"
EMBEDSE_MATCHES_URL = "https://api.embedse.com/v1/matches"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

# In-memory lookup tables
_DADDYLIVE_STREAMS_CACHE: Dict[str, List[Dict[str, Any]]] = {}
_DADDYLIVE_CHANNELS_CACHE: Dict[str, Dict[str, Any]] = {}
_TEAM_LOGO_CACHE: Dict[str, Optional[str]] = {}
_EMBEDSE_LOGOS_CACHE: Dict[str, str] = {}

# League / Sport Emblem Logos (CDN)
LEAGUE_LOGOS: Dict[str, str] = {
    "champions league": "https://a.espncdn.com/i/leaguelogos/soccer/500/2.png",
    "uefa": "https://a.espncdn.com/i/leaguelogos/soccer/500/2.png",
    "premier league": "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png",
    "la liga": "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png",
    "serie a": "https://a.espncdn.com/i/leaguelogos/soccer/500/12.png",
    "bundesliga": "https://a.espncdn.com/i/leaguelogos/soccer/500/10.png",
    "ligue 1": "https://a.espncdn.com/i/leaguelogos/soccer/500/9.png",
    "coppa italia": "https://a.espncdn.com/i/leaguelogos/soccer/500/393.png",
    "nba": "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
    "nfl": "https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png",
    "mlb": "https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png",
    "ufc": "https://a.espncdn.com/i/teamlogos/leagues/500/mma.png",
    "f1": "https://a.espncdn.com/i/teamlogos/leagues/500/f1.png",
    "formula 1": "https://a.espncdn.com/i/teamlogos/leagues/500/f1.png",
    "motogp": "https://a.espncdn.com/i/teamlogos/leagues/500/f1.png",
}

# Common club & team logos (Pre-seeded HD 500x500 CDN URLs)
COMMON_TEAM_LOGOS: Dict[str, str] = {
    # Premier League & Championship
    "arsenal": "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
    "chelsea": "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
    "liverpool": "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
    "manchester city": "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    "man city": "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    "manchester united": "https://a.espncdn.com/i/teamlogos/soccer/500/360.png",
    "man united": "https://a.espncdn.com/i/teamlogos/soccer/500/360.png",
    "tottenham": "https://a.espncdn.com/i/teamlogos/soccer/500/367.png",
    "tottenham hotspur": "https://a.espncdn.com/i/teamlogos/soccer/500/367.png",
    "spurs": "https://a.espncdn.com/i/teamlogos/soccer/500/367.png",
    "newcastle": "https://a.espncdn.com/i/teamlogos/soccer/500/361.png",
    "aston villa": "https://a.espncdn.com/i/teamlogos/soccer/500/362.png",
    "brighton": "https://a.espncdn.com/i/teamlogos/soccer/500/331.png",
    "west ham": "https://a.espncdn.com/i/teamlogos/soccer/500/371.png",
    "wolves": "https://a.espncdn.com/i/teamlogos/soccer/500/380.png",
    "everton": "https://a.espncdn.com/i/teamlogos/soccer/500/368.png",
    "brentford": "https://a.espncdn.com/i/teamlogos/soccer/500/337.png",
    "crystal palace": "https://a.espncdn.com/i/teamlogos/soccer/500/384.png",
    "fulham": "https://a.espncdn.com/i/teamlogos/soccer/500/370.png",
    "bournemouth": "https://a.espncdn.com/i/teamlogos/soccer/500/349.png",
    "nottingham forest": "https://a.espncdn.com/i/teamlogos/soccer/500/393.png",
    "leicester": "https://a.espncdn.com/i/teamlogos/soccer/500/375.png",
    "southampton": "https://a.espncdn.com/i/teamlogos/soccer/500/376.png",
    "ipswich": "https://a.espncdn.com/i/teamlogos/soccer/500/373.png",
    "ipswich town": "https://a.espncdn.com/i/teamlogos/soccer/500/373.png",
    "leeds": "https://a.espncdn.com/i/teamlogos/soccer/500/357.png",
    "leeds united": "https://a.espncdn.com/i/teamlogos/soccer/500/357.png",
    "sunderland": "https://a.espncdn.com/i/teamlogos/soccer/500/366.png",
    "coventry": "https://a.espncdn.com/i/teamlogos/soccer/500/390.png",
    # La Liga
    "real madrid": "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
    "barcelona": "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
    "atletico madrid": "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png",
    "atletico": "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png",
    "athletic bilbao": "https://a.espncdn.com/i/teamlogos/soccer/500/93.png",
    "bilbao": "https://a.espncdn.com/i/teamlogos/soccer/500/93.png",
    "real sociedad": "https://a.espncdn.com/i/teamlogos/soccer/500/89.png",
    "sociedad": "https://a.espncdn.com/i/teamlogos/soccer/500/89.png",
    "real betis": "https://a.espncdn.com/i/teamlogos/soccer/500/244.png",
    "betis": "https://a.espncdn.com/i/teamlogos/soccer/500/244.png",
    "sevilla": "https://a.espncdn.com/i/teamlogos/soccer/500/243.png",
    "villarreal": "https://a.espncdn.com/i/teamlogos/soccer/500/102.png",
    "valencia": "https://a.espncdn.com/i/teamlogos/soccer/500/94.png",
    "girona": "https://a.espncdn.com/i/teamlogos/soccer/500/9812.png",
    "celta vigo": "https://a.espncdn.com/i/teamlogos/soccer/500/85.png",
    "osasuna": "https://a.espncdn.com/i/teamlogos/soccer/500/97.png",
    "mallorca": "https://a.espncdn.com/i/teamlogos/soccer/500/84.png",
    "getafe": "https://a.espncdn.com/i/teamlogos/soccer/500/2922.png",
    "rayo vallecano": "https://a.espncdn.com/i/teamlogos/soccer/500/101.png",
    "espanyol": "https://a.espncdn.com/i/teamlogos/soccer/500/88.png",
    "las palmas": "https://a.espncdn.com/i/teamlogos/soccer/500/98.png",
    "alaves": "https://a.espncdn.com/i/teamlogos/soccer/500/96.png",
    "leganes": "https://a.espncdn.com/i/teamlogos/soccer/500/2849.png",
    "valladolid": "https://a.espncdn.com/i/teamlogos/soccer/500/95.png",
    # Serie A
    "juventus": "https://a.espncdn.com/i/teamlogos/soccer/500/111.png",
    "ac milan": "https://a.espncdn.com/i/teamlogos/soccer/500/103.png",
    "milan": "https://a.espncdn.com/i/teamlogos/soccer/500/103.png",
    "inter milan": "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
    "inter": "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
    "roma": "https://a.espncdn.com/i/teamlogos/soccer/500/104.png",
    "napoli": "https://a.espncdn.com/i/teamlogos/soccer/500/114.png",
    "lazio": "https://a.espncdn.com/i/teamlogos/soccer/500/112.png",
    "atalanta": "https://a.espncdn.com/i/teamlogos/soccer/500/122.png",
    "fiorentina": "https://a.espncdn.com/i/teamlogos/soccer/500/109.png",
    "bologna": "https://a.espncdn.com/i/teamlogos/soccer/500/107.png",
    "torino": "https://a.espncdn.com/i/teamlogos/soccer/500/239.png",
    "udinese": "https://a.espncdn.com/i/teamlogos/soccer/500/117.png",
    "empoli": "https://a.espncdn.com/i/teamlogos/soccer/500/2574.png",
    "pisa": "https://a.espncdn.com/i/teamlogos/soccer/500/3956.png",
    "genoa": "https://a.espncdn.com/i/teamlogos/soccer/500/3263.png",
    "cagliari": "https://a.espncdn.com/i/teamlogos/soccer/500/2740.png",
    "verona": "https://a.espncdn.com/i/teamlogos/soccer/500/118.png",
    "parma": "https://a.espncdn.com/i/teamlogos/soccer/500/115.png",
    "como": "https://a.espncdn.com/i/teamlogos/soccer/500/3268.png",
    "venezia": "https://a.espncdn.com/i/teamlogos/soccer/500/3269.png",
    "monza": "https://a.espncdn.com/i/teamlogos/soccer/500/8051.png",
    "lecce": "https://a.espncdn.com/i/teamlogos/soccer/500/3443.png",
    # Bundesliga
    "bayern munich": "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
    "bayern": "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
    "borussia dortmund": "https://a.espncdn.com/i/teamlogos/soccer/500/124.png",
    "dortmund": "https://a.espncdn.com/i/teamlogos/soccer/500/124.png",
    "borussia m'gladbach": "https://a.espncdn.com/i/teamlogos/soccer/500/268.png",
    "m'gladbach": "https://a.espncdn.com/i/teamlogos/soccer/500/268.png",
    "bayer leverkusen": "https://a.espncdn.com/i/teamlogos/soccer/500/131.png",
    "leverkusen": "https://a.espncdn.com/i/teamlogos/soccer/500/131.png",
    "rb leipzig": "https://a.espncdn.com/i/teamlogos/soccer/500/11420.png",
    "leipzig": "https://a.espncdn.com/i/teamlogos/soccer/500/11420.png",
    "eintracht frankfurt": "https://a.espncdn.com/i/teamlogos/soccer/500/125.png",
    "frankfurt": "https://a.espncdn.com/i/teamlogos/soccer/500/125.png",
    "hoffenheim": "https://a.espncdn.com/i/teamlogos/soccer/500/7911.png",
    "paderborn": "https://a.espncdn.com/i/teamlogos/soccer/500/2548.png",
    "stuttgart": "https://a.espncdn.com/i/teamlogos/soccer/500/134.png",
    "wolfsburg": "https://a.espncdn.com/i/teamlogos/soccer/500/138.png",
    # Turkish Super Lig
    "fenerbahce": "https://a.espncdn.com/i/teamlogos/soccer/500/436.png",
    "galatasaray": "https://a.espncdn.com/i/teamlogos/soccer/500/435.png",
    "besiktas": "https://a.espncdn.com/i/teamlogos/soccer/500/437.png",
    # Ligue 1
    "paris saint-germain": "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
    "psg": "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
    "marseille": "https://a.espncdn.com/i/teamlogos/soccer/500/166.png",
    "monaco": "https://a.espncdn.com/i/teamlogos/soccer/500/174.png",
    "lyon": "https://a.espncdn.com/i/teamlogos/soccer/500/167.png",
    "lille": "https://a.espncdn.com/i/teamlogos/soccer/500/165.png",
    # Other Top Clubs
    "ajax": "https://a.espncdn.com/i/teamlogos/soccer/500/139.png",
    "psv": "https://a.espncdn.com/i/teamlogos/soccer/500/148.png",
    "feyenoord": "https://a.espncdn.com/i/teamlogos/soccer/500/141.png",
    "benfica": "https://a.espncdn.com/i/teamlogos/soccer/500/1929.png",
    "porto": "https://a.espncdn.com/i/teamlogos/soccer/500/437.png",
    "sporting cp": "https://a.espncdn.com/i/teamlogos/soccer/500/503.png",
    "celtic": "https://a.espncdn.com/i/teamlogos/soccer/500/301.png",
    "rangers": "https://a.espncdn.com/i/teamlogos/soccer/500/308.png",
    # NBA
    "lakers": "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    "warriors": "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
    "celtics": "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    "bulls": "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    "heat": "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
    "bucks": "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
    "knicks": "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
    "clippers": "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
    "suns": "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
    "mavericks": "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
    "nuggets": "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
    "76ers": "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
    "nets": "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
    # NFL
    "chiefs": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    "eagles": "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
    "49ers": "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
    "cowboys": "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
    "ravens": "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
    "bills": "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
    "lions": "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
    "packers": "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
    # MLB
    "yankees": "https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png",
    "dodgers": "https://a.espncdn.com/i/teamlogos/mlb/500/lad.png",
    "red sox": "https://a.espncdn.com/i/teamlogos/mlb/500/bos.png",
    "cubs": "https://a.espncdn.com/i/teamlogos/mlb/500/chc.png",
    "astros": "https://a.espncdn.com/i/teamlogos/mlb/500/hou.png",
    "braves": "https://a.espncdn.com/i/teamlogos/mlb/500/atl.png",
    # Racing / F1
    "ferrari": "https://a.espncdn.com/i/teamlogos/racing/500/ferrari.png",
    "red bull": "https://a.espncdn.com/i/teamlogos/racing/500/redbull.png",
    "mercedes": "https://a.espncdn.com/i/teamlogos/racing/500/mercedes.png",
    "mclaren": "https://a.espncdn.com/i/teamlogos/racing/500/mclaren.png",
    "aston martin": "https://a.espncdn.com/i/teamlogos/racing/500/astonmartin.png",
    "alpine": "https://a.espncdn.com/i/teamlogos/racing/500/alpine.png",
    "williams": "https://a.espncdn.com/i/teamlogos/racing/500/williams.png",
    "sauber": "https://a.espncdn.com/i/teamlogos/racing/500/sauber.png",
    "haas": "https://a.espncdn.com/i/teamlogos/racing/500/haas.png",
}


def clean_text(text: str) -> str:
    """Strip emojis and trim extra whitespace."""
    if not text:
        return ""
    cleaned = re.sub(r"[\U00010000-\U0010ffff]", "", text, flags=re.UNICODE)
    cleaned = re.sub(r"[\u2600-\u27BF]", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


async def query_espn_logo(client: httpx.AsyncClient, team_name: str) -> Optional[str]:
    """Free official team logo search from ESPN Public API (team.logos[0].href)."""
    if not team_name or len(team_name) < 3:
        return None

    names_to_try = [team_name]
    clean_variant = re.sub(r"\b(fc|cf|fk|sk|sc|afc|calcio|1907)\b", "", team_name, flags=re.IGNORECASE).strip()
    if clean_variant and len(clean_variant) >= 3 and clean_variant.lower() != team_name.lower():
        names_to_try.append(clean_variant)

    for q in names_to_try:
        try:
            url = f"https://site.web.api.espn.com/apis/search/v2?query={q}&limit=2"
            res = await client.get(url, timeout=2.5)
            if res.status_code == 200:
                for item in res.json().get("results", []):
                    for c in item.get("contents", []):
                        img = c.get("image", {}).get("default")
                        if img and "teamlogos" in img:
                            return img
        except Exception:
            pass
    return None


async def load_embedse_logos(client: httpx.AsyncClient) -> Dict[str, str]:
    """Fetch all high-res logos from Embed API."""
    global _EMBEDSE_LOGOS_CACHE
    if _EMBEDSE_LOGOS_CACHE:
        return _EMBEDSE_LOGOS_CACHE
    try:
        res = await client.get(EMBEDSE_MATCHES_URL, timeout=4.0)
        if res.status_code == 200:
            for m in res.json().get("matches", []):
                h = str(m.get("home") or "").lower().strip()
                hl = m.get("home_logo")
                a = str(m.get("away") or "").lower().strip()
                al = m.get("away_logo")
                if h and hl:
                    _EMBEDSE_LOGOS_CACHE[h] = hl
                if a and al:
                    _EMBEDSE_LOGOS_CACHE[a] = al
    except Exception:
        pass
    return _EMBEDSE_LOGOS_CACHE


async def resolve_team_logo(client: Optional[httpx.AsyncClient], team_name: str) -> Optional[str]:
    """Check cache, static dictionary, Embed API logos, and online ESPN search."""
    global _TEAM_LOGO_CACHE, _EMBEDSE_LOGOS_CACHE
    if not team_name:
        return None

    name_lower = team_name.lower().strip()
    if name_lower in _TEAM_LOGO_CACHE:
        return _TEAM_LOGO_CACHE[name_lower]

    for key, url in COMMON_TEAM_LOGOS.items():
        if key in name_lower or name_lower in key:
            _TEAM_LOGO_CACHE[name_lower] = url
            return url

    # Check Embed API logos
    for key, url in _EMBEDSE_LOGOS_CACHE.items():
        if key in name_lower or name_lower in key:
            _TEAM_LOGO_CACHE[name_lower] = url
            return url

    # Try live ESPN query if client is active
    if client:
        logo = await query_espn_logo(client, team_name)
        _TEAM_LOGO_CACHE[name_lower] = logo
        return logo

    _TEAM_LOGO_CACHE[name_lower] = None
    return None


def resolve_league_logo(league_name: str) -> Optional[str]:
    """Find official league logo."""
    if not league_name:
        return None
    l_lower = league_name.lower().strip()
    for key, url in LEAGUE_LOGOS.items():
        if key in l_lower:
            return url
    return None


def detect_sport(category: str, event_title: str) -> str:
    """Infer sport category matching DaddyLive categories."""
    combined = f"{category} {event_title}".lower()

    if any(k in combined for k in ["motogp", "moto gp", "moto2", "moto3", "superbike"]):
        return "motogp"
    if any(k in combined for k in ["formula 1", "formula1", "f1", "grand prix", "racing", "motorsport", "practice"]):
        return "formula1"
    if any(k in combined for k in ["ufc", "mma", "bellator", "pfl"]):
        return "ufc"
    if any(k in combined for k in ["box", "wba", "wbc", "ibf", "wbo"]):
        return "boxing"
    if any(k in combined for k in ["cricket", "ipl", "t20", "odi", "bbl"]):
        return "cricket"
    if any(k in combined for k in ["nfl", "american foot", "super bowl"]):
        return "nfl"
    if any(k in combined for k in ["mlb", "baseball"]):
        return "mlb"
    if any(k in combined for k in ["nba", "basket", "euroleague"]):
        return "nba"
    if any(k in combined for k in ["tennis", "atp", "wta", "wimbledon"]):
        return "tennis"
    if any(k in combined for k in ["soccer", "foot", "fifa", "uefa", "liga", "serie a", "premier", "coppa", "fa cup", "bundesliga"]):
        return "soccer"

    return "all"


async def fetch_daddylive_events() -> List[Dict[str, Any]]:
    """
    Fetch all live events from DaddyLive (/api/events).
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

    parsed_events = []
    teams_to_resolve = set()

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
            cleaned_title = clean_text(event_title)
            league = cleaned_cat
            teams_part = cleaned_title

            if " : " in cleaned_title:
                l_part, t_part = cleaned_title.split(" : ", 1)
                league = clean_text(l_part) or league
                teams_part = t_part.strip()
            elif ": " in cleaned_title:
                l_part, t_part = cleaned_title.split(": ", 1)
                league = clean_text(l_part) or league
                teams_part = t_part.strip()

            # 1. Strip parentheses first so (Country - League) doesn't interfere with splitting
            teams_part = re.sub(r"\(.*?\)", "", teams_part).strip()

            # 2. If tournament prefix like "ACC Mens Asia Cup - Match 4 - India A vs Nepal"
            if " - " in teams_part and re.search(r"\s+(?:vs\.?|x|v|@|at)\s+", teams_part, flags=re.IGNORECASE):
                parts = teams_part.split(" - ")
                for p in reversed(parts):
                    if re.search(r"\s+(?:vs\.?|x|v|@|at)\s+", p, flags=re.IGNORECASE):
                        teams_part = p
                        break

            # 3. Multi-separator parsing: vs, x, v, @, at, or -
            split_match = re.split(r"\s+(?:vs\.?|x|v|@|at|-)\s+", teams_part, maxsplit=1, flags=re.IGNORECASE)
            if len(split_match) == 2 and split_match[0].strip() and split_match[1].strip():
                home = clean_text(split_match[0]).rstrip("(- ").strip()
                away = clean_text(split_match[1]).rstrip("(- ").strip()
            else:
                # Single session or race event (e.g. F1 Qualifying, Practice)
                home = clean_text(teams_part).rstrip("(- ").strip()
                away = ""

            sport = detect_sport(cat_name, event_title)
            hash_key = hashlib.md5(f"{event_title}_{cat_name}".encode("utf-8")).hexdigest()[:10]
            match_id = f"dl_{hash_key}"

            # Format streams
            streams = []
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

            if home:
                teams_to_resolve.add(home)
            if away:
                teams_to_resolve.add(away)

            parsed_events.append({
                "match_id": match_id,
                "event_title": event_title,
                "sport": sport,
                "league": league,
                "cleaned_cat": cleaned_cat,
                "home": home,
                "away": away,
                "time_val": time_val,
                "is_live": is_live,
                "streams": streams,
            })

    # Resolve team logos asynchronously in parallel using both Embed API and ESPN
    async with httpx.AsyncClient(timeout=4.0, follow_redirects=True, headers=HEADERS) as logo_client:
        await load_embedse_logos(logo_client)
        await asyncio.gather(*(resolve_team_logo(logo_client, t) for t in teams_to_resolve), return_exceptions=True)

    for ev in parsed_events:
        home_logo = _TEAM_LOGO_CACHE.get(ev["home"].lower().strip())
        away_logo = _TEAM_LOGO_CACHE.get(ev["away"].lower().strip()) if ev["away"] else None
        league_logo = resolve_league_logo(ev["league"])

        matches.append({
            "id": ev["match_id"],
            "title": clean_text(ev["event_title"]),
            "sport": ev["sport"].capitalize(),
            "league": ev["league"],
            "league_logo": league_logo,
            "category": ev["cleaned_cat"],
            "category_slug": ev["sport"],
            "home": ev["home"] or clean_text(ev["event_title"]),
            "away": ev["away"],  # Empty string if single event, never 'Opponent'
            "is_single_event": not bool(ev["away"]),
            "home_logo": home_logo,
            "away_logo": away_logo,
            "start": "Live" if ev["is_live"] else ev["time_val"],
            "status": "live" if ev["is_live"] else "upcoming",
            "online_streams": len(ev["streams"]),
            "streams_count": len(ev["streams"]),
            "embed_url": ev["streams"][0]["embed_url"],
            "provider": "daddylive",
            "streams": ev["streams"],
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


CHANNEL_LOGOS: Dict[str, str] = {
    "bein": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/BeIN_Sports_logo.svg/320px-BeIN_Sports_logo.svg.png",
    "sky sport": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Sky_Sports_logo_2020.svg/320px-Sky_Sports_logo_2020.svg.png",
    "espn": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png",
    "tnt": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/TNT_Sports_logo.svg/320px-TNT_Sports_logo.svg.png",
    "fox sport": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fox_Sports_logo.svg/320px-Fox_Sports_logo.svg.png",
    "fs1": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fox_Sports_logo.svg/320px-Fox_Sports_logo.svg.png",
    "fs2": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fox_Sports_logo.svg/320px-Fox_Sports_logo.svg.png",
    "nbc": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/NBC_Sports_logo_2023.svg/320px-NBC_Sports_logo_2023.svg.png",
    "cbs": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/CBS_Sports_logo.svg/320px-CBS_Sports_logo.svg.png",
    "dazn": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/DAZN_Logo_Master.svg/320px-DAZN_Logo_Master.svg.png",
    "eurosport": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Eurosport_2015_logo.svg/320px-Eurosport_2015_logo.svg.png",
    "nba tv": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/NBA_TV.svg/320px-NBA_TV.svg.png",
    "nfl": "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/NFL_Network_logo.svg/320px-NFL_Network_logo.svg.png",
    "mlb": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/MLB_Network_logo.svg/320px-MLB_Network_logo.svg.png",
    "nhl": "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/NHL_Network_2022.svg/320px-NHL_Network_2022.svg.png",
    "wwe": "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/WWE_Network_Logo.svg/320px-WWE_Network_Logo.svg.png",
    "supersport": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/SuperSport_logo.svg/320px-SuperSport_logo.svg.png",
    "astro": "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Astro_SuperSport_logo.svg/320px-Astro_SuperSport_logo.svg.png",
    "tsn": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/The_Sports_Network_Logo.svg/320px-The_Sports_Network_Logo.svg.png",
    "sportsnet": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sportsnet_logo.svg/320px-Sportsnet_logo.svg.png",
    "willow": "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Willow_TV_logo.svg/320px-Willow_TV_logo.svg.png",
    "tennis": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Tennis_Channel_logo.svg/320px-Tennis_Channel_logo.svg.png",
    "golf": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Golf_Channel_2014_logo.svg/320px-Golf_Channel_2014_logo.svg.png",
    "bbc": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/BBC.svg/320px-BBC.svg.png",
    "cnn": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/320px-CNN.svg.png",
    "hbo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png",
    "cinemax": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Cinemax_logo_2020.svg/320px-Cinemax_logo_2020.svg.png",
    "showtime": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Showtime.svg/320px-Showtime.svg.png",
    "starz": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Starz_2022.svg/320px-Starz_2022.svg.png",
}


def resolve_channel_logo(channel_name: str) -> Optional[str]:
    """Find official network logo for TV channels."""
    if not channel_name:
        return None
    name_lower = channel_name.lower().strip()
    for key, url in CHANNEL_LOGOS.items():
        if key in name_lower:
            return url
    return None


async def fetch_daddylive_channels() -> List[Dict[str, Any]]:
    """
    Fetch 24/7 Live TV channels list from DaddyLive.
    """
    global _DADDYLIVE_CHANNELS_CACHE
    channels_list: List[Dict[str, Any]] = []

    urls = [DADDYLIVE_CHANNELS_URL, DADDYLIVE_CHANNELS_EXTRA_URL]

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=HEADERS) as client:
        for u in urls:
            try:
                res = await client.get(u)
                if res.status_code == 200:
                    raw_items = res.json()
                    if isinstance(raw_items, list):
                        for item in raw_items:
                            name = clean_text(str(item.get("name") or ""))
                            if not name:
                                continue

                            streams = []
                            for k in ["url1", "url2", "url3", "url4", "iframe"]:
                                v = item.get(k)
                                if v and isinstance(v, str) and v.startswith("http"):
                                    streams.append(v)

                            if not streams:
                                continue

                            ch_id = "ch_" + hashlib.md5(name.encode("utf-8")).hexdigest()[:8]
                            if ch_id in _DADDYLIVE_CHANNELS_CACHE:
                                continue

                            name_lower = name.lower()
                            if any(k in name_lower for k in ["sport", "bein", "espn", "sky", "tnt", "fox", "nba", "nfl", "golf", "tennis", "racing", "f1"]):
                                cat = "Sports"
                            elif any(k in name_lower for k in ["news", "cnn", "bbc", "msnbc", "fox news"]):
                                cat = "News"
                            elif any(k in name_lower for k in ["hbo", "cinema", "movie", "film", "showtime", "starz"]):
                                cat = "Movies"
                            else:
                                cat = "Entertainment"

                            ch_obj = {
                                "id": ch_id,
                                "name": name,
                                "category": cat,
                                "streams": streams,
                                "embed_url": streams[0],
                                "streams_count": len(streams),
                                "logo": resolve_channel_logo(name),
                            }
                            _DADDYLIVE_CHANNELS_CACHE[ch_id] = ch_obj
                            channels_list.append(ch_obj)
            except Exception:
                pass

    return channels_list


async def get_channel_by_id(ch_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single channel by its unique ID."""
    global _DADDYLIVE_CHANNELS_CACHE
    if ch_id not in _DADDYLIVE_CHANNELS_CACHE:
        await fetch_daddylive_channels()
    return _DADDYLIVE_CHANNELS_CACHE.get(ch_id)
