import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star, Calendar, Clock, Film, Tv } from 'lucide-react';
import {
  fetchMeta,
  fetchCatalog,
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  MediaMeta,
  WatchlistItem,
} from '../lib/api';
import { MediaRow } from '../components/MediaRow';

interface DetailsProps {
  mediaType: 'movie' | 'series';
  imdbId: string;
}

export const Details: React.FC<DetailsProps> = ({ mediaType, imdbId }) => {
  const [meta, setMeta] = useState<MediaMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [related, setRelated] = useState<MediaMeta[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchMeta(mediaType, imdbId)
      .then((data) => {
        if (!mounted) return;
        setMeta(data);

        // Check watchlist
        checkWatchlist(imdbId).then((res) => {
          if (mounted) setInWatchlist(res);
        });

        // Set default season to Season 1 (not Season 0 / Specials)
        if (data?.videos && data.videos.length > 0) {
          const rawSeasons = Array.from(new Set(data.videos.map((v) => v.season)));
          if (rawSeasons.includes(1)) {
            setSelectedSeason(1);
          } else {
            const firstRegular = rawSeasons.find((s) => s > 0);
            setSelectedSeason(firstRegular !== undefined ? firstRegular : (rawSeasons[0] || 1));
          }
        }

        // Fetch related titles
        const firstGenre = data?.genres?.[0] || data?.genre?.[0];
        fetchCatalog(mediaType, 'top', firstGenre).then((rel) => {
          if (mounted) setRelated(rel.filter((r) => r.id !== imdbId));
        });
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [mediaType, imdbId]);

  const handleWatchlistToggle = async () => {
    if (!meta) return;
    if (inWatchlist) {
      await removeFromWatchlist(imdbId);
      setInWatchlist(false);
    } else {
      const item: WatchlistItem = {
        imdb_id: imdbId,
        media_type: mediaType,
        title: meta.name || meta.title || 'Unknown',
        poster: meta.poster || null,
        rating: meta.imdbRating ? Number(meta.imdbRating) : null,
      };
      await addToWatchlist(item);
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-12">
        <div className="h-[400px] rounded-3xl bg-zinc-900/40 animate-pulse border border-white/5" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Title Not Found</h2>
        <p className="text-zinc-500 text-sm mb-6">Could not load details for this title.</p>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2 rounded-full bg-[#C5F36A] text-black text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract seasons and episodes for TV shows (Season 1, 2, 3... first, Specials at end)
  const episodes = meta.videos || [];
  const seasons = Array.from(new Set(episodes.map((ep) => ep.season))).sort((a, b) => {
    if (a === 0) return 1;
    if (b === 0) return -1;
    return a - b;
  });
  const currentSeasonEpisodes = episodes.filter((ep) => ep.season === selectedSeason);

  return (
    <div className="w-full pb-20">
      {/* Hero Backdrop Section */}
      <div className="relative w-full min-h-[460px] md:min-h-[520px] overflow-hidden -mt-3 bg-[#090A0B]">
        {/* Full-Light Backdrop Image */}
        <img
          src={meta.background || meta.poster}
          alt={meta.name}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-85"
        />

        {/* Left Text Scrim & Bottom Transition */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090A0B]/95 via-[#090A0B]/40 to-transparent w-full md:w-3/4" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#090A0B] to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-12 flex flex-col md:flex-row gap-8 items-start md:items-end">
          {/* Poster Card */}
          <div className="w-44 sm:w-56 md:w-64 rounded-2xl overflow-hidden glass-panel flex-shrink-0 shadow-2xl border border-white/10">
            {meta.poster ? (
              <img
                src={meta.poster}
                alt={meta.name}
                className="w-full aspect-[2/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center text-zinc-600">
                {mediaType === 'series' ? <Tv className="w-12 h-12" /> : <Film className="w-12 h-12" />}
              </div>
            )}
          </div>

          {/* Details & Metadata */}
          <div className="flex-1">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                {mediaType === 'series' ? 'TV Series' : 'Movie'}
              </span>

              {meta.imdbRating && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-[#C5F36A] font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{meta.imdbRating}</span>
                </div>
              )}

              {meta.year && (
                <span className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{meta.year}</span>
                </span>
              )}

              {meta.runtime && (
                <span className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{meta.runtime}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white mb-3 leading-none">
              {meta.name || meta.title}
            </h1>

            {/* Genres */}
            {(meta.genres || meta.genre) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {(meta.genres || meta.genre)?.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono text-zinc-400 glass-pill"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {meta.description && (
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans max-w-3xl mb-6">
                {meta.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={
                  mediaType === 'series' && currentSeasonEpisodes.length > 0
                    ? `#/watch/series/${imdbId}/${currentSeasonEpisodes[0].season}/${currentSeasonEpisodes[0].number || currentSeasonEpisodes[0].episode || 1}`
                    : `#/watch/${mediaType}/${imdbId}`
                }
                className="flex items-center gap-2.5 px-8 py-3 rounded-full bg-[#C5F36A] text-black font-semibold text-sm hover:bg-[#b5e357] transition-all transform hover:scale-105 shadow-xl shadow-[#C5F36A]/20"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Watch Now</span>
              </a>

              <button
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2 px-5 py-3 rounded-full glass-panel text-white text-sm font-medium hover:bg-white/10 transition-all border border-white/15"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-[#C5F36A]" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TV Series Season & Episode Section */}
      {mediaType === 'series' && seasons.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-8">
          <div className="border-t border-white/10 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                Episodes
              </h2>

              {/* Season Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {seasons.map((seasonNum) => (
                  <button
                    key={seasonNum}
                    onClick={() => setSelectedSeason(seasonNum)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                      selectedSeason === seasonNum
                        ? 'bg-[#C5F36A] text-black font-bold shadow-md shadow-[#C5F36A]/20'
                        : 'glass-pill text-zinc-300 hover:text-white'
                    }`}
                  >
                    {seasonNum === 0 ? 'Specials / Extras' : `Season ${seasonNum}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {currentSeasonEpisodes.map((ep) => {
                const epNum = ep.number || ep.episode || 1;
                const epTitle = ep.title || ep.name || `Episode ${epNum}`;
                return (
                  <a
                    key={ep.id || epNum}
                    href={`#/watch/series/${imdbId}/${ep.season}/${epNum}`}
                    className="flex items-center gap-4 p-3.5 rounded-xl glass-panel hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    {/* Thumbnail / Number */}
                    <div className="relative w-24 sm:w-28 aspect-video rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/10">
                      {ep.thumbnail ? (
                        <img
                          src={ep.thumbnail}
                          alt={epTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono font-bold text-zinc-600">
                          E{epNum}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-4 h-4 fill-[#C5F36A] text-[#C5F36A]" />
                      </div>
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#C5F36A]">
                          E{epNum}
                        </span>
                        <h4 className="font-medium text-sm text-zinc-100 truncate group-hover:text-[#C5F36A] transition-colors">
                          {epTitle}
                        </h4>
                      </div>
                      {ep.overview || ep.description ? (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                          {ep.overview || ep.description}
                        </p>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono mt-1 block">
                          {ep.released ? new Date(ep.released).toLocaleDateString() : 'Available to stream'}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cast & Crew if available */}
      {meta.cast && meta.cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-10">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-zinc-300 mb-3">
            Starring
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {meta.cast.map((actor, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-mono text-zinc-300 glass-panel"
              >
                {actor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* More Like This Row */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto mt-12">
          <MediaRow title="More Like This" items={related} />
        </div>
      )}
    </div>
  );
};
