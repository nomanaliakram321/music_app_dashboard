import album1 from '../assets/images/albumb_1.png';
import album2 from '../assets/images/albumb_2.png';
import album3 from '../assets/images/albumb_3.png';
import album5 from '../assets/images/albumb_5.png';
import album4 from '../assets/images/albumb_6.png';
import album6 from '../assets/images/albumb_6.png';
export const BADGE_VARIANTS = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
} as const;

export type BadgeVariant = keyof typeof BADGE_VARIANTS;
export const BROWSE_TABS = ['Genre & Moods', 'Podcast', 'New Release', 'Chart'] as const;

export const RADIO_STATIONS = [
  { name: 'Home Radio', seed: 'HomeRadio1', bg: 'bg-theme-primary', image: album3 },
  { name: 'Broadcast Radio', seed: 'BroadcastRadio1', bg: 'bg-theme-coral', image: album2 },
  { name: 'Home Radio', seed: 'HomeRadio2', bg: 'bg-theme-primary', image: album4 },
  { name: 'Space Radio', seed: 'SpaceRadio', bg: 'bg-theme-primary', image: album5 },
  { name: 'Broadcast Radio', seed: 'BroadcastRadio2', bg: 'bg-gray-600', image: album6 },
];

export const GENRES = [
  { name: 'Pop', seed: 'Pop', gradient: 'from-green-300/60 to-green-900/80', image: album1 },
  { name: 'Mood', seed: 'Mood', gradient: 'from-yellow-400/40 to-emerald-900/80', image: album2 },
  { name: 'Karaoke', seed: 'Karaoke', gradient: 'from-red-400/60 to-red-900/80', image: album3 },
  { name: 'Country', seed: 'Country', gradient: 'from-gray-700/60 to-gray-900/80', image: album4 },
  { name: 'Romance', seed: 'Romance', gradient: 'from-purple-600/60 to-rose-900/80', image: album5 },
  { name: 'Focus', seed: 'Focus', gradient: 'from-gray-600/60 to-gray-900/80', image: album6 },
];

export const ALBUMS = [
  { title: 'Breathe', artist: 'Sad Boy', year: '2024', songs: 12, image: album1 },
  { title: 'Indigo', artist: 'Town Hall', year: '2023', songs: 10, image: album2 },
  { title: 'Above The Sky', artist: 'Exit View', year: '2024', songs: 8, image: album3 },
  { title: 'Midnight Run', artist: 'Luna Wave', year: '2023', songs: 14, image: album4 },
  { title: 'Golden Hour', artist: 'Amber Skies', year: '2024', songs: 11, image: album5 },
  { title: 'Echoes', artist: 'Deep Current', year: '2023', songs: 9, image: album6 },
];

export const ARTISTS = [
  { name: 'Sad Boy', followers: '1.2M', image: album1 },
  { name: 'Town Hall', followers: '890K', image: album2 },
  { name: 'Exit View', followers: '2.1M', image: album3 },
  { name: 'Luna Wave', followers: '456K', image: album4 },
  { name: 'Amber Skies', followers: '3.4M', image: album5 },
  { name: 'Deep Current', followers: '678K', image: album6 },
];
