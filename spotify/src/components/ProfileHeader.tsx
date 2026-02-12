import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function ProfileHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const profileImage = user.images?.[0]?.url;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-[rgba(138,43,226,0.2)]"
    >
      {/* Profile Info */}
      <div className="flex items-center gap-6">
        {/* Profile Image */}
        <motion.a
          href={user.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative shrink-0"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={user.display_name}
              className="w-20 h-20 rounded-full shadow-xl ring-4 ring-[#8A2BE2]/30 ring-offset-4 ring-offset-[#141414]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#210E35] to-[#8A2BE2] flex items-center justify-center ring-4 ring-[#8A2BE2]/30 ring-offset-4 ring-offset-[#141414] shadow-xl">
              <span className="text-3xl font-bold text-white">
                {user.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#1DB954] rounded-full border-3 border-[#141414] shadow-lg" />
        </motion.a>

        {/* Name & Stats */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {user.display_name}
          </h1>
          <div className="flex items-center gap-4 text-base text-[#a1a1aa]">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              {user.followers.total.toLocaleString()} followers
            </span>
            {user.product === 'premium' && (
              <span className="px-3 py-1 bg-[#1DB954]/20 text-[#1DB954] text-sm font-semibold rounded-full border border-[#1DB954]/30">
                Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Spotify Link */}
        <motion.a
          href={user.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full text-sm transition-colors shadow-lg shadow-[#1DB954]/20"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Open Spotify
        </motion.a>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 bg-[#1C1C1C] hover:bg-[#2a2a2a] text-[#a1a1aa] hover:text-white font-semibold rounded-full text-sm transition-colors border border-[rgba(138,43,226,0.2)] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </motion.button>
      </div>
    </motion.header>
  );
}
