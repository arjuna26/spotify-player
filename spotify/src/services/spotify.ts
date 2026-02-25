import { SPOTIFY_CONFIG } from '../config/spotify';
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
  genres?: string[];
  followers?: {
    total: number;
  };
  popularity?: number;
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
  popularity: number;
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

export interface TopTracksResponse {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
}

export interface TopArtistsResponse {
  items: SpotifyArtist[];
  total: number;
  limit: number;
  offset: number;
}

export interface PlayHistoryItem {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    uri: string;
  } | null;
}

export interface RecentlyPlayedResponse {
  items: PlayHistoryItem[];
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
}
  
export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

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

  if (response.status === 429 && retryCount < 3) {
    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '2', 10);
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

// Get currently playing track
export async function getCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
  try {
    return await spotifyFetch<CurrentlyPlaying>('/me/player/currently-playing');
  } catch {
    return null;
  }
}

// Format milliseconds to mm:ss
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get user's top tracks
export async function getTopTracks(
  timeRange: TimeRange = 'medium_term',
  limit: number = 10
): Promise<TopTracksResponse | null> {
  try {
    return await spotifyFetch<TopTracksResponse>(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
  } catch {
    return null;
  }
}

// Get user's top artists
export async function getTopArtists(
  timeRange: TimeRange = 'medium_term',
  limit: number = 10
): Promise<TopArtistsResponse | null> {
  try {
    return await spotifyFetch<TopArtistsResponse>(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
  } catch {
    return null;
  }
}

// Get recently played tracks
export async function getRecentlyPlayed(
  limit: number = 20
): Promise<RecentlyPlayedResponse | null> {
  try {
    return await spotifyFetch<RecentlyPlayedResponse>(
      `/me/player/recently-played?limit=${limit}`
    );
  } catch {
    return null;
  }
}


// Format relative time (e.g., "2 min ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

