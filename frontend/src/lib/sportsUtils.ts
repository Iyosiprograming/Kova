import { SportsMatch } from './api';
import { SportCategory } from '../components/SportsDock';

export function matchBelongsToCategory(match: SportsMatch, category: SportCategory): boolean {
  if (category === 'all') return true;

  const combined = [
    match.sport || '',
    match.category || '',
    match.category_slug || '',
    match.league || '',
    match.title || '',
  ].join(' ').toLowerCase();

  switch (category) {
    case 'soccer':
      return (
        combined.includes('soccer') ||
        combined.includes('foot') ||
        combined.includes('liga') ||
        combined.includes('serie') ||
        combined.includes('premier') ||
        combined.includes('coppa') ||
        combined.includes('bundes') ||
        combined.includes('eredivisie') ||
        combined.includes('fifa') ||
        combined.includes('uefa') ||
        combined.includes('champions')
      );

    case 'cricket':
      return (
        combined.includes('cricket') ||
        combined.includes('ipl') ||
        combined.includes('t20') ||
        combined.includes('odi') ||
        combined.includes('bbl') ||
        combined.includes('test match')
      );

    case 'nba':
      return (
        combined.includes('nba') ||
        combined.includes('basket') ||
        combined.includes('euroleague') ||
        combined.includes('ncaa')
      );

    case 'nfl':
      return (
        combined.includes('nfl') ||
        combined.includes('american foot') ||
        combined.includes('super bowl')
      );

    case 'tennis':
      return (
        combined.includes('tennis') ||
        combined.includes('atp') ||
        combined.includes('wta') ||
        combined.includes('wimbledon') ||
        combined.includes('open') ||
        combined.includes('roland garros')
      );

    case 'formula1':
      return (
        combined.includes('formula 1') ||
        combined.includes('formula1') ||
        combined.includes('f1') ||
        combined.includes('grand prix') ||
        combined.includes('racing')
      );

    case 'motogp':
      return (
        combined.includes('motogp') ||
        combined.includes('moto gp') ||
        combined.includes('moto2') ||
        combined.includes('moto3') ||
        combined.includes('superbike') ||
        combined.includes('motorcycle')
      );

    case 'mlb':
      return (
        combined.includes('mlb') ||
        combined.includes('baseball')
      );

    case 'boxing':
      return (
        combined.includes('boxing') ||
        combined.includes('box') ||
        combined.includes('wba') ||
        combined.includes('wbc') ||
        combined.includes('ibf') ||
        combined.includes('wbo')
      );

    case 'ufc':
      return (
        combined.includes('ufc') ||
        combined.includes('mma') ||
        combined.includes('bellator') ||
        combined.includes('pfl') ||
        combined.includes('one championship') ||
        combined.includes('cage') ||
        combined.includes('fight')
      );

    default:
      return true;
  }
}

export const CHANNEL_NETWORK_LOGOS: Record<string, string> = {
  bein: '/channels/bein.svg',
  sky: '/channels/sky.svg',
  espn: '/channels/espn.svg',
  tnt: '/channels/tnt.svg',
  fox: '/channels/fox.svg',
  fs1: '/channels/fox.svg',
  fs2: '/channels/fox.svg',
  canal: '/channels/canal.svg',
  euro: '/channels/eurosport.svg',
  dazn: '/channels/dazn.svg',
  nba: '/channels/nba.svg',
  nfl: '/channels/nfl.svg',
  hbo: '/channels/hbo.svg',
};

export function getChannelLogo(name?: string): string | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, path] of Object.entries(CHANNEL_NETWORK_LOGOS)) {
    if (lower.includes(key)) return path;
  }
  return null;
}

export function formatCountdown(startTime: number | string | undefined): string {
  if (!startTime) return 'Upcoming';
  const str = String(startTime).trim();
  if (str.toLowerCase().includes('live') || str.toLowerCase().includes('now')) {
    return 'Live';
  }

  // 1. Check if it matches HH:MM (e.g. "16:00", "19:30", "08:15") from DaddyLive (UTC)
  const timeMatch = str.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const eventHours = parseInt(timeMatch[1], 10);
    const eventMins = parseInt(timeMatch[2], 10);
    const now = new Date();

    const eventDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      eventHours,
      eventMins,
      0
    ));

    let diffMs = eventDate.getTime() - Date.now();

    // If game started within past 2.5 hours, it's currently live / playing!
    if (diffMs <= 0 && diffMs > -2.5 * 60 * 60 * 1000) {
      return 'Live (In Progress)';
    }

    // If event is more than 2.5 hours in the past today, it's scheduled for tomorrow
    if (diffMs <= -2.5 * 60 * 60 * 1000) {
      eventDate.setUTCDate(eventDate.getUTCDate() + 1);
      diffMs = eventDate.getTime() - Date.now();
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    if (totalMinutes <= 0) return 'Starting soon';

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      return `Starts in ${hours}h ${mins}m`;
    }
    return `Starts in ${mins}m`;
  }

  // 2. Parse general ISO timestamp or unix epoch
  const startMs = typeof startTime === 'string' ? new Date(startTime).getTime() : (startTime || 0) * 1000;
  if (!isNaN(startMs) && startMs > 0) {
    const diff = startMs - Date.now();
    if (diff <= 0 && diff > -2.5 * 60 * 60 * 1000) return 'Live (In Progress)';
    if (diff <= 0) return 'Starting soon';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Starts in ${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  }

  return str;
}

export function getInitials(name?: string): string {
  if (!name) return '?';
  const clean = name.replace(/[^\w\s]/g, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const PALETTES = [
  { bg1: '#1E3A8A', bg2: '#0F172A', accent: '#60A5FA' }, // Blue
  { bg1: '#991B1B', bg2: '#450A0A', accent: '#F87171' }, // Crimson
  { bg1: '#065F46', bg2: '#022C22', accent: '#34D399' }, // Emerald
  { bg1: '#581C87', bg2: '#2E1065', accent: '#C084FC' }, // Purple
  { bg1: '#854D0E', bg2: '#451A03', accent: '#FBBF24' }, // Gold / Amber
  { bg1: '#155E75', bg2: '#083344', accent: '#22D3EE' }, // Cyan
  { bg1: '#9F1239', bg2: '#4C0519', accent: '#FB7185' }, // Rose
  { bg1: '#374151', bg2: '#111827', accent: '#9CA3AF' }, // Slate
];

export function getTeamGradient(name?: string) {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}
