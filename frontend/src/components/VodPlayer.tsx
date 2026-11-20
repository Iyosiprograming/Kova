import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, RefreshCw } from 'lucide-react';
import { VOD_PROVIDERS, VodProvider } from '../lib/providers';
import { saveWatchHistory } from '../lib/api';

interface VodPlayerProps {
  imdbId: string;
  mediaType: 'movie' | 'series';
  title: string;
  poster?: string;
  season?: number;
  episode?: number;
  onBack?: () => void;
}

export const VodPlayer: React.FC<VodPlayerProps> = ({
  imdbId,
  mediaType,
  title,
  poster,
  season = 1,
  episode = 1,
  onBack,
}) => {
  const [activeProvider, setActiveProvider] = useState<VodProvider>(VOD_PROVIDERS[0]);
  const [reloadKey, setReloadKey] = useState(0);

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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => {
            if (onBack) onBack();
            else window.history.back();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs font-mono text-zinc-300 hover:text-white transition-colors"
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
              Season {season} • Episode {episode}
            </span>
          )}
        </div>
      </div>

      {/* 16:9 Player Viewport */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-panel bg-black border border-white/10 shadow-2xl">
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
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-4 rounded-xl glass-panel bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#C5F36A]" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Streaming Servers:
          </span>
        </div>

        {/* Server Switcher Pills */}
        <div className="flex items-center gap-2">
          {VOD_PROVIDERS.map((provider) => {
            const isSelected = activeProvider.id === provider.id;
            return (
              <button
                key={provider.id}
                onClick={() => setActiveProvider(provider)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-[#C5F36A] text-black font-semibold shadow-md shadow-[#C5F36A]/20'
                    : 'glass-pill text-zinc-300 hover:text-white'
                }`}
              >
                {provider.name}
              </button>
            );
          })}

          {/* Force Reload Button */}
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload Player"
            className="p-1.5 rounded-full glass-pill text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
