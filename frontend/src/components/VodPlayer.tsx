import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, RefreshCw, Play, SkipForward } from 'lucide-react';
import { VOD_PROVIDERS, VodProvider } from '../lib/providers';
import { saveWatchHistory, EpisodeMeta } from '../lib/api';

interface VodPlayerProps {
  imdbId: string;
  mediaType: 'movie' | 'series';
  title: string;
  poster?: string;
  season?: number;
  episode?: number;
  episodes?: EpisodeMeta[];
  onSelectEpisode?: (season: number, episode: number) => void;
  onBack?: () => void;
}

export const VodPlayer: React.FC<VodPlayerProps> = ({
  imdbId,
  mediaType,
  title,
  poster,
  season = 1,
  episode = 1,
  episodes = [],
  onSelectEpisode,
  onBack,
}) => {
  const [activeProvider, setActiveProvider] = useState<VodProvider>(VOD_PROVIDERS[0]);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeSeason, setActiveSeason] = useState<number>(season);

  // Keep active season in sync with prop
  useEffect(() => {
    setActiveSeason(season);
  }, [season]);

  // Compute current embed URL
  const embedUrl = mediaType === 'series'
    ? activeProvider.buildTvUrl(imdbId, season, episode)
    : activeProvider.buildMovieUrl(imdbId);

  // Automatically log playback progress to history
  useEffect(() => {
    saveWatchHistory({
      imdb_id: imdbId,
      media_type: mediaType,
      title: title,
      poster: poster || null,
      season: mediaType === 'series' ? season : null,
      episode: mediaType === 'series' ? episode : null,
    }).catch(() => {});
  }, [imdbId, mediaType, title, poster, season, episode]);

  // Extract available seasons
  const seasons = Array.from(new Set(episodes.map((ep) => ep.season))).sort((a, b) => a - b);
  const currentSeasonEpisodes = episodes.filter((ep) => ep.season === activeSeason);

  // Find next episode if any
  const currentEpIndex = currentSeasonEpisodes.findIndex(
    (ep) => (ep.number || ep.episode) === episode
  );
  const nextEp = currentEpIndex >= 0 && currentEpIndex + 1 < currentSeasonEpisodes.length
    ? currentSeasonEpisodes[currentEpIndex + 1]
    : null;

  const handleEpisodeClick = (s: number, e: number) => {
    if (onSelectEpisode) {
      onSelectEpisode(s, e);
    } else {
      window.location.hash = `#/watch/series/${imdbId}/${s}/${e}`;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => {
            if (onBack) onBack();
            else window.history.back();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-mono text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-right">
          <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
            {title}
          </h2>
          {mediaType === 'series' && (
            <span className="font-mono text-xs text-[#C5F36A]">
              {season === 0 ? 'Specials' : `Season ${season}`} • Episode {episode}
            </span>
          )}
        </div>
      </div>

      {/* 16:9 Player Viewport */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        <iframe
          key={`${embedUrl}-${reloadKey}`}
          src={embedUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>

      {/* Controls & Server Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-4 rounded-xl glass-panel bg-zinc-950/80 border border-white/10">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#C5F36A]" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Streaming Server:
          </span>
          <div className="flex items-center gap-2 ml-1">
            {VOD_PROVIDERS.map((provider) => {
              const isSelected = activeProvider.id === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => setActiveProvider(provider)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-[#C5F36A] text-black font-semibold shadow-md shadow-[#C5F36A]/20'
                      : 'glass-pill text-zinc-300 hover:text-white'
                  }`}
                >
                  {provider.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Next Episode Quick Button */}
          {mediaType === 'series' && nextEp && (
            <button
              onClick={() => handleEpisodeClick(activeSeason, nextEp.number || nextEp.episode || 1)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5F36A] text-black text-xs font-mono font-bold hover:bg-[#b5e357] transition-all shadow-md shadow-[#C5F36A]/20"
            >
              <span>Next: E{nextEp.number || nextEp.episode}</span>
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Force Reload Button */}
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload Player"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-pill text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Series Episodes List Under Player */}
      {mediaType === 'series' && episodes.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">
              Episodes
            </h3>

            {/* Season Selector */}
            {seasons.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {seasons.map((sNum) => (
                  <button
                    key={sNum}
                    onClick={() => setActiveSeason(sNum)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      activeSeason === sNum
                        ? 'bg-[#C5F36A] text-black font-bold shadow-md shadow-[#C5F36A]/20'
                        : 'glass-pill text-zinc-300 hover:text-white'
                    }`}
                  >
                    {sNum === 0 ? 'Specials / Extras' : `Season ${sNum}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Episode Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSeasonEpisodes.map((ep) => {
              const epNum = ep.number || ep.episode || 1;
              const epTitle = ep.title || ep.name || `Episode ${epNum}`;
              const isPlaying = activeSeason === season && epNum === episode;

              return (
                <div
                  key={ep.id || epNum}
                  onClick={() => handleEpisodeClick(activeSeason, epNum)}
                  className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all select-none ${
                    isPlaying
                      ? 'bg-zinc-800 border-2 border-[#C5F36A] shadow-lg shadow-[#C5F36A]/10'
                      : 'glass-panel bg-zinc-950/60 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 aspect-video rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/10">
                    {ep.thumbnail ? (
                      <img
                        src={ep.thumbnail}
                        alt={epTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono font-bold text-zinc-600 text-xs">
                        E{epNum}
                      </div>
                    )}
                    {isPlaying ? (
                      <div className="absolute inset-0 bg-[#C5F36A]/30 flex items-center justify-center">
                        <Play className="w-5 h-5 fill-black text-black" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-4 h-4 fill-[#C5F36A] text-[#C5F36A]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${isPlaying ? 'text-[#C5F36A]' : 'text-zinc-400'}`}>
                        E{epNum}
                      </span>
                      {isPlaying && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-[#C5F36A] text-black">
                          Now Playing
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-xs sm:text-sm text-zinc-100 truncate mt-0.5">
                      {epTitle}
                    </h4>
                    {ep.overview || ep.description ? (
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {ep.overview || ep.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
