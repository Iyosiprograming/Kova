import React, { useState } from 'react';
import { Star, Film, Tv, Play } from 'lucide-react';
import { MediaMeta } from '../lib/api';

interface MediaCardProps {
  item: MediaMeta | {
    imdb_id: string;
    media_type: 'movie' | 'series';
    title: string;
    poster?: string | null;
    rating?: number | null;
    season?: number | null;
    episode?: number | null;
    year?: string | number;
  };
  onSelect?: (item: any) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  const id = 'id' in item ? item.id : item.imdb_id;
  const title = 'name' in item ? item.name || item.title : item.title;
  const mediaType = ('type' in item ? item.type : item.media_type) || 'movie';
  const poster = item.poster;
  const rating = ('imdbRating' in item && item.imdbRating)
    ? item.imdbRating
    : ('rating' in item ? item.rating : undefined);
  const year = 'year' in item ? item.year : ('releaseInfo' in item ? item.releaseInfo : undefined);
  const season = 'season' in item ? item.season : undefined;
  const episode = 'episode' in item ? item.episode : undefined;

  const handleClick = () => {
    if (onSelect) {
      onSelect(item);
    } else {
      window.location.hash = `#/details/${mediaType}/${id}`;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] rounded-xl overflow-hidden glass-panel hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 select-none"
    >
      {/* 2:3 Aspect Ratio Container */}
      <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
        {poster && !imageError ? (
          <img
            src={poster}
            alt={title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900/90 text-zinc-500">
            {mediaType === 'series' ? <Tv className="w-10 h-10 mb-2 opacity-40" /> : <Film className="w-10 h-10 mb-2 opacity-40" />}
            <span className="text-xs font-medium text-zinc-400 line-clamp-2">{title}</span>
          </div>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#C5F36A] text-black flex items-center justify-center shadow-lg shadow-black/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {rating ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-[#C5F36A]">
              <Star className="w-3 h-3 fill-[#C5F36A] text-[#C5F36A]" />
              <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
            </div>
          ) : <div />}

          {season && episode ? (
            <div className="px-1.5 py-0.5 rounded-md bg-[#C5F36A] text-black font-mono text-[11px] font-bold tracking-tight">
              S{season} E{episode}
            </div>
          ) : (
            <div className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
              {mediaType === 'series' ? 'TV' : 'Film'}
            </div>
          )}
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="p-3">
        <h4 className="font-medium text-sm text-zinc-100 truncate group-hover:text-[#C5F36A] transition-colors">
          {title}
        </h4>
        <div className="flex items-center justify-between mt-1 text-xs text-zinc-400 font-mono">
          <span>{year || (mediaType === 'series' ? 'Series' : 'Movie')}</span>
          <span className="text-zinc-500 capitalize">{mediaType}</span>
        </div>
      </div>
    </div>
  );
};
