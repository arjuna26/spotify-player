import { SPOTIFY_CONFIG, STORAGE_KEYS } from '../config/spotify';
import { getAccessToken } from './auth';

// Types for Spotify API responses
export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: {
    total: number;
  };
  country: string;
  product: string;
  external_urls: {
    spotify: string;
  };
}

export interface CurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  currently_playing_type: string;
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface TopTracksResponse {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayedItem[];
  cursors?: {
    after: string;
    before: string;
  };
}

// Generic fetch wrapper with auth; handles 429 with Retry-After (Spotify rate limits)
async function spotifyFetch<T>(endpoint: string, retryCount = 0): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${SPOTIFY_CONFIG.apiBaseUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 204) {
    return null;
  }

  if (response.status === 429 && retryCount < 1) {
    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '5', 10);
    const waitMs = Math.min(retryAfter * 1000, 10000);
    await new Promise((r) => setTimeout(r, waitMs));
    return spotifyFetch<T>(endpoint, retryCount + 1);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = error.error?.message ?? `API error: ${response.status}`;
    throw new Error(msg);
  }

  return response.json();
}

// Get current user profile
export async function getCurrentUser(): Promise<SpotifyUser | null> {
  return spotifyFetch<SpotifyUser>('/me');
}

// Get user's top tracks
export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export async function getTopTracks(
  timeRange: TimeRange = 'medium_term',
  limit: number = 20
): Promise<SpotifyTrack[]> {
  const response = await spotifyFetch<TopTracksResponse>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );
  return response?.items || [];
}

// Get user's top artists
export async function getTopArtists(
  timeRange: TimeRange = 'medium_term',
  limit: number = 20
): Promise<SpotifyArtist[]> {
  const response = await spotifyFetch<{ items: SpotifyArtist[] }>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  );
  return response?.items || [];
}

// Get currently playing track
export async function getCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
  try {
    return await spotifyFetch<CurrentlyPlaying>('/me/player/currently-playing');
  } catch {
    return null;
  }
}

// Get recently played tracks
export async function getRecentlyPlayed(limit: number = 20): Promise<RecentlyPlayedItem[]> {
  const response = await spotifyFetch<RecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`
  );
  
  const items = response?.items || [];
  
  // Cache recently played for offline viewing
  if (items.length > 0) {
    localStorage.setItem(
      STORAGE_KEYS.recentlyPlayed,
      JSON.stringify({
        items,
        timestamp: Date.now(),
      })
    );
  }
  
  return items;
}

// Get cached recently played (for offline or quick loading)
export function getCachedRecentlyPlayed(): RecentlyPlayedItem[] {
  const cached = localStorage.getItem(STORAGE_KEYS.recentlyPlayed);
  if (!cached) return [];
  
  try {
    const { items, timestamp } = JSON.parse(cached);
    // Cache valid for 1 hour
    if (Date.now() - timestamp < 3600000) {
      return items;
    }
  } catch {
    // Invalid cache
  }
  
  return [];
}

// Format milliseconds to mm:ss
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get time range display name
export function getTimeRangeLabel(range: TimeRange): string {
  switch (range) {
    case 'short_term':
      return 'Last 4 Weeks';
    case 'medium_term':
      return 'Last 6 Months';
    case 'long_term':
      return 'All Time';
  }
}
