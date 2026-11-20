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
      {/* Light & Vibrant Hero Banner (Cinejoy Style) */}
      {featured && (
        <div className="relative w-full h-[500px] sm:h-[580px] md:h-[650px] overflow-hidden -mt-3 select-none bg-[#090A0B]">
          {/* Full-Brightness Backdrop Image */}
          <img
            key={featured.id || heroIndex}
            src={featured.background || featured.poster}
            alt={featured.name}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-100 animate-in fade-in duration-700"
          />

          {/* Left Text Scrim Only - leaves 70% of the image totally light, bright, and vivid */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0B]/90 via-[#090A0B]/30 to-transparent w-full md:w-3/4" />

          {/* Subtle Bottom Edge Transition to seamlessly blend into rows */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#090A0B] to-transparent pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16 max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#C5F36A] text-black text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-[#C5F36A]/30">
                Trending #{heroIndex + 1}
              </span>
              {featured.imdbRating && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono text-[#C5F36A] font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{featured.imdbRating}</span>
                </div>
              )}
              {featured.year && (
                <span className="text-xs font-mono text-zinc-100 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 font-semibold">
                  {featured.year}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none mb-3">
              {featured.name || featured.title}
            </h1>

            {/* Synopsis */}
            {featured.description && (
              <p className="text-sm sm:text-base text-zinc-100 line-clamp-3 mb-6 font-sans leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-xl">
                {featured.description}
              </p>
            )}

            {/* Action Buttons & Carousel Indicators */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`#/watch/${featured.type || 'movie'}/${featured.id || featured.imdb_id}`}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#C5F36A] text-black font-bold text-sm hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/30"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Now</span>
              </a>

              <button
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-black/70 text-white text-sm font-medium hover:bg-black/90 transition-all border border-white/25 backdrop-blur-md"
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
                        heroIndex === idx ? 'w-7 bg-[#C5F36A]' : 'w-2 bg-white/40 hover:bg-white/70'
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
        {/* Continue Watching */}
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
