import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star } from 'lucide-react';
import { MediaRow } from '../components/MediaRow';
import {
  fetchCatalog,
  fetchWatchHistory,
  fetchWatchlist,
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  MediaMeta,
  WatchHistoryItem,
  WatchlistItem,
} from '../lib/api';

export const Home: React.FC = () => {
  const [featured, setFeatured] = useState<MediaMeta | null>(null);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaMeta[]>([]);
  const [topSeries, setTopSeries] = useState<MediaMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchWatchHistory(),
      fetchWatchlist(),
      fetchCatalog('movie', 'top'),
      fetchCatalog('series', 'imdbRating'),
    ])
      .then(([hist, wl, movies, series]) => {
        if (!mounted) return;
        setHistory(hist);
        setWatchlist(wl);
        setTrendingMovies(movies);
        setTopSeries(series);

        // Set top trending movie as hero featured item
        if (movies.length > 0) {
          const topItem = movies[0];
          setFeatured(topItem);
          checkWatchlist(topItem.id || topItem.imdb_id || '').then((res) => {
            if (mounted) setInWatchlist(res);
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleWatchlistToggle = async () => {
    if (!featured) return;
    const id = featured.id || featured.imdb_id || '';
    if (inWatchlist) {
      await removeFromWatchlist(id);
      setInWatchlist(false);
      setWatchlist((prev) => prev.filter((i) => i.imdb_id !== id));
    } else {
      const item: WatchlistItem = {
        imdb_id: id,
        media_type: featured.type || 'movie',
        title: featured.name || featured.title || 'Unknown',
        poster: featured.poster || null,
        rating: featured.imdbRating ? Number(featured.imdbRating) : null,
      };
      await addToWatchlist(item);
      setInWatchlist(true);
      setWatchlist((prev) => [item, ...prev]);
    }
  };

  return (
    <div className="w-full pb-16">
      {/* Featured Hero Banner */}
      {featured && (
        <div className="relative w-full h-[460px] sm:h-[540px] md:h-[620px] overflow-hidden -mt-3">
          {/* Backdrop Image */}
          <img
            src={featured.background || featured.poster}
            alt={featured.name}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-50"
          />

          {/* Dark Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0B] via-[#090A0B]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0B] via-[#090A0B]/80 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16 max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5F36A] text-black text-[11px] font-mono font-bold tracking-wider uppercase">
                Featured
              </span>
              {featured.imdbRating && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-[#C5F36A]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{featured.imdbRating}</span>
                </div>
              )}
              {featured.year && (
                <span className="text-xs font-mono text-zinc-400">{featured.year}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-md leading-none mb-3">
              {featured.name || featured.title}
            </h1>

            {/* Synopsis */}
            {featured.description && (
              <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 mb-6 font-sans leading-relaxed text-shadow">
                {featured.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <a
                href={`#/watch/${featured.type || 'movie'}/${featured.id || featured.imdb_id}`}
                className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#C5F36A] text-black font-semibold text-sm hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/20"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Now</span>
              </a>

              <button
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2 px-5 py-3 rounded-full glass-panel text-white text-sm font-medium hover:bg-white/10 transition-all border border-white/15"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-[#C5F36A]" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Poster Rows */}
      <div className="max-w-7xl mx-auto">
        {/* 1. Continue Watching */}
        {history.length > 0 && (
          <MediaRow
            title="Continue Watching"
            items={history}
            loading={loading}
          />
        )}

        {/* 2. My Watchlist */}
        {watchlist.length > 0 && (
          <MediaRow
            title="My Watchlist"
            items={watchlist}
            loading={loading}
          />
        )}

        {/* 3. Trending Movies */}
        <MediaRow
          title="Trending Movies"
          items={trendingMovies}
          loading={loading}
        />

        {/* 4. Top Rated Series */}
        <MediaRow
          title="Top Rated Series"
          items={topSeries}
          loading={loading}
        />
      </div>
    </div>
  );
};
