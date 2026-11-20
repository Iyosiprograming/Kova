import React, { useState, useEffect } from 'react';
import { Play, Calendar } from 'lucide-react';
import { SportsMatch } from '../lib/api';
import { SportCategory } from './SportsDock';

interface SportsHeroProps {
  matches: SportsMatch[];
  selectedSport: SportCategory;
}

export const SportsHero: React.FC<SportsHeroProps> = ({ matches, selectedSport }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  // Filter candidate matches
  const candidateMatches = React.useMemo(() => {
    if (selectedSport === 'all') {
      // Pick #1 match of each distinct sport
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
      // Matches matching the selected sport
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
    setImageFailed(false);
  }, [selectedSport]);

  // Auto-rotate every 7 seconds in 'all' mode
  useEffect(() => {
    if (candidateMatches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candidateMatches.length);
      setImageFailed(false);
    }, 7000);
    return () => clearInterval(interval);
  }, [candidateMatches.length]);

  const activeMatch = candidateMatches[currentIndex] || matches[0];
  if (!activeMatch) return null;

  const sportSlug = (activeMatch.sport || selectedSport || 'default').toLowerCase();
  const bannerSrc = `/banners/${sportSlug}.jpg`;
  const isLive = activeMatch.status === 'live';

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] overflow-hidden rounded-3xl mx-auto my-6 border border-white/10 glass-panel bg-zinc-950">
      {/* Background Banner with Dark Gradient Fallback */}
      {!imageFailed ? (
        <img
          key={bannerSrc}
          src={bannerSrc}
          alt={activeMatch.title}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 transition-opacity duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 opacity-90" />
      )}

      {/* Dark Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0B] via-[#090A0B]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090A0B] via-[#090A0B]/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 max-w-3xl">
        {/* League & Status Badges */}
        <div className="flex items-center gap-3 mb-3">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE NOW</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-zinc-300 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Upcoming</span>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C5F36A] uppercase tracking-wider">
            {activeMatch.league || activeMatch.category || 'Featured Match'}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wide text-white leading-tight mb-3 drop-shadow-md">
          {activeMatch.home && activeMatch.away
            ? `${activeMatch.home} vs ${activeMatch.away}`
            : activeMatch.title}
        </h2>

        {/* CTA Button */}
        <div className="flex items-center gap-4 mt-2">
          <a
            href={`#/sports/watch/${activeMatch.id}`}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#C5F36A] text-black font-semibold text-sm hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/20"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Watch Live Stream</span>
          </a>

          {/* Carousel indicators in 'all' mode */}
          {candidateMatches.length > 1 && (
            <div className="flex items-center gap-1.5 ml-4">
              {candidateMatches.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === i ? 'w-6 bg-[#C5F36A]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
