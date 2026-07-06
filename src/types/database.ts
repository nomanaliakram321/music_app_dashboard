export interface Profile {
  id: string;
  username: string;
  role: "admin" | "editor";
  is_blocked: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  event_date: string;
  name: string;
  txt_color: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  release_date: string;
  image: string;
  diamond_card?: boolean;
  cover: string;
  color: string;
  dob: string;
  age: string;
  ranking: string | null;
  certification: string | null;
  streams: string | null;
  spotify: string | null;
  apple: string | null;
  custom_link: string | null;
  custom_link_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  album_id: string;
  name: string;
  duration: number;
  track_number: number;
  url?: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  album_id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  device_id: string;
  username: string;
  created_at: string;
  last_login: string;
}

export interface DeviceToken {
  id: string;
  user_id: string | null;
  device_id: string;
  fcm_token: string;
  platform: "ios" | "android";
  is_active: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string;
}

export interface NotificationLog {
  id: string;
  album_id: string;
  notification_type: string;
  recipient_count: number;
  success_count: number;
  failure_count: number;
  payload: object;
  created_at: string;
}
