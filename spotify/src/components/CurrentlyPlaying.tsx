import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentlyPlaying, formatDuration } from '../services/spotify';
import type { CurrentlyPlaying as CurrentlyPlayingType } from '../services/spotify';

function SoundBars() {
  return (
    <div className="flex items-end gap-1 h-5">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-[#1DB954] rounded-full"
          animate={{
            height: ['4px', '16px', '4px'],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function CurrentlyPlaying() {
  const [data, setData] = useState<CurrentlyPlayingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentlyPlaying = async () => {
      try {
        const result = await getCurrentlyPlaying();
        setData(result);
        if (result?.progress_ms) {
          setProgress(result.progress_ms);
        }
      } catch (error) {
        console.error('Failed to fetch currently playing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentlyPlaying();
    const interval = setInterval(fetchCurrentlyPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data?.is_playing || !data.item) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1000;
        if (newProgress >= data.item!.duration_ms) {
          return data.item!.duration_ms;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

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

  if (loading) {
    return (
      <div className="bg-[#1C1C1C] rounded-2xl p-8 border border-[rgba(138,43,226,0.2)]">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-40 bg-[#2a2a2a] rounded" />
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#2a2a2a] rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-3/4 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-1/2 bg-[#2a2a2a] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const track = data?.item;
  const isPlaying = data?.is_playing;
  const progressPercent = track ? (progress / track.duration_ms) * 100 : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
      <div className="flex items-center gap-3 mb-6 relative z-10">
        {isPlaying ? (
          <>
            <SoundBars />
            <span className="text-[#1DB954] text-sm font-semibold tracking-wide">Now Playing</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-[#a1a1aa]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <span className="text-[#a1a1aa] text-sm font-medium">
              {track ? 'Paused' : 'Nothing Playing'}
            </span>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {track ? (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <div className="flex gap-6">
              {/* Album Art */}
              <motion.a
                href={track.album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shrink-0 relative group"
              >
                <img
                  src={track.album.images[0]?.url || '/placeholder.png'}
                  alt={track.album.name}
                  className="w-24 h-24 rounded-xl shadow-2xl ring-2 ring-[rgba(138,43,226,0.3)]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </motion.a>

              {/* Track Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="font-bold text-xl text-white truncate group-hover:text-[#8A2BE2] transition-colors">
                    {track.name}
                  </h3>
                </a>
                <p className="text-[#a1a1aa] text-base truncate">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>
                <p className="text-[#71717a] text-sm truncate">
                  {track.album.name}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8A2BE2] to-[#1DB954]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#71717a]">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(track.duration_ms)}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 relative z-10"
          >
            <p className="text-[#71717a] text-lg">Start playing something on Spotify!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
