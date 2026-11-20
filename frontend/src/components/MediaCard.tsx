import React, { useState, useEffect } from 'react';
import { Star, Film, Tv, Play, Plus, Check } from 'lucide-react';
import { MediaMeta, checkWatchlist, addToWatchlist, removeFromWatchlist, WatchlistItem } from '../lib/api';

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
  onWatchlistChange?: (id: string, inWatchlist: boolean) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onSelect, onWatchlistChange }) => {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Check initial watchlist status
  useEffect(() => {
    let active = true;
    if (id) {
      checkWatchlist(id).then((saved) => {
        if (active) setIsSaved(saved);
      });
    }
    return () => {
      active = false;
    };
  }, [id]);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await removeFromWatchlist(id);
        setIsSaved(false);
        onWatchlistChange?.(id, false);
      } else {
        const watchItem: WatchlistItem = {
          imdb_id: id,
          media_type: mediaType as 'movie' | 'series',
          title: title || 'Untitled',
          poster: poster || null,
          rating: rating ? Number(rating) : null,
        };
        await addToWatchlist(watchItem);
        setIsSaved(true);
        onWatchlistChange?.(id, true);
      }
    } finally {
      setSaving(false);
    }
  };

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
      className="group relative cursor-pointer flex-shrink-0 w-[155px] sm:w-[175px] md:w-[195px] rounded-xl overflow-hidden bg-[#121316] border border-white/10 hover:border-[#C5F36A]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/80 select-none"
    >
      {/* 2:3 Aspect Ratio Container */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
        {poster && !imageError ? (
          <img
            src={poster}
            alt={title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900 text-zinc-500">
            {mediaType === 'series' ? <Tv className="w-10 h-10 mb-2 opacity-50 text-zinc-400" /> : <Film className="w-10 h-10 mb-2 opacity-50 text-zinc-400" />}
            <span className="text-xs font-medium text-zinc-300 line-clamp-2">{title}</span>
          </div>
        )}

        {/* Subtle hover gradient and play pill */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-[#C5F36A] text-black flex items-center justify-center shadow-lg shadow-[#C5F36A]/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top Badges & Quick Watchlist Button */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {rating ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-[#C5F36A]">
              <Star className="w-3 h-3 fill-[#C5F36A] text-[#C5F36A]" />
              <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
            </div>
          ) : <div />}

          {/* Quick Add/Remove Watchlist Button */}
          <button
            onClick={handleWatchlistClick}
            disabled={saving}
            title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`pointer-events-auto p-1.5 rounded-full transition-all duration-200 backdrop-blur-md ${
              isSaved
                ? 'bg-[#C5F36A] text-black shadow-md shadow-[#C5F36A]/30'
                : 'bg-black/60 text-white/90 hover:bg-[#C5F36A] hover:text-black border border-white/20'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </div>

        {/* Bottom Season/Episode badge if present */}
        {season !== undefined && episode !== undefined && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <div className="px-1.5 py-0.5 rounded bg-[#C5F36A] text-black font-mono text-[10px] font-extrabold uppercase">
              {season === 0 ? 'Specials' : `S${season}`} • E{episode}
            </div>
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="p-3 bg-[#111215]">
        <h4 className="font-semibold text-xs sm:text-sm text-zinc-100 truncate group-hover:text-[#C5F36A] transition-colors">
          {title}
        </h4>
        <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400 font-mono">
          <span>{year || (mediaType === 'series' ? 'TV Series' : 'Movie')}</span>
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">{mediaType}</span>
        </div>
      </div>
    </div>
  );
};
