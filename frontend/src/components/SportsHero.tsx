import React, { useState, useEffect } from 'react';
import { Play, Calendar } from 'lucide-react';
import { SportsMatch } from '../lib/api';
import { SportCategory } from './SportsDock';

interface SportsHeroProps {
  matches: SportsMatch[];
  selectedSport: SportCategory;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const SportsHero: React.FC<SportsHeroProps> = ({ matches, selectedSport }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter candidate matches
  const candidateMatches = React.useMemo(() => {
    if (selectedSport === 'all') {
      const map = new Map<string, SportsMatch>();
      for (const m of matches) {
        const sportKey = (m.sport || m.category || 'other').toLowerCase();
        if (!map.has(sportKey)) {
          map.set(sportKey, m);
        }
      }
      const list = Array.from(map.values());
      return list.length > 0 ? list : matches.slice(0, 5);
    } else {
      const filtered = matches.filter((m) => {
        const s = (m.sport || m.category || m.category_slug || '').toLowerCase();
        if (selectedSport === 'soccer') return s.includes('foot') || s.includes('socc');
        if (selectedSport === 'combat') return s.includes('ufc') || s.includes('mma') || s.includes('box');
        if (selectedSport === 'basketball') return s.includes('basket') || s.includes('nba');
        if (selectedSport === 'tennis') return s.includes('tennis');
        if (selectedSport === 'golf') return s.includes('golf') || s.includes('pga');
        return true;
      });
      return filtered.length > 0 ? filtered.slice(0, 5) : matches.slice(0, 5);
    }
  }, [matches, selectedSport]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSport]);

  // Auto-rotate every 7 seconds in 'all' mode
  useEffect(() => {
    if (candidateMatches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candidateMatches.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [candidateMatches.length]);

  const activeMatch = candidateMatches[currentIndex] || matches[0];
  if (!activeMatch) return null;

  const isLive = activeMatch.status === 'live';

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] overflow-hidden rounded-3xl mx-auto my-6 border border-white/15 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl select-none">
      {/* Stadium / Arena Atmosphere Background with vibrant lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-zinc-950/80 to-[#090A0B]" />

      {/* Decorative ambient lighting elements */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#C5F36A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10">
        {/* Top Bar: League & Live Badge */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isLive ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/25 border border-red-500/40 text-red-400 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>LIVE NOW</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-zinc-300 font-mono text-xs">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Scheduled Match</span>
              </div>
            )}

            <div className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-xs font-mono font-semibold text-[#C5F36A] uppercase tracking-wider backdrop-blur-md">
              {activeMatch.league || activeMatch.category || 'Featured'}
            </div>
          </div>

          {/* Dots Carousel Indicator */}
          {candidateMatches.length > 1 && (
            <div className="flex items-center gap-1.5">
              {candidateMatches.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === i ? 'w-6 bg-[#C5F36A]' : 'w-2 bg-white/20 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Center: Prominent Club / Teams Logos Showcase */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 my-auto">
          {/* Home Team */}
          <div className="flex flex-col items-center text-center max-w-[140px] sm:max-w-[200px]">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900/90 border border-white/20 p-3 sm:p-4 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform">
              {activeMatch.home_logo ? (
                <img
                  src={activeMatch.home_logo}
                  alt={activeMatch.home || 'Home'}
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-mono font-extrabold text-2xl text-[#C5F36A]">
                  {getInitials(activeMatch.home || activeMatch.title)}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg sm:text-2xl font-bold uppercase text-white mt-3 truncate w-full drop-shadow">
              {activeMatch.home || activeMatch.title}
            </h3>
          </div>

          {/* VS Badge */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C5F36A] text-black font-mono font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-xl shadow-[#C5F36A]/30">
              VS
            </div>
            {activeMatch.online_streams && activeMatch.online_streams > 0 ? (
              <span className="text-[10px] font-mono text-emerald-400 mt-2 font-semibold">
                ● {activeMatch.online_streams} Streams Live
              </span>
            ) : null}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center text-center max-w-[140px] sm:max-w-[200px]">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900/90 border border-white/20 p-3 sm:p-4 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform">
              {activeMatch.away_logo ? (
                <img
                  src={activeMatch.away_logo}
                  alt={activeMatch.away || 'Away'}
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-mono font-extrabold text-2xl text-zinc-300">
                  {getInitials(activeMatch.away)}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg sm:text-2xl font-bold uppercase text-white mt-3 truncate w-full drop-shadow">
              {activeMatch.away || 'Away Team'}
            </h3>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex items-center justify-center">
          <a
            href={`#/sports/watch/${activeMatch.id}`}
            className="flex items-center gap-2.5 px-8 py-3 rounded-full bg-[#C5F36A] text-black font-bold text-sm sm:text-base hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/30"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
            <span>Watch Live Stream</span>
          </a>
        </div>
      </div>
    </div>
  );
};
