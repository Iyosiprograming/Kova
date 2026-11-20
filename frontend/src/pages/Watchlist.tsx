import React, { useState, useEffect } from 'react';
import { Bookmark, Film, Tv } from 'lucide-react';
import { fetchWatchlist, WatchlistItem } from '../lib/api';
import { MediaCard } from '../components/MediaCard';

export const WatchlistPage: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWatchlist();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWatchlistChange = (id: string, inWatchlist: boolean) => {
    if (!inWatchlist) {
      setItems((prev) => prev.filter((item) => item.imdb_id !== id));
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.media_type === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 min-h-[70vh]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5F36A] text-black flex items-center justify-center font-bold shadow-lg shadow-[#C5F36A]/20">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white">
              My Watchlist
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Saved movies and TV shows stored locally on your device
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full glass-panel">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              filter === 'all'
                ? 'bg-[#C5F36A] text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('movie')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              filter === 'movie'
                ? 'bg-[#C5F36A] text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies</span>
          </button>
          <button
            onClick={() => setFilter('series')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              filter === 'series'
                ? 'bg-[#C5F36A] text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV Shows</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[2/3] w-full rounded-xl bg-zinc-900/60 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.imdb_id}
              item={item}
              onWatchlistChange={handleWatchlistChange}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-zinc-500 mb-4 border border-white/10">
            <Bookmark className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Your Watchlist is empty</h3>
          <p className="text-zinc-400 text-sm max-w-md mb-6">
            Click the <span className="text-[#C5F36A] font-bold">+</span> button on any movie or TV series card to save it here for later.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#/movies"
              className="px-5 py-2.5 rounded-full bg-[#C5F36A] text-black text-xs font-semibold hover:bg-[#b5e357] transition-all"
            >
              Explore Movies
            </a>
            <a
              href="#/tv"
              className="px-5 py-2.5 rounded-full glass-panel text-white text-xs font-semibold hover:bg-white/10 transition-all border border-white/15"
            >
              Explore TV Shows
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
