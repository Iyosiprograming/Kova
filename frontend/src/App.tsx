import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SpotlightSearch } from './components/SpotlightSearch';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TvShows } from './pages/TvShows';
import { Details } from './pages/Details';
import { Sports } from './pages/Sports';
import { Watch } from './pages/Watch';
import { WatchlistPage } from './pages/Watchlist';
export const App: React.FC = () => {
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash || '#/');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Heartbeat ping to keep background backend alive while tab/browser is open
  useEffect(() => {
    const sendHeartbeat = () => {
      fetch('/api/heartbeat', { method: 'POST', keepalive: true }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute active navigation tab
  const getActiveTab = (): string => {
    if (currentHash.startsWith('#/movies')) return 'movies';
    if (currentHash.startsWith('#/tv')) return 'tv';
    if (currentHash.startsWith('#/sports')) return 'sports';
    if (currentHash.startsWith('#/watchlist')) return 'watchlist';
    return 'home';
  };

  // Route dispatcher
  const renderContent = () => {
    const hash = currentHash;

    // Watchlist Page: #/watchlist
    if (hash.startsWith('#/watchlist')) {
      return <WatchlistPage />;
    }

    // Sports Watch: #/sports/watch/:id
    if (hash.startsWith('#/sports/watch/')) {
      const matchId = hash.replace('#/sports/watch/', '').split('?')[0];
      return <Watch mediaType="sports" id={matchId} />;
    }

    // VOD Watch: #/watch/:type/:id or #/watch/series/:id/:season/:episode
    if (hash.startsWith('#/watch/')) {
      const parts = hash.replace('#/watch/', '').split('/');
      const mediaType = (parts[0] || 'movie') as 'movie' | 'series';
      const id = parts[1] || '';
      const season = parts[2] ? parseInt(parts[2], 10) : 1;
      const episode = parts[3] ? parseInt(parts[3], 10) : 1;
      return <Watch mediaType={mediaType} id={id} season={season} episode={episode} />;
    }

    // Details: #/details/:type/:id
    if (hash.startsWith('#/details/')) {
      const parts = hash.replace('#/details/', '').split('/');
      const mediaType = (parts[0] || 'movie') as 'movie' | 'series';
      const id = parts[1] || '';
      return <Details mediaType={mediaType} imdbId={id} />;
    }

    // Tabs
    if (hash.startsWith('#/movies')) return <Movies />;
    if (hash.startsWith('#/tv')) return <TvShows />;
    if (hash.startsWith('#/sports')) return <Sports />;

    return <Home />;
  };

  return (
    <div className="min-h-screen bg-[#0D0F15] text-zinc-100 flex flex-col font-sans">
      <Navbar
        activeTab={getActiveTab()}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 w-full">
        {renderContent()}
      </main>

      {/* Global Spotlight Search Modal */}
      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/5 py-8 px-6 text-center text-xs font-mono text-zinc-600">
        <span>KOVA • Local Desktop Streaming • Stremio Cinemeta & EmbedSE</span>
      </footer>
    </div>
  );
};
