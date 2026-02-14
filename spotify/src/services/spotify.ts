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

