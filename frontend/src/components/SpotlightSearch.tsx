import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Film, Tv, Loader2, Trophy, Radio } from 'lucide-react';
import { searchMedia, fetchSportsMatches, MediaMeta, SportsMatch } from '../lib/api';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaMeta[]>([]);
  const [sportResults, setSportResults] = useState<SportsMatch[]>([]);
  const [allSports, setAllSports] = useState<SportsMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-load sports matches for instant high-speed matching
  useEffect(() => {
    fetchSportsMatches().then((data) => setAllSports(data)).catch(() => {});
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSportResults([]);
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

  // 350ms Debounced Search across Movies, TV Shows, and Live Sports
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setSportResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Search sports matches locally in memory
    const matchedSports = allSports.filter((m) => {
      const title = (m.title || '').toLowerCase();
      const home = (m.home || '').toLowerCase();
      const away = (m.away || '').toLowerCase();
      const league = (m.league || '').toLowerCase();
      const sport = (m.sport || m.category || '').toLowerCase();
      return title.includes(q) || home.includes(q) || away.includes(q) || league.includes(q) || sport.includes(q);
    });
    setSportResults(matchedSports.slice(0, 8));

    const timer = setTimeout(async () => {
      try {
        const data = await searchMedia(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, allSports]);

  if (!isOpen) return null;

  const handleSelectMedia = (item: MediaMeta) => {
    onClose();
    window.location.hash = `#/details/${item.type || 'movie'}/${item.id || item.imdb_id}`;
  };

  const handleSelectSport = (match: SportsMatch) => {
    onClose();
    window.location.hash = `#/sports/watch/${match.id}`;
  };

  const hasResults = results.length > 0 || sportResults.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Spotlight Modal */}
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-950/90 shadow-2xl shadow-black/90 border border-white/15 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, teams, or sports events..."
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
          {query.trim() && !loading && !hasResults && (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No movies, shows, or sports matches found for "{query}".
            </div>
          )}

          {/* Sports Matches Category */}
          {sportResults.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#C5F36A] font-bold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Live Sports & Matches ({sportResults.length})</span>
              </div>
              {sportResults.map((match) => (
                <div
                  key={match.id}
                  onClick={() => handleSelectSport(match)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center p-1.5">
                    {match.home_logo ? (
                      <img src={match.home_logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Trophy className="w-5 h-5 text-[#C5F36A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-zinc-100 font-semibold text-sm truncate group-hover:text-[#C5F36A] transition-colors">
                        {match.home && match.away ? `${match.home} vs ${match.away}` : match.title}
                      </h4>
                      {match.status === 'live' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 animate-pulse" />
                          <span>LIVE</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-white/10 text-zinc-400">
                          SPORT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      {match.league || match.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Movies & Series Results */}
          {results.length > 0 && (
            <div className="py-2">
              {sportResults.length > 0 && (
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>Movies & Series ({results.length})</span>
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
                    onClick={() => handleSelectMedia(item)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    {/* Poster */}
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
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
