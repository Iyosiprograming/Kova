import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from './MediaCard';

interface MediaRowProps {
  title: string;
  items: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  items,
  loading = false,
  emptyMessage = 'No items found',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <div className="relative my-8 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3 px-6 sm:px-10">
        <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-zinc-100">
          {title}
        </h3>
        <span className="font-mono text-xs text-zinc-500">
          {items.length > 0 && `${items.length} titles`}
        </span>
      </div>

      {/* Row Container with Scroll Buttons */}
      <div className="relative px-6 sm:px-10">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 hover:bg-[#C5F36A] hover:text-black transition-all duration-200 shadow-xl"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {loading ? (
            // Skeleton Loaders
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] aspect-[2/3] rounded-xl bg-zinc-900/60 animate-pulse border border-white/5"
              />
            ))
          ) : items.length > 0 ? (
            items.map((item, idx) => (
              <MediaCard key={item.id || item.imdb_id || idx} item={item} />
            ))
          ) : (
            <div className="text-zinc-500 text-sm py-8">{emptyMessage}</div>
          )}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 hover:bg-[#C5F36A] hover:text-black transition-all duration-200 shadow-xl"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
