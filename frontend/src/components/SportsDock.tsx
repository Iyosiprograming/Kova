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
        // Realistic Trophy
        <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
          <defs>
            <linearGradient id="trophyGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF385" />
              <stop offset="50%" stopColor="#F5B800" />
              <stop offset="100%" stopColor="#B37800" />
            </linearGradient>
            <linearGradient id="trophyBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A4F55" />
              <stop offset="100%" stopColor="#1E2024" />
            </linearGradient>
          </defs>
          {/* Handles */}
          <path d="M10 12C6 12 5 20 12 24C14 25.1 16 24 16 24" fill="none" stroke="url(#trophyGold)" strokeWidth="3" strokeLinecap="round" />
          <path d="M38 12C42 12 43 20 36 24C34 25.1 32 24 32 24" fill="none" stroke="url(#trophyGold)" strokeWidth="3" strokeLinecap="round" />
          {/* Cup */}
          <path d="M14 8H34V22C34 28 29.5 32 24 32C18.5 32 14 28 14 22V8Z" fill="url(#trophyGold)" />
          {/* Stem & Base */}
          <path d="M22 32H26V38H22Z" fill="url(#trophyGold)" />
          <path d="M16 38H32L34 43H14L16 38Z" fill="url(#trophyBase)" stroke="#F5B800" strokeWidth="1" />
          {/* Star Emblem */}
          <polygon points="24,14 25.5,18 30,18.5 26.5,21.5 27.5,26 24,23.5 20.5,26 21.5,21.5 18,18.5 22.5,18" fill="#FFF" opacity="0.9" />
        </svg>
      ),
    },
    {
      id: 'soccer' as SportCategory,
      name: 'Football / Soccer',
      icon: (
        // Realistic Soccer Ball
        <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
          <defs>
            <radialGradient id="soccerGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#soccerGrad)" stroke="#1E293B" strokeWidth="1.5" />
          {/* Center Pentagon */}
          <polygon points="24,17 30,21 28,28 20,28 18,21" fill="#0F172A" />
          {/* Connecting Seams & Edge Patches */}
          <path d="M24 17L24 7" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M30 21L39 17" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M28 28L36 36" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M20 28L12 36" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M18 21L9 17" stroke="#0F172A" strokeWidth="1.5" />
          {/* Edge patches */}
          <polygon points="21,5 27,5 29,8 24,10 19,8" fill="#0F172A" />
          <polygon points="41,14 44,19 41,25 36,21" fill="#0F172A" />
          <polygon points="7,14 4,19 7,25 12,21" fill="#0F172A" />
          <polygon points="34,39 39,37 42,41 36,44" fill="#0F172A" />
          <polygon points="14,39 9,37 6,41 12,44" fill="#0F172A" />
        </svg>
      ),
    },
    {
      id: 'combat' as SportCategory,
      name: 'UFC & Combat Sports',
      icon: (
        // Realistic Boxing / MMA Glove
        <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
          <defs>
            <linearGradient id="gloveRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="60%" stopColor="#D90429" />
              <stop offset="100%" stopColor="#7A0012" />
            </linearGradient>
            <linearGradient id="gloveStrap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          {/* Main glove padding */}
          <path
            d="M12 18C12 10 19 6 28 6C35 6 40 11 40 18C40 25 36 32 30 34L17 34C13 32 12 25 12 18Z"
            fill="url(#gloveRed)"
          />
          {/* Thumb */}
          <path
            d="M12 18C10 18 6 22 8 28C10 32 15 32 17 29L16 22C16 19 14 18 12 18Z"
            fill="#B9001D"
          />
          {/* Wrist cuff & strap */}
          <rect x="15" y="34" width="18" height="8" rx="2" fill="url(#gloveStrap)" stroke="#0F172A" strokeWidth="1" />
          <line x1="16" y1="38" x2="32" y2="38" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />
          {/* Highlight glare */}
          <path d="M22 10C27 10 33 13 35 18" stroke="#FFA3A3" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      ),
    },
    {
      id: 'basketball' as SportCategory,
      name: 'Basketball',
      icon: (
        // Realistic Basketball
        <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
          <defs>
            <radialGradient id="bballGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FF8A3D" />
              <stop offset="65%" stopColor="#E65100" />
              <stop offset="100%" stopColor="#BF360C" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#bballGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Black Seams */}
          <line x1="4" y1="24" x2="44" y2="24" stroke="#1A1A1A" strokeWidth="2" />
          <line x1="24" y1="4" x2="24" y2="44" stroke="#1A1A1A" strokeWidth="2" />
          <path d="M10 8C18 16 18 32 10 40" stroke="#1A1A1A" strokeWidth="2" fill="none" />
          <path d="M38 8C30 16 30 32 38 40" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        </svg>
      ),
    },
    {
      id: 'tennis' as SportCategory,
      name: 'Tennis',
      icon: (
        // Realistic Tennis Ball
        <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
          <defs>
            <radialGradient id="tennisGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#E6FF55" />
              <stop offset="65%" stopColor="#CCEF00" />
              <stop offset="100%" stopColor="#99B800" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#tennisGrad)" />
          {/* White Curving Seams */}
          <path
            d="M7 16C16 19 22 29 20 42"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M41 32C32 29 26 19 28 6"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ),
    },
    {
      id: 'golf' as SportCategory,
      name: 'Golf',
      icon: (
        // Realistic Golf Ball on Tee with Flag
        <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
          <defs>
            <radialGradient id="golfGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>
          </defs>
          {/* Green Fairway Mound */}
          <ellipse cx="24" cy="42" rx="18" ry="4" fill="#15803D" />
          {/* Red Tee */}
          <polygon points="22,34 26,34 24.8,42 23.2,42" fill="#EF4444" />
          {/* Dimpled Golf Ball */}
          <circle cx="24" cy="22" r="13" fill="url(#golfGrad)" stroke="#94A3B8" strokeWidth="0.5" />
          {/* Subtle dimples */}
          <circle cx="20" cy="18" r="1" fill="#94A3B8" opacity="0.6" />
          <circle cx="25" cy="16" r="1" fill="#94A3B8" opacity="0.6" />
          <circle cx="28" cy="20" r="1" fill="#94A3B8" opacity="0.6" />
          <circle cx="23" cy="22" r="1" fill="#94A3B8" opacity="0.6" />
          <circle cx="18" cy="23" r="1" fill="#94A3B8" opacity="0.6" />
          <circle cx="22" cy="27" r="1" fill="#94A3B8" opacity="0.6" />
          <circle cx="27" cy="26" r="1" fill="#94A3B8" opacity="0.6" />
          {/* Pin Flag */}
          <line x1="36" y1="10" x2="36" y2="42" stroke="#E2E8F0" strokeWidth="1.5" />
          <polygon points="36,10 44,14 36,18" fill="#DC2626" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center py-6 px-4">
      <div className="flex items-center gap-3 sm:gap-4 p-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-2xl overflow-x-auto no-scrollbar backdrop-blur-xl">
        {sports.map((sport) => {
          const isActive = selectedSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              title={sport.name}
              className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 select-none flex-shrink-0 group ${
                isActive
                  ? 'bg-zinc-800/90 border-2 border-[#C5F36A] shadow-xl shadow-[#C5F36A]/20 scale-105'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <div className="transform transition-transform duration-200 group-hover:scale-115">
                {sport.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
