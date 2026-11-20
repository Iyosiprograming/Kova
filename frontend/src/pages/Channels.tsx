import React, { useState, useEffect } from 'react';
import { Search, Tv, Play, Radio } from 'lucide-react';
import { fetchChannels, LiveChannel } from '../lib/api';
import { getChannelLogo } from '../lib/sportsUtils';

export const Channels: React.FC = () => {
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>('');
  const [activeServerIdx, setActiveServerIdx] = useState<number>(0);

  useEffect(() => {
    fetchChannels()
      .then((data) => {
        setChannels(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredChannels = channels.filter((ch) => {
    return ch.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const handlePlayChannel = (ch: LiveChannel) => {
    setSelectedChannel(ch);
    setActiveServerIdx(0);
    setActiveStreamUrl(ch.streams[0] || ch.embed_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 py-6">
      {/* Active Live TV Player (When a channel is selected) */}
      {selectedChannel && (
        <div className="mb-10 p-4 sm:p-6 rounded-3xl glass-panel bg-zinc-950/90 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/25 border border-red-500/40 text-red-400 font-mono text-xs font-bold shadow-lg shadow-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>24/7 LIVE</span>
              </div>

              {/* Channel logo if present */}
              {getChannelLogo(selectedChannel.name) && (
                <img
                  src={getChannelLogo(selectedChannel.name)!}
                  alt={selectedChannel.name}
                  className="h-7 w-auto max-w-[85px] object-contain rounded shadow"
                />
              )}

              <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase tracking-wide">
                {selectedChannel.name}
              </h2>
            </div>

            <button
              onClick={() => setSelectedChannel(null)}
              className="px-3 py-1 rounded-full glass-pill text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Close Player ✕
            </button>
          </div>

          {/* Player Viewport */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-panel bg-black border border-white/10 shadow-2xl mb-4">
            <iframe
              key={activeStreamUrl}
              src={activeStreamUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="origin"
            />
          </div>

          {/* Stream Server Switcher */}
          {selectedChannel.streams.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <span className="text-xs font-mono text-zinc-400 mr-2">Available Servers:</span>
              {selectedChannel.streams.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveServerIdx(idx);
                    setActiveStreamUrl(url);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeServerIdx === idx
                      ? 'bg-[#C5F36A] text-black font-semibold shadow-md shadow-[#C5F36A]/20'
                      : 'glass-pill text-zinc-300 hover:text-white'
                  }`}
                >
                  Server {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white">
              Live Channels
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1.5">
            24/7 Live TV streams powered by DaddyLive • {channels.length} channels online
          </p>
        </div>

        {/* Clean Channel Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels (beIN, Sky, ESPN, Canal, TNT...)"
            className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-full border border-white/15 focus:outline-none focus:border-[#C5F36A] transition-colors shadow-md"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Channels Grid (No genre tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-2xl bg-zinc-900/50 animate-pulse border border-white/5"
            />
          ))
        ) : filteredChannels.length > 0 ? (
          filteredChannels.map((ch) => {
            const isPlaying = selectedChannel?.id === ch.id;
            const logoPath = getChannelLogo(ch.name);

            return (
              <div
                key={ch.id}
                onClick={() => handlePlayChannel(ch)}
                className={`group p-4 rounded-2xl glass-panel cursor-pointer transition-all duration-200 select-none shadow-lg flex flex-col justify-between ${
                  isPlaying
                    ? 'border-2 border-[#C5F36A] bg-zinc-900/90 shadow-[#C5F36A]/10'
                    : 'bg-zinc-950/50 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Channel Network Brand Badge or TV Icon */}
                    {logoPath ? (
                      <div className="h-9 px-1 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={logoPath}
                          alt={ch.name}
                          className="h-7 w-auto max-w-[80px] object-contain rounded drop-shadow"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#C5F36A] transition-colors flex-shrink-0">
                        <Tv className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-[#C5F36A] transition-colors line-clamp-1">
                        {ch.name}
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        ● BROADCASTING
                      </span>
                    </div>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                  <span className="text-zinc-500">
                    {ch.streams_count} server{ch.streams_count > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1 text-[#C5F36A] font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Watch</span>
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-sm">
            No channels found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
