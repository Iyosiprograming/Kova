export interface MediaMeta {
  id: string;
  imdb_id?: string;
  name: string;
  title?: string;
  type: 'movie' | 'series';
  poster?: string;
  background?: string;
  year?: string | number;
  releaseInfo?: string;
  imdbRating?: string | number;
  rating?: string | number | null;
  description?: string;
  genres?: string[];
  genre?: string[];
  cast?: string[];
  director?: string[];
  runtime?: string;
  videos?: EpisodeMeta[];
}

export interface EpisodeMeta {
  id: string;
  title?: string;
  name?: string;
  season: number;
  number: number;
  episode?: number;
  overview?: string;
  description?: string;
  thumbnail?: string;
  released?: string;
  firstAired?: string;
}

export interface WatchlistItem {
  imdb_id: string;
  media_type: 'movie' | 'series';
  title: string;
  poster?: string | null;
  rating?: number | null;
  added_at?: string;
}

export interface WatchHistoryItem {
  imdb_id: string;
  media_type: 'movie' | 'series';
  title: string;
  poster?: string | null;
  season?: number | null;
  episode?: number | null;
  updated_at?: string;
}

export interface SportsMatch {
  id: string;
  title: string;
  sport: string;
  league: string;
  category?: string;
  category_slug?: string;
  home?: string;
  away?: string;
  home_logo?: string | null;
  away_logo?: string | null;
  start?: number | string;
  end?: number | string;
  status: 'live' | 'upcoming' | 'finished' | string;
  online_streams?: number;
  streams_count?: number;
  embed_url?: string;
}

export interface StreamSource {
  name?: string;
  source?: string;
  embed_url: string;
  online: boolean | number;
  language?: string;
  quality?: string;
}

export interface MatchStreamsResponse {
  match_id: string;
  auto_embed_url: string;
  streams: StreamSource[];
  count: number;
}

const API_BASE = '/api';

export async function fetchCatalog(
  mediaType: 'movie' | 'series',
  sort: 'top' | 'imdbRating' = 'top',
  genre?: string,
  skip: number = 0
): Promise<MediaMeta[]> {
  const params = new URLSearchParams();
  params.set('sort', sort);
  if (genre && genre !== 'All') {
    params.set('genre', genre);
  }
  if (skip > 0) {
    params.set('skip', skip.toString());
  }

  const res = await fetch(`${API_BASE}/catalog/${mediaType}?${params.toString()}`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.statusText}`);
  const data = await res.json();
  return data.metas || [];
}

export async function fetchMeta(mediaType: 'movie' | 'series', imdbId: string): Promise<MediaMeta | null> {
  const res = await fetch(`${API_BASE}/meta/${mediaType}/${imdbId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.meta || null;
}

export async function searchMedia(query: string): Promise<MediaMeta[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function fetchSportsMatches(): Promise<SportsMatch[]> {
  const res = await fetch(`${API_BASE}/sports/matches`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.matches || [];
}

export async function fetchMatchStreams(matchId: string): Promise<MatchStreamsResponse> {
  const res = await fetch(`${API_BASE}/sports/matches/${matchId}/streams`);
  if (!res.ok) {
    return {
      match_id: matchId,
      auto_embed_url: `https://embedse.com/m/${matchId}`,
      streams: [],
      count: 0,
    };
  }
  return await res.json();
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch(`${API_BASE}/watchlist`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function checkWatchlist(imdbId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/watchlist/check/${imdbId}`);
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.in_watchlist;
}

export async function addToWatchlist(item: WatchlistItem): Promise<void> {
  await fetch(`${API_BASE}/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export async function removeFromWatchlist(imdbId: string): Promise<void> {
  await fetch(`${API_BASE}/watchlist/${imdbId}`, {
    method: 'DELETE',
  });
}

export async function fetchWatchHistory(): Promise<WatchHistoryItem[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function saveWatchHistory(item: WatchHistoryItem): Promise<void> {
  await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export async function removeFromWatchHistory(imdbId: string): Promise<void> {
  await fetch(`${API_BASE}/history/${imdbId}`, {
    method: 'DELETE',
  });
}
