import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star } from 'lucide-react';
import { MediaRow } from '../components/MediaRow';
import {
  fetchCatalog,
  fetchWatchHistory,
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  MediaMeta,
  WatchHistoryItem,
  WatchlistItem,
} from '../lib/api';

export const Home: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<MediaMeta[]>([]);
  const [topSeries, setTopSeries] = useState<MediaMeta[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchWatchHistory(),
      fetchCatalog('movie', 'top'),
      fetchCatalog('series', 'imdbRating'),
    ])
      .then(([hist, movies, series]) => {
        if (!mounted) return;
        setHistory(hist);
        setTrendingMovies(movies);
        setTopSeries(series);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Top 5 trending items for hero banner carousel
  const heroCandidates = trendingMovies.slice(0, 5);
  const featured = heroCandidates[heroIndex] || trendingMovies[0];

  // Auto-rotate hero banner every 6.5 seconds
  useEffect(() => {
    if (heroCandidates.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroCandidates.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [heroCandidates.length]);

  // Check if current featured title is in watchlist
  useEffect(() => {
    let active = true;
    if (featured) {
      const id = featured.id || featured.imdb_id || '';
      checkWatchlist(id).then((saved) => {
        if (active) setInWatchlist(saved);
      });
    }
    return () => {
      active = false;
    };
  }, [featured]);

  const handleWatchlistToggle = async () => {
    if (!featured) return;
    const id = featured.id || featured.imdb_id || '';
    if (inWatchlist) {
      await removeFromWatchlist(id);
      setInWatchlist(false);
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
    }
  };

  return (
    <div className="w-full pb-16">
      {/* Auto-Rotating Featured Hero Banner */}
      {featured && (
        <div className="relative w-full h-[480px] sm:h-[560px] md:h-[640px] overflow-hidden -mt-3 select-none">
          {/* Backdrop Image - Vibrant with subtle natural lighting */}
          <img
            key={featured.id || heroIndex}
            src={featured.background || featured.poster}
            alt={featured.name}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-70 animate-in fade-in duration-700"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0B] via-[#090A0B]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0B] via-[#090A0B]/70 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16 max-w-3xl">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#C5F36A] text-black text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-[#C5F36A]/20">
                Trending #{heroIndex + 1}
              </span>
              {featured.imdbRating && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-mono text-[#C5F36A] font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{featured.imdbRating}</span>
                </div>
              )}
              {featured.year && (
                <span className="text-xs font-mono text-zinc-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  {featured.year}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-xl leading-none mb-3">
              {featured.name || featured.title}
            </h1>

            {/* Synopsis */}
            {featured.description && (
              <p className="text-sm sm:text-base text-zinc-200 line-clamp-3 mb-6 font-sans leading-relaxed text-shadow max-w-2xl">
                {featured.description}
              </p>
            )}

            {/* Action Buttons & Carousel Indicators */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`#/watch/${featured.type || 'movie'}/${featured.id || featured.imdb_id}`}
                className="flex items-center gap-2.5 px-8 py-3 rounded-full bg-[#C5F36A] text-black font-bold text-sm hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/25"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Now</span>
              </a>

              <button
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2 px-5 py-3 rounded-full glass-panel text-white text-sm font-medium hover:bg-white/15 transition-all border border-white/20 backdrop-blur-xl"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-[#C5F36A]" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>

              {/* Dots Indicators */}
              {heroCandidates.length > 1 && (
                <div className="flex items-center gap-2 ml-4">
                  {heroCandidates.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        heroIndex === idx ? 'w-7 bg-[#C5F36A]' : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Poster Rows */}
      <div className="max-w-7xl mx-auto">
        {/* Continue Watching (Only shown if history has items) */}
        {history.length > 0 && (
          <MediaRow
            title="Continue Watching"
            items={history}
            loading={loading}
          />
        )}

        {/* Trending Movies */}
        <MediaRow
          title="Trending Movies"
          items={trendingMovies}
          loading={loading}
        />

        {/* Top Rated Series */}
        <MediaRow
          title="Top Rated Series"
          items={topSeries}
          loading={loading}
        />
      </div>
    </div>
  );
};
