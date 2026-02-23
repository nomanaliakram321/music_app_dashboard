import { Download, Globe, Headphones, Heart, History, Home, Music, Radio, UserRound } from 'lucide-react';

export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  BROWSE: '/browse',
  RADIO: '/radio',
  ARTIST: '/artist',
  ALBUMS: '/albums',
  RECENTLY_PLAYED: '/recently-played',
  FAVOURITE: '/favourite',
  DOWNLOADED: '/downloaded',
  PLAYLIST: '/playlist',
};

export const NAV_ITEMS = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Browse', icon: Globe, to: '/browse' },
  { label: 'Radio', icon: Radio, to: '/radio' },
  { label: 'Artist', icon: UserRound, to: '/artist' },
  { label: 'Albums', icon: Music, to: '/albums' },
];

export const MUSIC_ITEMS = [
  { label: 'Recently Played', icon: History, to: '/recently-played' },
  { label: 'Favourite', icon: Heart, to: '/favourite' },
  { label: 'Downloaded', icon: Download, to: '/downloaded' },
];

export const PLAYLIST_ITEMS = [
  { label: 'Workout', icon: Music, to: '/playlist/workout' },
  { label: 'Yoga', icon: Music, to: '/playlist/yoga' },
  { label: 'Commute', icon: Headphones, to: '/playlist/commute' },
];
