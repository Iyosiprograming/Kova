import React, { useState, useEffect } from 'react';
import { GenreBar } from '../components/GenreBar';
import { MediaCard } from '../components/MediaCard';
import { fetchCatalog, MediaMeta } from '../lib/api';
import { Flame, Star, Play, Info } from 'lucide-react';

export const Movies: React.FC = () => {
  const [genre, setGenre] = useState<string>('All');
  const [sort, setSort] = useState<'top' | 'imdbRating'>('top');
  const [items, setItems] = useState<MediaMeta[]>([]);
  const [trendingHero, setTrendingHero] = useState<MediaMeta[]>([]);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch top movies for hero banner
  useEffect(() => {
    fetchCatalog('movie', 'top').then((data) => {
      setTrendingHero(data.slice(0, 5));
    });
  }, []);

  // Auto-rotate trending banner every 6 seconds
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

  const activeHero = trendingHero[heroIndex];

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
      {/* Changing Banner of Trending Movies */}
      {activeHero && (
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[440px] rounded-3xl overflow-hidden mb-8 border border-white/10 glass-panel bg-zinc-950 select-none shadow-2xl">
          <img
            key={activeHero.id || heroIndex}
            src={activeHero.background || activeHero.poster}
            alt={activeHero.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70 animate-in fade-in duration-500"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0B] via-[#090A0B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0B] via-[#090A0B]/80 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5F36A] text-black font-mono font-bold text-xs uppercase">
                Trending #{heroIndex + 1}
              </span>
              {activeHero.imdbRating && (
                <div className="flex items-center gap-1 text-xs font-mono text-[#C5F36A] bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{activeHero.imdbRating}</span>
                </div>
              )}
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-white drop-shadow leading-tight mb-2">
              {activeHero.name || activeHero.title}
            </h2>

            {activeHero.description && (
              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4 font-sans max-w-xl">
                {activeHero.description}
              </p>
            )}

            <div className="flex items-center gap-3">
              <a
                href={`#/watch/movie/${activeHero.id || activeHero.imdb_id}`}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C5F36A] text-black font-bold text-xs sm:text-sm hover:bg-[#b5e357] transition-all shadow-lg shadow-[#C5F36A]/20"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Watch Movie</span>
              </a>

              <a
                href={`#/details/movie/${activeHero.id || activeHero.imdb_id}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-all border border-white/15"
              >
                <Info className="w-4 h-4" />
                <span>Details</span>
              </a>

              {/* Dots */}
              {trendingHero.length > 1 && (
                <div className="flex items-center gap-1.5 ml-4">
                  {trendingHero.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        heroIndex === i ? 'w-6 bg-[#C5F36A]' : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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
