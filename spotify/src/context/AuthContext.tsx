import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isAuthenticated, logout as authLogout, getAccessToken } from '../services/auth';
import { getCurrentUser } from '../services/spotify';
import type { SpotifyUser } from '../services/spotify';

interface AuthContextType {
  isLoggedIn: boolean;
  user: SpotifyUser | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      setIsLoggedIn(true);
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
        // 429 = rate limited: we still have a valid token, stay logged in
        const is429 = error instanceof Error && error.message.includes('429');
        if (!is429) {
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      if (isAuthenticated()) {
        await refreshUser();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
    // Redirect to login page
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
