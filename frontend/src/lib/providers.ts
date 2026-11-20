export interface VodProvider {
  id: string;
  name: string;
  buildMovieUrl: (imdbId: string) => string;
  buildTvUrl: (imdbId: string, season: number, episode: number) => string;
}

export const VOD_PROVIDERS: VodProvider[] = [
  {
    id: 'vidapi',
    name: 'Server 1 (VidAPI)',
    buildMovieUrl: (id: string) => `https://vaplayer.ru/embed/movie/${id}`,
    buildTvUrl: (id: string, s: number, e: number) => `https://vaplayer.ru/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'hnembed',
    name: 'Server 2 (HnEmbed)',
    buildMovieUrl: (id: string) => `https://hnembed.cc/embed/movie/${id}`,
    buildTvUrl: (id: string, s: number, e: number) => `https://hnembed.cc/embed/tv/${id}/${s}/${e}`,
  },
];
