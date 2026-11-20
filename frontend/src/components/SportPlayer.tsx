import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, Server, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchMatchStreams, MatchStreamsResponse } from '../lib/api';

interface SportPlayerProps {
  matchId: string;
  onBack?: () => void;
}

export const SportPlayer: React.FC<SportPlayerProps> = ({ matchId, onBack }) => {
  const [data, setData] = useState<MatchStreamsResponse | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [activeLabel, setActiveLabel] = useState<string>('DaddyLive Stream');
  const [loading, setLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchMatchStreams(matchId)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        const firstStream = res.streams && res.streams[0];
        const url = firstStream?.embed_url || res.auto_embed_url || '';
        setActiveUrl(url);
        setActiveLabel(firstStream?.name || 'Link - 1 (DaddyLive)');
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [matchId]);

  const streams = data?.streams || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => {
            if (onBack) onBack();
            else window.location.hash = '#/sports';
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs font-mono text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sports</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>DADDYLIVE STREAM</span>
          </div>
        </div>
      </div>

      {/* 16:9 Sport Player Viewport */}
      {/* CRITICAL: Do NOT add sandbox attribute to sports iframe */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-panel bg-black border border-white/10 shadow-2xl">
        <iframe
          key={`${activeUrl}-${reloadKey}`}
          src={activeUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>

      {/* Server & Stream Switcher */}
      <div className="mt-4 p-4 rounded-xl glass-panel bg-zinc-950/60 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#C5F36A]" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Active Server: <span className="text-[#C5F36A] font-semibold">{activeLabel}</span>
            </span>
          </div>

          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload Player"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Stream</span>
          </button>
        </div>

        {/* Server Selection Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {streams.map((stream, idx) => {
            const isOnline = !!stream.online;
            const label = stream.name || stream.source || `Server ${idx + 1}`;
            const isSelected = activeUrl === stream.embed_url;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveUrl(stream.embed_url);
                  setActiveLabel(label);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[#C5F36A] text-black font-semibold shadow-md shadow-[#C5F36A]/20'
                    : 'glass-pill text-zinc-300 hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-400' : 'bg-zinc-500'
                  }`}
                />
                <span>{label}</span>
              </button>
            );
          })}

          {!loading && streams.length === 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 py-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Connecting to live stream...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
