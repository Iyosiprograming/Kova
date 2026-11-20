import React, { useState, useEffect } from 'react';
import { VodPlayer } from '../components/VodPlayer';
import { SportPlayer } from '../components/SportPlayer';
import { fetchMeta, MediaMeta } from '../lib/api';

interface WatchProps {
  mediaType: 'movie' | 'series' | 'sports';
  id: string;
  season?: number;
  episode?: number;
}

export const Watch: React.FC<WatchProps> = ({
  mediaType,
  id,
  season = 1,
  episode = 1,
}) => {
  const [meta, setMeta] = useState<MediaMeta | null>(null);

  useEffect(() => {
    if (mediaType === 'sports') return;
    fetchMeta(mediaType, id).then((data) => {
      if (data) setMeta(data);
    });
  }, [mediaType, id]);

  if (mediaType === 'sports') {
    return <SportPlayer matchId={id} />;
  }

  const title = meta?.name || meta?.title || (mediaType === 'series' ? 'TV Series' : 'Movie');
  const poster = meta?.poster;
  const episodes = meta?.videos || [];

  return (
    <VodPlayer
      imdbId={id}
      mediaType={mediaType}
      title={title}
      poster={poster}
      season={season}
      episode={episode}
      episodes={episodes}
    />
  );
};
