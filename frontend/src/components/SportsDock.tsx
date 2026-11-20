import React from 'react';

export type SportCategory =
  | 'all'
  | 'soccer'
  | 'cricket'
  | 'nba'
  | 'nfl'
  | 'tennis'
  | 'formula1'
  | 'motogp'
  | 'mlb'
  | 'boxing'
  | 'ufc';

interface SportsDockProps {
  selectedSport: SportCategory;
  onSelectSport: (sport: SportCategory) => void;
}

export const SportsDock: React.FC<SportsDockProps> = ({
  selectedSport,
  onSelectSport,
}) => {
  const sports: { id: SportCategory; name: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      name: 'All Sports',
      icon: (
        // Realistic Golden Trophy
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
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
          <path d="M10 12C6 12 5 20 12 24C14 25.1 16 24 16 24" fill="none" stroke="url(#trophyGold)" strokeWidth="3" strokeLinecap="round" />
          <path d="M38 12C42 12 43 20 36 24C34 25.1 32 24 32 24" fill="none" stroke="url(#trophyGold)" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 8H34V22C34 28 29.5 32 24 32C18.5 32 14 28 14 22V8Z" fill="url(#trophyGold)" />
          <path d="M22 32H26V38H22Z" fill="url(#trophyGold)" />
          <path d="M16 38H32L34 43H14L16 38Z" fill="url(#trophyBase)" stroke="#F5B800" strokeWidth="1" />
          <polygon points="24,14 25.5,18 30,18.5 26.5,21.5 27.5,26 24,23.5 20.5,26 21.5,21.5 18,18.5 22.5,18" fill="#FFF" opacity="0.9" />
        </svg>
      ),
    },
    {
      id: 'soccer',
      name: 'Soccer',
      icon: (
        // Realistic Soccer Ball
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <radialGradient id="soccerGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#soccerGrad)" stroke="#1E293B" strokeWidth="1.5" />
          <polygon points="24,17 30,21 28,28 20,28 18,21" fill="#0F172A" />
          <path d="M24 17L24 7" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M30 21L39 17" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M28 28L36 36" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M20 28L12 36" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M18 21L9 17" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="21,5 27,5 29,8 24,10 19,8" fill="#0F172A" />
          <polygon points="41,14 44,19 41,25 36,21" fill="#0F172A" />
          <polygon points="7,14 4,19 7,25 12,21" fill="#0F172A" />
        </svg>
      ),
    },
    {
      id: 'cricket',
      name: 'Cricket',
      icon: (
        // Cricket Bat & Red Seam Ball
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <linearGradient id="batWood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5D0A9" />
              <stop offset="50%" stopColor="#D4A373" />
              <stop offset="100%" stopColor="#A97142" />
            </linearGradient>
            <radialGradient id="cricketBall" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="70%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </radialGradient>
          </defs>
          {/* Bat handle */}
          <rect x="10" y="8" width="4" height="12" rx="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" transform="rotate(-35 12 14)" />
          {/* Bat blade */}
          <rect x="14" y="16" width="10" height="24" rx="2" fill="url(#batWood)" stroke="#78350F" strokeWidth="1.2" transform="rotate(-35 19 28)" />
          {/* Cricket Ball */}
          <circle cx="34" cy="34" r="8" fill="url(#cricketBall)" stroke="#450A0A" strokeWidth="1" />
          {/* White seam */}
          <path d="M28 34C31 31 37 31 40 34" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="1.5 1" fill="none" />
        </svg>
      ),
    },
    {
      id: 'nba',
      name: 'NBA',
      icon: (
        // Realistic Basketball
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <radialGradient id="bballGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FF8A3D" />
              <stop offset="65%" stopColor="#E65100" />
              <stop offset="100%" stopColor="#BF360C" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#bballGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="4" y1="24" x2="44" y2="24" stroke="#1A1A1A" strokeWidth="2" />
          <line x1="24" y1="4" x2="24" y2="44" stroke="#1A1A1A" strokeWidth="2" />
          <path d="M10 8C18 16 18 32 10 40" stroke="#1A1A1A" strokeWidth="2" fill="none" />
          <path d="M38 8C30 16 30 32 38 40" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        </svg>
      ),
    },
    {
      id: 'nfl',
      name: 'NFL',
      icon: (
        // Realistic American Football
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <linearGradient id="nflLeather" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A0522D" />
              <stop offset="50%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#5C2E0B" />
            </linearGradient>
          </defs>
          {/* Prolate Spheroid */}
          <path
            d="M8 24C12 12 36 12 40 24C36 36 12 36 8 24Z"
            fill="url(#nflLeather)"
            stroke="#3E1C04"
            strokeWidth="1.5"
            transform="rotate(-25 24 24)"
          />
          {/* White laces */}
          <line x1="18" y1="24" x2="30" y2="24" stroke="#FFF" strokeWidth="2" strokeLinecap="round" transform="rotate(-25 24 24)" />
          <line x1="21" y1="21" x2="21" y2="27" stroke="#FFF" strokeWidth="1.5" transform="rotate(-25 24 24)" />
          <line x1="24" y1="21" x2="24" y2="27" stroke="#FFF" strokeWidth="1.5" transform="rotate(-25 24 24)" />
          <line x1="27" y1="21" x2="27" y2="27" stroke="#FFF" strokeWidth="1.5" transform="rotate(-25 24 24)" />
        </svg>
      ),
    },
    {
      id: 'tennis',
      name: 'Tennis',
      icon: (
        // Tennis Ball
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <radialGradient id="tennisGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#E6FF55" />
              <stop offset="65%" stopColor="#CCEF00" />
              <stop offset="100%" stopColor="#99B800" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#tennisGrad)" />
          <path d="M7 16C16 19 22 29 20 42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M41 32C32 29 26 19 28 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      ),
    },
    {
      id: 'formula1',
      name: 'Formula 1',
      icon: (
        // Formula 1 Race Car Front Wing & Helmet
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <linearGradient id="f1Red" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF1E1E" />
              <stop offset="100%" stopColor="#B30000" />
            </linearGradient>
          </defs>
          {/* Aerodynamic Cockpit & Nose cone */}
          <polygon points="24,6 20,28 28,28" fill="url(#f1Red)" />
          <circle cx="24" cy="20" r="4.5" fill="#18181B" stroke="#EF4444" strokeWidth="1" />
          {/* Front Wing */}
          <rect x="8" y="8" width="32" height="4" rx="2" fill="#27272A" stroke="#DC2626" strokeWidth="1" />
          {/* Wheels */}
          <rect x="5" y="16" width="6" height="14" rx="2" fill="#09090B" stroke="#52525B" strokeWidth="1" />
          <rect x="37" y="16" width="6" height="14" rx="2" fill="#09090B" stroke="#52525B" strokeWidth="1" />
          {/* Rear Wing */}
          <rect x="12" y="34" width="24" height="5" rx="1.5" fill="#EF4444" />
        </svg>
      ),
    },
    {
      id: 'motogp',
      name: 'MotoGP',
      icon: (
        // Racing Motorcycle
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <linearGradient id="motoBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="12" cy="30" r="9" fill="#18181B" stroke="#64748B" strokeWidth="2.5" />
          <circle cx="36" cy="30" r="9" fill="#18181B" stroke="#64748B" strokeWidth="2.5" />
          {/* Chassis & Fairing */}
          <path d="M12 30L22 18L30 18L36 30L24 28Z" fill="url(#motoBlue)" stroke="#0369A1" strokeWidth="1.5" />
          {/* Rider Helmet */}
          <circle cx="26" cy="12" r="4" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
          <path d="M26 12L31 15" stroke="#000" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'mlb',
      name: 'MLB',
      icon: (
        // Baseball
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <radialGradient id="mlbBall" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#mlbBall)" stroke="#94A3B8" strokeWidth="1" />
          {/* Red curved stitches */}
          <path d="M14 8C20 18 20 30 14 40" stroke="#DC2626" strokeWidth="2" strokeDasharray="2 1.5" fill="none" />
          <path d="M34 8C28 18 28 30 34 40" stroke="#DC2626" strokeWidth="2" strokeDasharray="2 1.5" fill="none" />
        </svg>
      ),
    },
    {
      id: 'boxing',
      name: 'Boxing',
      icon: (
        // Red Boxing Glove
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <linearGradient id="gloveRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="60%" stopColor="#D90429" />
              <stop offset="100%" stopColor="#7A0012" />
            </linearGradient>
          </defs>
          <path d="M12 18C12 10 19 6 28 6C35 6 40 11 40 18C40 25 36 32 30 34L17 34C13 32 12 25 12 18Z" fill="url(#gloveRed)" />
          <path d="M12 18C10 18 6 22 8 28C10 32 15 32 17 29L16 22C16 19 14 18 12 18Z" fill="#B9001D" />
          <rect x="15" y="34" width="18" height="8" rx="2" fill="#F1F5F9" stroke="#0F172A" strokeWidth="1" />
          <line x1="16" y1="38" x2="32" y2="38" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      id: 'ufc',
      name: 'UFC',
      icon: (
        // MMA Octagon & Black Fighter Glove
        <svg viewBox="0 0 48 48" className="w-7 h-7 drop-shadow">
          <defs>
            <linearGradient id="ufcGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          {/* Octagon Mat */}
          <polygon
            points="14,4 34,4 44,14 44,34 34,44 14,44 4,34 4,14"
            fill="#18181B"
            stroke="url(#ufcGold)"
            strokeWidth="2"
          />
          {/* Inner Octagon */}
          <polygon
            points="16,8 32,8 40,16 40,32 32,40 16,40 8,32 8,16"
            fill="none"
            stroke="#3F3F46"
            strokeWidth="1"
          />
          {/* Bold UFC Gold letters */}
          <text x="24" y="28" fill="url(#ufcGold)" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
            UFC
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center py-6 px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-2xl overflow-x-auto no-scrollbar backdrop-blur-xl max-w-full">
        {sports.map((sport) => {
          const isActive = selectedSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              title={sport.name}
              className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-all duration-300 select-none flex-shrink-0 group ${
                isActive
                  ? 'bg-zinc-800/90 border-2 border-[#C5F36A] shadow-xl shadow-[#C5F36A]/20 scale-105'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <div className="transform transition-transform duration-200 group-hover:scale-115">
                {sport.icon}
              </div>
              <span className="sr-only">{sport.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
