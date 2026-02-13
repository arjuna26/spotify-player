import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentlyPlaying, formatDuration } from '../services/spotify';
import type { CurrentlyPlaying as CurrentlyPlayingType } from '../services/spotify';

function SoundBars() {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-[#1DB954] rounded-full"
          animate={{
            height: ['3px', '14px', '3px'],
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
    const interval = setInterval(fetchCurrentlyPlaying, 30000);
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

  if (loading) {
    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 sm:p-8">
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-zinc-800 rounded-xl" />
            <div className="flex-1 space-y-4 text-center sm:text-left w-full">
              <div className="h-4 w-24 bg-zinc-800 rounded mx-auto sm:mx-0" />
              <div className="h-8 w-3/4 bg-zinc-800 rounded mx-auto sm:mx-0" />
              <div className="h-5 w-1/2 bg-zinc-800 rounded mx-auto sm:mx-0" />
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
    <div className="bg-zinc-900/50 rounded-2xl p-6 sm:p-8 border border-zinc-800/50">
      <AnimatePresence mode="wait">
        {track ? (
          <motion.div
            key={track.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Album Art - Large and Prominent */}
              <motion.a
                href={track.album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="shrink-0 relative group"
              >
                <img
                  src={track.album.images[0]?.url || '/placeholder.png'}
                  alt={track.album.name}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl shadow-2xl shadow-black/50"
                />
                {isPlaying && (
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2">
                    <SoundBars />
                  </div>
                )}
              </motion.a>

              {/* Track Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                {/* Playing Status */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {isPlaying ? (
                    <>
                      <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                      <span className="text-[#1DB954] text-xs font-medium uppercase tracking-wider">Now Playing</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                      <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Paused</span>
                    </>
                  )}
                </div>

                {/* Track Name */}
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h2 className="font-bold text-2xl sm:text-3xl text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {track.name}
                  </h2>
                </a>

                {/* Artist */}
                <p className="text-zinc-400 text-lg truncate">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>

                {/* Album */}
                <p className="text-zinc-600 text-sm truncate">
                  {track.album.name}
                </p>

                {/* Progress Bar */}
                <div className="pt-4">
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-zinc-500">
                    <span>{formatDuration(progress)}</span>
                    <span>{formatDuration(track.duration_ms)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h3 className="text-zinc-400 text-lg font-medium mb-2">Nothing playing</h3>
            <p className="text-zinc-600 text-sm">Play something on Spotify to see it here</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
