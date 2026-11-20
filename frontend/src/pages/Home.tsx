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
  const activeHero = heroCandidates[heroIndex] || trendingMovies[0];

  // Auto-rotate hero banner smoothly every 6.5 seconds
  useEffect(() => {
    if (heroCandidates.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroCandidates.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [heroCandidates.length]);

  // Check if current active featured title is in watchlist
  useEffect(() => {
    let active = true;
    if (activeHero) {
      const id = activeHero.id || activeHero.imdb_id || '';
      checkWatchlist(id).then((saved) => {
        if (active) setInWatchlist(saved);
      });
    }
    return () => {
      active = false;
    };
  }, [activeHero]);

  const handleWatchlistToggle = async () => {
    if (!activeHero) return;
    const id = activeHero.id || activeHero.imdb_id || '';
    if (inWatchlist) {
      await removeFromWatchlist(id);
      setInWatchlist(false);
    } else {
      const item: WatchlistItem = {
        imdb_id: id,
        media_type: activeHero.type || 'movie',
        title: activeHero.name || activeHero.title || 'Unknown',
        poster: activeHero.poster || null,
        rating: activeHero.imdbRating ? Number(activeHero.imdbRating) : null,
      };
      await addToWatchlist(item);
      setInWatchlist(true);
    }
  };

  const handleRemoveHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.imdb_id !== id));
  };

  return (
    <div className="w-full pb-16 bg-[#0D0F15]">
      {/* Light & Silky-Smooth Cross-Fading Hero Banner */}
      {heroCandidates.length > 0 && (
        <div className="relative w-full h-[520px] sm:h-[600px] md:h-[660px] overflow-hidden -mt-3 select-none bg-[#0D0F15]">
          {/* Stacked Backdrop Images for Seamless 60fps Cross-Fade */}
          {heroCandidates.map((cand, idx) => {
            const isCurrent = heroIndex === idx;
            return (
              <div
                key={cand.id || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                {/* Full-Light Backdrop */}
                <img
                  src={cand.background || cand.poster}
                  alt={cand.name}
                  className="w-full h-full object-cover object-top opacity-100"
                />

                {/* Left Text Scrim Only - leaves 70% of image bright and shining */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F15]/95 via-[#0D0F15]/30 to-transparent w-full md:w-3/4" />

                {/* Bottom Edge Transition */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0D0F15] to-transparent pointer-events-none" />

                {/* Hero Content */}
                <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16 max-w-2xl">
                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#C5F36A] text-black text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-[#C5F36A]/30">
                      Trending #{idx + 1}
                    </span>
                    {cand.imdbRating && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono text-[#C5F36A] font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{cand.imdbRating}</span>
                      </div>
                    )}
                    {cand.year && (
                      <span className="text-xs font-mono text-zinc-100 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 font-semibold">
                        {cand.year}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none mb-3">
                    {cand.name || cand.title}
                  </h1>

                  {/* Synopsis */}
                  {cand.description && (
                    <p className="text-sm sm:text-base text-zinc-100 line-clamp-3 mb-6 font-sans leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-xl">
                      {cand.description}
                    </p>
                  )}

                  {/* Action Buttons & Carousel Indicators */}
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={`#/watch/${cand.type || 'movie'}/${cand.id || cand.imdb_id}`}
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
                        {heroCandidates.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => setHeroIndex(dotIdx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              heroIndex === dotIdx ? 'w-7 bg-[#C5F36A]' : 'w-2 bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Horizontal Poster Rows */}
      <div className="max-w-7xl mx-auto">
        {/* Continue Watching with 1-click Remove button */}
        {history.length > 0 && (
          <MediaRow
            title="Continue Watching"
            items={history}
            loading={loading}
            isHistory={true}
            onRemoveHistory={handleRemoveHistory}
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
