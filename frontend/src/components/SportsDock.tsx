import React from 'react';

export type SportCategory = 'all' | 'soccer' | 'combat' | 'basketball' | 'golf' | 'tennis';

interface SportsDockProps {
  selectedSport: SportCategory;
  onSelectSport: (sport: SportCategory) => void;
}

export const SportsDock: React.FC<SportsDockProps> = ({
  selectedSport,
  onSelectSport,
}) => {
  const sports = [
    {
      id: 'all' as SportCategory,
      name: 'All Sports',
      icon: (
        // Trophy Icon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      ),
    },
    {
      id: 'soccer' as SportCategory,
      name: 'Football / Soccer',
      icon: (
        // Soccer ball
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <circle cx="12" cy="12" r="10" />
          <path d="m12 7 3.5 2.5v4.5L12 16.5 8.5 14V9.5z" />
          <path d="M12 2v5" />
          <path d="M21.5 8.5 17.5 10" />
          <path d="M19 19.5 15.5 16.5" />
          <path d="M5 19.5 8.5 16.5" />
          <path d="M2.5 8.5 6.5 10" />
        </svg>
      ),
    },
    {
      id: 'combat' as SportCategory,
      name: 'UFC & Combat Sports',
      icon: (
        // Boxing glove / fist
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M5 11V6a3 3 0 0 1 6 0v5" />
          <path d="M11 7.5A2.5 2.5 0 0 1 16 9v2" />
          <path d="M16 9.5A2 2 0 0 1 20 11v4a6 6 0 0 1-6 6H9a5 5 0 0 1-5-5v-5a3 3 0 0 1 6 0" />
        </svg>
      ),
    },
    {
      id: 'basketball' as SportCategory,
      name: 'Basketball',
      icon: (
        // Basketball lines
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <circle cx="12" cy="12" r="10" />
          <path d="M2.1 10.5a13 13 0 0 0 19.8 0" />
          <path d="M2.1 13.5a13 13 0 0 1 19.8 0" />
          <path d="M12 2v20" />
        </svg>
      ),
    },
    {
      id: 'tennis' as SportCategory,
      name: 'Tennis',
      icon: (
        // Tennis ball curve
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <circle cx="12" cy="12" r="10" />
          <path d="M6 3.5a10 10 0 0 1 14.5 14.5" />
          <path d="M3.5 18A10 10 0 0 1 18 3.5" />
        </svg>
      ),
    },
    {
      id: 'golf' as SportCategory,
      name: 'Golf',
      icon: (
        // Golf flag and hole
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 2v20" />
          <path d="M12 4l6 3.5L12 11" />
          <path d="M6 20a6 2 0 1 0 12 0 6 2 0 1 0-12 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center py-6 px-4">
      <div className="flex items-center gap-3 sm:gap-4 p-2 rounded-2xl glass-panel bg-zinc-950/60 shadow-2xl overflow-x-auto no-scrollbar">
        {sports.map((sport) => {
          const isActive = selectedSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              title={sport.name}
              className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 select-none flex-shrink-0 group ${
                isActive
                  ? 'bg-zinc-800 text-[#C5F36A] border-2 border-[#C5F36A] shadow-lg shadow-[#C5F36A]/20 scale-105'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="transform transition-transform duration-200 group-hover:scale-110">
                {sport.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
