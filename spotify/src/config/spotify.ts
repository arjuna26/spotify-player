// Spotify API Configuration
export const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
  authEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
  apiBaseUrl: 'https://api.spotify.com/v1',
  
  // Scopes required for our app
  scopes: [
    'user-read-private',           // Read user profile
    'user-read-email',             // Read user email
    'user-top-read',               // Read user's top artists and tracks
    'user-read-recently-played',   // Read recently played tracks
    'user-read-currently-playing', // Read currently playing track
    'user-read-playback-state',    // Read playback state
  ].join(' '),
};

// Storage keys
export const STORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  tokenExpiry: 'spotify_token_expiry',
  codeVerifier: 'spotify_code_verifier',
  authState: 'spotify_auth_state',
  recentlyPlayed: 'spotify_recently_played',
};
