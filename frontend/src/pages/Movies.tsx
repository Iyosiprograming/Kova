import React, { useState, useEffect } from 'react';
import { GenreBar } from '../components/GenreBar';
import { MediaCard } from '../components/MediaCard';
import {
  fetchCatalog,
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  MediaMeta,
  WatchlistItem,
} from '../lib/api';
import { Flame, Star, Play, Plus, Check, Info } from 'lucide-react';

export const Movies: React.FC = () => {
  const [genre, setGenre] = useState<string>('All');
  const [sort, setSort] = useState<'top' | 'imdbRating'>('top');
  const [items, setItems] = useState<MediaMeta[]>([]);
  const [trendingHero, setTrendingHero] = useState<MediaMeta[]>([]);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [watchlistMap, setWatchlistMap] = useState<Record<string, boolean>>({});

  // Fetch top movies for hero banner
  useEffect(() => {
    fetchCatalog('movie', 'top').then((data) => {
      const top5 = data.slice(0, 5);
      setTrendingHero(top5);

      // Check watchlist
      top5.forEach((cand) => {
        const id = cand.id || cand.imdb_id;
        if (id) {
          checkWatchlist(id).then((saved) => {
            setWatchlistMap((prev) => ({ ...prev, [id]: saved }));
          });
        }
      });
    });
  }, []);

  // Auto-rotate trending banner smoothly every 6 seconds
  useEffect(() => {
    if (trendingHero.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % trendingHero.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [trendingHero.length]);

  // Fetch catalog according to genre & sort
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchCatalog('movie', sort, genre, 0)
      .then((data) => {
        if (mounted) setItems(data);
      })
      .catch(() => {
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [genre, sort]);

  const handleWatchlistToggle = async (item: MediaMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = item.id || item.imdb_id;
    if (!id) return;

    const currentlySaved = !!watchlistMap[id];
    if (currentlySaved) {
      await removeFromWatchlist(id);
      setWatchlistMap((prev) => ({ ...prev, [id]: false }));
    } else {
      const watchItem: WatchlistItem = {
        imdb_id: id,
        media_type: 'movie',
        title: item.name || item.title || 'Unknown',
        poster: item.poster || null,
        rating: item.imdbRating ? Number(item.imdbRating) : null,
      };
      await addToWatchlist(watchItem);
      setWatchlistMap((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 bg-[#0D0F15]">
      {/* Silky Smooth Cross-Fading Trending Movies Banner */}
      {trendingHero.length > 0 && (
        <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden mb-8 border border-white/10 bg-[#0D0F15] select-none shadow-2xl">
          {/* Stacked Slides for Smooth 60fps Cross-Fade */}
          {trendingHero.map((cand, idx) => {
            const isCurrent = heroIndex === idx;
            const candId = cand.id || cand.imdb_id || '';
            const isSaved = !!watchlistMap[candId];

            return (
              <div
                key={candId || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                {/* Full-Brightness Backdrop Image (Absolute to sit behind text) */}
                <img
                  src={cand.background || cand.poster}
                  alt={cand.name}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
                />

                {/* Left Text Scrim Only */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F15]/95 via-[#0D0F15]/40 to-transparent w-full md:w-3/4" />

                {/* Subtle Bottom Edge Transition */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0D0F15] to-transparent pointer-events-none" />

                {/* Banner Content */}
                <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-10">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full bg-[#C5F36A] text-black font-mono font-bold text-xs uppercase shadow-md shadow-[#C5F36A]/20">
                        Trending #{idx + 1}
                      </span>
                      {cand.imdbRating && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-[#C5F36A] bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 font-bold">
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

                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-tight mb-2">
                      {cand.name || cand.title}
                    </h2>

                    {cand.description && (
                      <p className="text-xs sm:text-sm text-zinc-100 line-clamp-2 mb-4 font-sans max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {cand.description}
                      </p>
                    )}

                    {/* Action Buttons: Watch + Save + Details */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Watch */}
                      <a
                        href={`#/watch/movie/${candId}`}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C5F36A] text-black font-bold text-xs sm:text-sm hover:bg-[#b5e357] transition-all shadow-lg shadow-[#C5F36A]/25"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Watch Movie</span>
                      </a>

                      {/* Save to Watchlist */}
                      <button
                        onClick={(e) => handleWatchlistToggle(cand, e)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border backdrop-blur-md ${
                          isSaved
                            ? 'bg-[#C5F36A]/20 text-[#C5F36A] border-[#C5F36A]/50 shadow-lg shadow-[#C5F36A]/10'
                            : 'bg-black/70 text-white hover:bg-black/90 border-white/25'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#C5F36A] stroke-[2.5]" />
                            <span>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Save</span>
                          </>
                        )}
                      </button>

                      {/* Details */}
                      <a
                        href={`#/details/movie/${candId}`}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-all border border-white/20"
                      >
                        <Info className="w-4 h-4" />
                        <span>Details</span>
                      </a>

                      {/* Dots */}
                      {trendingHero.length > 1 && (
                        <div className="flex items-center gap-1.5 ml-2 sm:ml-4">
                          {trendingHero.map((_, dotI) => (
                            <button
                              key={dotI}
                              onClick={() => setHeroIndex(dotI)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                heroIndex === dotI ? 'w-6 bg-[#C5F36A]' : 'w-2 bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${dotI + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header with Title & Sort Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white">
          Explore Movies
        </h1>

        {/* Sort Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full glass-panel">
          <button
            onClick={() => setSort('top')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              sort === 'top'
                ? 'bg-[#C5F36A] text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setSort('imdbRating')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              sort === 'imdbRating'
                ? 'bg-[#C5F36A] text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Top Rated</span>
          </button>
        </div>
      </div>

      {/* Glassy Genre Bar */}
      <GenreBar
        selectedGenre={genre}
        onSelectGenre={setGenre}
        itemCount={items.length}
      />

      {/* Responsive Poster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mt-6">
        {loading ? (
          Array.from({ length: 18 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] w-full rounded-xl bg-zinc-900/60 animate-pulse border border-white/5"
            />
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <MediaCard key={item.id || item.imdb_id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-sm">
            No movies found in this genre.
          </div>
        )}
      </div>
    </div>
  );
};
