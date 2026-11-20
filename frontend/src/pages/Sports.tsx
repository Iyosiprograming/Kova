import React, { useState, useEffect } from 'react';
import { Calendar, Play } from 'lucide-react';
import { SportsDock, SportCategory } from '../components/SportsDock';
import { SportsHero } from '../components/SportsHero';
import { fetchSportsMatches, SportsMatch } from '../lib/api';

function formatCountdown(startTime: number | string | undefined): string {
  if (!startTime) return 'Upcoming';
  const startMs = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime * 1000;
  const diff = startMs - Date.now();

  if (diff <= 0) return 'Starting soon';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `Starts in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes}m`;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const Sports: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<SportCategory>('all');
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'daddylive' | 'embedse'>('all');
  const [matches, setMatches] = useState<SportsMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchSportsMatches();
      setMatches(data);
    } catch {
      // Keep existing matches on background poll error
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    loadMatches(false);

    // Silent 60-second polling (skips if tab hidden)
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadMatches(true);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Filter matches based on selected category and provider
  const filteredMatches = React.useMemo(() => {
    return matches.filter((m) => {
      // Provider filter
      if (selectedProvider === 'daddylive' && m.provider !== 'daddylive') return false;
      if (selectedProvider === 'embedse' && m.provider === 'daddylive') return false;

      // Sport category filter
      if (selectedSport === 'all') return true;
      const s = (m.sport || m.category || m.category_slug || '').toLowerCase();
      if (selectedSport === 'soccer') {
        return (
          s.includes('foot') ||
          s.includes('socc') ||
          s.includes('liga') ||
          s.includes('serie') ||
          s.includes('premier') ||
          s.includes('coppa') ||
          s.includes('bundes')
        );
      }
      if (selectedSport === 'combat') {
        return (
          s.includes('ufc') ||
          s.includes('mma') ||
          s.includes('box') ||
          s.includes('fight') ||
          s.includes('combat')
        );
      }
      if (selectedSport === 'basketball') {
        return s.includes('basket') || s.includes('nba') || s.includes('euroleague');
      }
      if (selectedSport === 'tennis') return s.includes('tennis') || s.includes('atp') || s.includes('wta');
      if (selectedSport === 'golf') return s.includes('golf') || s.includes('pga');
      return true;
    });
  }, [matches, selectedSport, selectedProvider]);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
      {/* Icon-Only Tactical Sports Dock */}
      <SportsDock
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
      />

      {/* Auto-Rotating Hero Banner */}
      {matches.length > 0 && (
        <SportsHero matches={matches} selectedSport={selectedSport} />
      )}

      {/* Match Cards Header & Provider Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-10 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
            {selectedSport === 'all' ? 'All Live & Scheduled Matches' : `${selectedSport} Matches`}
          </h2>
          <span className="font-mono text-xs text-zinc-400">
            <span className="text-[#C5F36A] font-semibold">{filteredMatches.length}</span> events available
          </span>
        </div>

        {/* Source Provider Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full glass-panel bg-zinc-950/60 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setSelectedProvider('all')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              selectedProvider === 'all'
                ? 'bg-white/15 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setSelectedProvider('daddylive')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              selectedProvider === 'daddylive'
                ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>DaddyLive</span>
          </button>
          <button
            onClick={() => setSelectedProvider('embedse')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              selectedProvider === 'embedse'
                ? 'bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>EmbedSE</span>
          </button>
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl bg-zinc-900/50 animate-pulse border border-white/5"
            />
          ))
        ) : filteredMatches.length > 0 ? (
          filteredMatches.map((match) => {
            const isLive = match.status === 'live';
            const isFinished = match.status === 'finished';
            const isDaddyLive = match.provider === 'daddylive';

            return (
              <a
                key={match.id}
                href={`#/sports/watch/${match.id}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl glass-panel bg-zinc-950/40 hover:bg-white/5 hover:border-white/20 transition-all duration-200 select-none shadow-lg"
              >
                {/* Header: League, Provider & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider truncate">
                      {match.league || match.category || match.sport}
                    </span>
                    {isDaddyLive ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        DaddyLive
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                        EmbedSE
                      </span>
                    )}
                  </div>

                  {isLive ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span>LIVE NOW</span>
                    </div>
                  ) : isFinished ? (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 font-mono text-[11px] uppercase">
                      Finished
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{formatCountdown(match.start)}</span>
                    </span>
                  )}
                </div>

                {/* Body: Teams / Logos */}
                <div className="flex items-center justify-between gap-4 my-2">
                  {/* Home Team */}
                  <div className="flex flex-col items-center flex-1 text-center min-w-0">
                    <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center p-1 mb-2 overflow-hidden border border-white/10 bg-zinc-900">
                      {match.home_logo ? (
                        <img
                          src={match.home_logo}
                          alt={match.home || 'Home'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-mono font-bold text-xs text-[#C5F36A]">
                          {getInitials(match.home || match.title)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-sm text-zinc-100 truncate w-full group-hover:text-[#C5F36A] transition-colors">
                      {match.home || match.title}
                    </span>
                  </div>

                  {/* VS / Score pill */}
                  <div className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">
                    VS
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center flex-1 text-center min-w-0">
                    <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center p-1 mb-2 overflow-hidden border border-white/10 bg-zinc-900">
                      {match.away_logo ? (
                        <img
                          src={match.away_logo}
                          alt={match.away || 'Away'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-mono font-bold text-xs text-zinc-400">
                          {getInitials(match.away)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-sm text-zinc-100 truncate w-full group-hover:text-[#C5F36A] transition-colors">
                      {match.away || 'Opponent'}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">
                    {match.online_streams && match.online_streams > 0
                      ? `${match.online_streams} active streams`
                      : 'Stream available on start'}
                  </span>
                  <span className="flex items-center gap-1 text-[#C5F36A] font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Watch</span>
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </a>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-sm">
            No matches found for this sport right now.
          </div>
        )}
      </div>
    </div>
  );
};
