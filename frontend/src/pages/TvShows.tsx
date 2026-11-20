import React, { useState, useEffect } from 'react';
import { GenreBar } from '../components/GenreBar';
import { MediaCard } from '../components/MediaCard';
import { fetchCatalog, MediaMeta } from '../lib/api';
import { Flame, Star } from 'lucide-react';

export const TvShows: React.FC = () => {
  const [genre, setGenre] = useState<string>('All');
  const [sort, setSort] = useState<'top' | 'imdbRating'>('top');
  const [items, setItems] = useState<MediaMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchCatalog('series', sort, genre, 0)
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

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
      {/* Header with Title & Sort Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white">
          TV Shows
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
            No TV shows found in this genre.
          </div>
        )}
      </div>
    </div>
  );
};
