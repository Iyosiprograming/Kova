import React from 'react';
import { Search, Clapperboard } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onOpenSearch }) => {
  const tabs = [
    { id: 'home', label: 'Home', hash: '#/' },
    { id: 'movies', label: 'Movies', hash: '#/movies' },
    { id: 'tv', label: 'TV Shows', hash: '#/tv' },
    { id: 'sports', label: 'Sports', hash: '#/sports' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel bg-zinc-950/70 border-b border-white/10 px-6 sm:px-10 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-8">
          <a
            href="#/"
            className="flex items-center gap-2 text-2xl font-display font-bold tracking-wider text-white select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C5F36A] flex items-center justify-center text-black font-extrabold shadow-md shadow-[#C5F36A]/20 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-4 h-4 fill-current" />
            </div>
            <span className="tracking-widest">KOVA</span>
          </a>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <a
                  key={tab.id}
                  href={tab.hash}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold border border-white/15'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right: Spotlight Search Trigger Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-full glass-pill text-zinc-400 hover:text-white transition-all text-xs font-mono group"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#C5F36A] transition-colors" />
            <span className="hidden sm:inline text-zinc-400">Search titles, sports...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300 border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
