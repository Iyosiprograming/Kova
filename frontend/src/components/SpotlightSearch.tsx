import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Film, Tv, Loader2 } from 'lucide-react';
import { searchMedia, MediaMeta } from '../lib/api';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Cmd+K / Ctrl+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 350ms Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchMedia(query.trim());
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item: MediaMeta) => {
    onClose();
    window.location.hash = `#/details/${item.type || 'movie'}/${item.id || item.imdb_id}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Spotlight Modal */}
      <div className="w-full max-w-2xl rounded-2xl glass-panel bg-zinc-950/80 shadow-2xl shadow-black/80 border border-white/10 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, shows, or sports... (type anything)"
            className="w-full bg-transparent text-white placeholder-zinc-500 text-base focus:outline-none"
          />
          {loading && <Loader2 className="w-5 h-5 text-[#C5F36A] animate-spin flex-shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-white/5">
          {query.trim() && !loading && results.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No results found for "{query}".
            </div>
          )}

          {results.map((item) => {
            const id = item.id || item.imdb_id;
            const title = item.name || item.title;
            const mediaType = item.type || 'movie';
            const year = item.year || item.releaseInfo;
            const rating = item.imdbRating;

            return (
              <div
                key={id}
                onClick={() => handleSelect(item)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                {/* Poster Thumbnail */}
                <div className="w-12 h-16 rounded-md bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/10">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      {mediaType === 'series' ? <Tv className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-zinc-100 font-medium text-sm truncate group-hover:text-[#C5F36A] transition-colors">
                      {title}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
                      {mediaType === 'series' ? 'TV' : 'MOVIE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400 font-mono">
                    {year && <span>{year}</span>}
                    {rating && (
                      <span className="flex items-center gap-1 text-[#C5F36A]">
                        <Star className="w-3 h-3 fill-current" />
                        {rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
