import React from 'react';

export const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Crime',
  'Thriller',
  'Comedy',
  'Animation',
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
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-10 py-4 my-2">
      {/* Pills Container */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {GENRES.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none flex-shrink-0 ${
                isActive
                  ? 'bg-[#C5F36A] text-black font-semibold shadow-lg shadow-[#C5F36A]/20'
                  : 'glass-pill text-zinc-300 hover:text-white hover:border-white/20'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Visible Item Count */}
      {typeof itemCount === 'number' && (
        <div className="font-mono text-xs text-zinc-500 whitespace-nowrap">
          <span className="text-[#C5F36A] font-semibold">{itemCount}</span> titles
        </div>
      )}
    </div>
  );
};
