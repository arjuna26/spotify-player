import { motion } from 'motion/react';
import CurrentlyPlaying from './CurrentlyPlaying';
import RecentlyPlayed from './RecentlyPlayed';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1DB954]" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span className="text-white font-semibold text-sm hidden sm:block">Spotify Analytics</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <a 
                href={user.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                {user.images?.[0]?.url ? (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs font-medium">{user.display_name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <span className="text-sm hidden sm:block">{user.display_name}</span>
              </a>
            )}
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Currently Playing - Hero Section */}
          <CurrentlyPlaying />

          {/* Recently Played */}
          <RecentlyPlayed />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="pt-6 border-t border-zinc-900">
          <p className="text-zinc-600 text-xs text-center">
            Data from{' '}
            <a 
              href="https://developer.spotify.com/documentation/web-api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Spotify Web API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
