import { motion } from 'motion/react';
import ProfileHeader from './ProfileHeader';
import CurrentlyPlaying from './CurrentlyPlaying';
import TopTracks from './TopTracks';
import RecentlyPlayed from './RecentlyPlayed';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(33, 14, 53, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Currently Playing & Top Tracks */}
          <div className="lg:col-span-2 space-y-8">
            <CurrentlyPlaying />
            <TopTracks />
          </div>

          {/* Right Column - Recently Played */}
          <div className="lg:col-span-1">
            <RecentlyPlayed />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-[rgba(138,43,226,0.1)] text-center"
        >
          <p className="text-[#52525b] text-sm">
            Built with{' '}
            <a 
              href="https://developer.spotify.com/documentation/web-api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1DB954] hover:text-[#1ed760] hover:underline transition-colors"
            >
              Spotify Web API
            </a>
            {' '}&{' '}
            <a 
              href="https://reactbits.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#8A2BE2] hover:text-[#a855f7] hover:underline transition-colors"
            >
              React Bits
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
