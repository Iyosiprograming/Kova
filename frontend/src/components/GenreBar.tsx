import React from 'react';
import { ChevronDown, Film, Sparkles } from 'lucide-react';

export const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Western',
];

interface GenreBarProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  itemCount?: number;
}

export const GenreBar: React.FC<GenreBarProps> = ({
  selectedGenre,
  onSelectGenre,
  itemCount,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-4 my-2 border-b border-white/5">
      {/* Sexy Glassmorphic Genre Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          {/* Neon Icon Indicator */}
          <div className="absolute left-3.5 z-10 flex items-center pointer-events-none text-[#C5F36A]">
            <Film className="w-4 h-4" />
          </div>

          <select
            id="genre-select"
            value={selectedGenre}
            onChange={(e) => onSelectGenre(e.target.value)}
            className="appearance-none pl-10 pr-10 py-2.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900/90 text-white font-medium text-xs sm:text-sm border border-white/10 hover:border-[#C5F36A]/50 focus:border-[#C5F36A] focus:ring-2 focus:ring-[#C5F36A]/20 focus:outline-none cursor-pointer transition-all duration-200 shadow-xl backdrop-blur-xl"
          >
            {GENRES.map((g) => (
              <option key={g} value={g} className="bg-zinc-950 text-zinc-100 py-2">
                {g === 'All' ? '⚡ All Genres' : g}
              </option>
            ))}
          </select>

          {/* Sexy Custom Chevron */}
          <div className="pointer-events-none absolute right-3 flex items-center text-zinc-400 group-hover:text-[#C5F36A] transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Selected Genre Pill Badge */}
        {selectedGenre !== 'All' && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5F36A]/10 border border-[#C5F36A]/30 text-[#C5F36A] text-xs font-mono font-semibold animate-in fade-in">
            <Sparkles className="w-3 h-3" />
            <span>Filtering by {selectedGenre}</span>
          </span>
        )}
      </div>

      {/* Visible Item Count */}
      {typeof itemCount === 'number' && (
        <div className="font-mono text-xs text-zinc-400 whitespace-nowrap bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5">
          <span className="text-[#C5F36A] font-bold">{itemCount}</span> available titles
        </div>
      )}
    </div>
  );
};
