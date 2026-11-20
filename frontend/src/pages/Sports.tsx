import React, { useState, useEffect } from 'react';
import { Play, Clock } from 'lucide-react';
import { SportsDock, SportCategory } from '../components/SportsDock';
import { TeamBadge } from '../components/TeamBadge';
import { fetchSportsMatches, SportsMatch } from '../lib/api';
import { matchBelongsToCategory, formatCountdown } from '../lib/sportsUtils';

const SAVED_SPORT_KEY = 'kova_selected_sport';

const getInitialSport = (): SportCategory => {
  try {
    const saved = sessionStorage.getItem(SAVED_SPORT_KEY) as SportCategory;
    if (saved) return saved;
  } catch {}
  return 'all';
};

export const Sports: React.FC = () => {
  const [selectedSport, setSelectedSportState] = useState<SportCategory>(getInitialSport);
  const [matches, setMatches] = useState<SportsMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleSelectSport = (sport: SportCategory) => {
    setSelectedSportState(sport);
    try {
      sessionStorage.setItem(SAVED_SPORT_KEY, sport);
    } catch {}
  };

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

  // Filter matches based on selected category (supports all 10 DaddyLive sports)
  const filteredMatches = React.useMemo(() => {
    return matches.filter((m) => matchBelongsToCategory(m, selectedSport));
  }, [matches, selectedSport]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 py-6">
      {/* 10-Sport Dedicated Category Dock */}
      <SportsDock
        selectedSport={selectedSport}
        onSelectSport={handleSelectSport}
      />

      {/* Match Cards Header */}
      <div className="flex items-center justify-between gap-4 mt-6 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
            {selectedSport === 'all'
              ? 'All Live Sports'
              : `${selectedSport.toUpperCase()} Matches`}
          </h2>
          <span className="font-mono text-xs text-zinc-400">
            <span className="text-[#C5F36A] font-semibold">{filteredMatches.length}</span> live events on DaddyLive
          </span>
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
            const countdown = formatCountdown(match.start);
            const isMatchLive = match.status === 'live' || countdown.toLowerCase().includes('live');
            const isFinished = match.status === 'finished';
            const hasAwayTeam = Boolean(match.away && match.away.trim().length > 0);

            return (
              <a
                key={match.id}
                href={`#/sports/watch/${match.id}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl glass-panel bg-zinc-950/40 hover:bg-white/5 hover:border-white/20 transition-all duration-200 select-none shadow-lg"
              >
                {/* Header: League & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider truncate">
                      {match.league || match.category || match.sport}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      DaddyLive
                    </span>
                  </div>

                  {isMatchLive ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-[11px] font-bold shadow-sm shadow-red-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span>{countdown.includes('Progress') ? 'IN PROGRESS' : 'LIVE NOW'}</span>
                    </div>
                  ) : isFinished ? (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 font-mono text-[11px] uppercase">
                      Finished
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono text-[11px] font-semibold">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{countdown}</span>
                    </span>
                  )}
                </div>

                {/* Body: Teams / Logos OR Single Featured Event */}
                {hasAwayTeam ? (
                  <div className="flex items-center justify-between gap-4 my-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1 text-center min-w-0">
                      <TeamBadge
                        logo={match.home_logo}
                        name={match.home || match.title}
                        sport={match.sport}
                        size="md"
                        className="mb-2"
                      />
                      <span className="font-medium text-sm text-zinc-100 truncate w-full group-hover:text-[#C5F36A] transition-colors">
                        {match.home || match.title}
                      </span>
                    </div>

                    {/* VS badge */}
                    <div className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">
                      VS
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1 text-center min-w-0">
                      <TeamBadge
                        logo={match.away_logo}
                        name={match.away || ''}
                        sport={match.sport}
                        size="md"
                        className="mb-2"
                      />
                      <span className="font-medium text-sm text-zinc-100 truncate w-full group-hover:text-[#C5F36A] transition-colors">
                        {match.away}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center my-3 py-1">
                    <TeamBadge
                      logo={match.home_logo}
                      name={match.home || match.title}
                      sport={match.sport}
                      size="md"
                      className="mb-2"
                    />
                    <span className="font-semibold text-sm text-zinc-100 line-clamp-2 max-w-full group-hover:text-[#C5F36A] transition-colors">
                      {match.title || match.home}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 mt-1">
                      {match.sport} • {match.category || 'Special Event'}
                    </span>
                  </div>
                )}

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">
                    {match.online_streams && match.online_streams > 0
                      ? `${match.online_streams} active stream${match.online_streams > 1 ? 's' : ''}`
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
            No matches found for this category right now.
          </div>
        )}
      </div>
    </div>
  );
};
