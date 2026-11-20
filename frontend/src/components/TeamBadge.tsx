import React, { useState } from 'react';
import { Swords, Flag, Shield } from 'lucide-react';
import { getInitials, getTeamGradient } from '../lib/sportsUtils';

interface TeamBadgeProps {
  logo?: string | null;
  name?: string;
  sport?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  logo,
  name,
  sport = '',
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const gradient = getTeamGradient(name);
  const sportLower = (sport || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-20 h-20 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }[size];

  // 1. If valid ESPN / High-Res PNG Logo is provided and hasn't errored
  if (logo && !imgFailed) {
    return (
      <div
        className={`${sizeClasses} rounded-full glass-panel flex items-center justify-center p-1.5 overflow-hidden border border-white/15 bg-zinc-900 shadow-md ${className}`}
      >
        <img
          src={logo}
          alt={name || 'Team Logo'}
          className="w-full h-full object-contain filter drop-shadow"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Local Fallback: For UFC/MMA fighters, obscure teams, or missing logos
  const isFight = sportLower.includes('ufc') || sportLower.includes('mma') || sportLower.includes('box');
  const isRacing = sportLower.includes('f1') || sportLower.includes('formula') || sportLower.includes('moto');

  return (
    <div
      style={{
        background: `radial-gradient(circle at 35% 35%, ${gradient.bg1}, ${gradient.bg2})`,
        borderColor: `${gradient.accent}55`,
      }}
      title={name || 'Team'}
      className={`${sizeClasses} rounded-full flex flex-col items-center justify-center font-mono font-bold border shadow-md relative overflow-hidden select-none flex-shrink-0 ${className}`}
    >
      {/* Subtle metallic inner rim highlight */}
      <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />

      {isFight ? (
        <Swords className={`${iconSizes} text-white/90 z-10 drop-shadow`} />
      ) : isRacing ? (
        <Flag className={`${iconSizes} text-white/90 z-10 drop-shadow`} />
      ) : initials && initials !== '?' ? (
        <span
          style={{ color: '#FFF', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
          className="font-display font-extrabold tracking-wider z-10"
        >
          {initials}
        </span>
      ) : (
        <Shield className={`${iconSizes} text-white/80 z-10 drop-shadow`} />
      )}
    </div>
  );
};
