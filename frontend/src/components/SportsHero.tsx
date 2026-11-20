import React, { useState, useEffect } from 'react';
import { Play, Calendar, Flame } from 'lucide-react';
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

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSport]);

  useEffect(() => {
    if (candidateMatches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candidateMatches.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [candidateMatches.length]);

  if (candidateMatches.length === 0) return null;

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] overflow-hidden rounded-3xl mx-auto my-6 border border-white/15 bg-gradient-to-br from-[#12161f] via-[#0d1017] to-[#090a0d] shadow-2xl select-none">
      {/* Dynamic Ambient Stadium Lights */}
      <div className="absolute -top-32 -left-20 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-20 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C5F36A]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Modern Pitch & Court Grid Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Stacked Matches for Silky Smooth Cross-Fade */}
      {candidateMatches.map((activeMatch, idx) => {
        const isCurrent = currentIndex === idx;
        const isLive = activeMatch.status === 'live';

        return (
          <div
            key={activeMatch.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out p-6 sm:p-10 flex flex-col justify-between ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            {/* Top Header Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isLive ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/20">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-zinc-300 font-mono text-xs">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Upcoming Match</span>
                  </div>
                )}

                <div className="px-3.5 py-1 rounded-full bg-black/60 border border-white/15 text-xs font-mono font-bold text-[#C5F36A] uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{activeMatch.league || activeMatch.category || 'Featured'}</span>
                </div>
              </div>

              {/* Dots Carousel Indicator */}
              {candidateMatches.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {candidateMatches.map((_, dotI) => (
                    <button
                      key={dotI}
                      onClick={() => setCurrentIndex(dotI)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentIndex === dotI ? 'w-6 bg-[#C5F36A]' : 'w-2 bg-white/20 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${dotI + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Center: High-Resolution Teams / Logos Face-Off */}
            <div className="flex items-center justify-center gap-6 sm:gap-14 md:gap-20 my-auto">
              {/* Home Team */}
              <div className="flex flex-col items-center text-center max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/[0.04] border border-white/20 p-3 sm:p-4 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform">
                  {activeMatch.home_logo ? (
                    <img
                      src={activeMatch.home_logo}
                      alt={activeMatch.home || 'Home'}
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#C5F36A]">
                      {getInitials(activeMatch.home || activeMatch.title)}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base sm:text-xl md:text-2xl font-bold uppercase text-white mt-3 truncate w-full drop-shadow">
                  {activeMatch.home || activeMatch.title}
                </h3>
              </div>

              {/* VS Pill & Stream Status */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C5F36A] text-black font-mono font-black text-xs sm:text-sm flex items-center justify-center shadow-xl shadow-[#C5F36A]/30">
                  VS
                </div>
                {activeMatch.online_streams && activeMatch.online_streams > 0 ? (
                  <span className="text-[11px] font-mono text-emerald-400 mt-2 font-bold whitespace-nowrap">
                    ● {activeMatch.online_streams} Streams
                  </span>
                ) : null}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center text-center max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/[0.04] border border-white/20 p-3 sm:p-4 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform">
                  {activeMatch.away_logo ? (
                    <img
                      src={activeMatch.away_logo}
                      alt={activeMatch.away || 'Away'}
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="font-mono font-extrabold text-2xl sm:text-3xl text-zinc-300">
                      {getInitials(activeMatch.away)}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base sm:text-xl md:text-2xl font-bold uppercase text-white mt-3 truncate w-full drop-shadow">
                  {activeMatch.away || 'Opponent'}
                </h3>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="flex items-center justify-center">
              <a
                href={`#/sports/watch/${activeMatch.id}`}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#C5F36A] text-black font-bold text-sm sm:text-base hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/30"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Watch Live Stream</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
