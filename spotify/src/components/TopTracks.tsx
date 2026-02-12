import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getTopTracks, 
  formatDuration,
  getTimeRangeLabel 
} from '../services/spotify';
import type { SpotifyTrack, TimeRange } from '../services/spotify';

const timeRanges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

export default function TopTracks() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const result = await getTopTracks(timeRange, 10);
        setTracks(result);
      } catch (error) {
        console.error('Failed to fetch top tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [timeRange]);

  // Mouse tracking for glow effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
      card.style.setProperty('--glow-intensity', '1');
    };

    const handleMouseLeave = () => {
      card.style.setProperty('--glow-intensity', '0');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative bg-[#1C1C1C] rounded-2xl p-8 border border-[rgba(138,43,226,0.2)] overflow-hidden"
      style={{
        '--glow-x': '50%',
        '--glow-y': '50%',
        '--glow-intensity': '0',
      } as React.CSSProperties}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(
            400px circle at var(--glow-x) var(--glow-y),
            rgba(138, 43, 226, calc(var(--glow-intensity) * 0.15)) 0%,
            transparent 60%
          )`,
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-[#8A2BE2] to-white bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradientShift_4s_ease-in-out_infinite]">
          Top Tracks
        </h2>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 p-1.5 bg-[#141414] rounded-xl border border-[rgba(138,43,226,0.1)]">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/30'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {getTimeRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-8 h-8 bg-[#2a2a2a] rounded" />
                  <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-[#2a2a2a] rounded" />
                    <div className="h-3 w-1/2 bg-[#2a2a2a] rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={timeRange}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {tracks.map((track, index) => (
                <motion.a
                  key={track.id}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(138, 43, 226, 0.1)' }}
                  className="flex items-center gap-4 p-4 rounded-xl group transition-all"
                >
                  {/* Rank */}
                  <span className={`w-10 text-center font-bold text-lg ${
                    index < 3 ? 'text-[#8A2BE2]' : 'text-[#71717a]'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Album Art */}
                  <div className="relative shrink-0">
                    <img
                      src={track.album.images[2]?.url || track.album.images[0]?.url}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-lg shadow-lg"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-white truncate group-hover:text-[#8A2BE2] transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-[#a1a1aa] text-sm truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-[#71717a] text-sm hidden sm:block">
                    {formatDuration(track.duration_ms)}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && tracks.length === 0 && (
        <div className="text-center py-12 relative z-10">
          <p className="text-[#71717a]">No top tracks found for this time period.</p>
        </div>
      )}
    </motion.div>
  );
}
