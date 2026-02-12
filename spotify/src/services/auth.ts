import { SPOTIFY_CONFIG, STORAGE_KEYS } from '../config/spotify';

// Generate a random string for PKCE code verifier
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// Generate SHA-256 hash for PKCE code challenge
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

// Base64 URL encode
function base64urlencode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Generate PKCE code challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64urlencode(hashed);
}

// Initiate Spotify login with PKCE
export async function initiateSpotifyLogin(): Promise<void> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store code verifier for later use
  localStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
  
  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    scope: SPOTIFY_CONFIG.scopes,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  
  window.location.href = `${SPOTIFY_CONFIG.authEndpoint}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<boolean> {
  const codeVerifier = localStorage.getItem(STORAGE_KEYS.codeVerifier);
  
  if (!codeVerifier) {
    console.error('No code verifier found. The authorization code may have already been used or expired.');
    return false;
  }
  
  try {
    const response = await fetch(SPOTIFY_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CONFIG.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      // If invalid_grant, the code was already used or expired - clean up
      if (error.error === 'invalid_grant') {
        localStorage.removeItem(STORAGE_KEYS.codeVerifier);
      }
      
      // Don't log to console if it's just a duplicate request
      if (error.error !== 'invalid_grant' || !isAuthenticated()) {
        console.error('Token exchange failed:', error);
      }
      
      return false;
    }
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    }
    
    // Calculate and store expiry time
    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiryTime.toString());
    
    // Clean up code verifier only after successful exchange
    localStorage.removeItem(STORAGE_KEYS.codeVerifier);
    
    return true;
  } catch (error) {
    console.error('Token exchange error:', error);
    return false;
  }
}

// Refresh the access token
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch(SPOTIFY_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CONFIG.clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    }
    
    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

// Get current access token, refreshing if necessary
export async function getAccessToken(): Promise<string | null> {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  const expiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired or about to expire (5 min buffer)
  if (expiry && Date.now() > parseInt(expiry) - 300000) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }
  
  return token;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  const expiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
  
  if (!token || !expiry) {
    return false;
  }
  
  return Date.now() < parseInt(expiry);
}

// Logout - clear all stored data
export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.tokenExpiry);
  localStorage.removeItem(STORAGE_KEYS.codeVerifier);
  // Keep recently played cache for better UX on re-login
}
