import { useState, useEffect } from 'react';
import { getCurrentlyPlaying, formatDuration } from '../services/spotify';
import type { CurrentlyPlaying as CurrentlyPlayingType } from '../services/spotify';
import { getDominantColor } from '../utils/dominantColor';

interface CurrentlyPlayingProps {
  onDominantColor?: (color: string) => void;
}

export default function CurrentlyPlaying({ onDominantColor }: CurrentlyPlayingProps) {
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

  // Extract dominant color from album art and report to parent (e.g. for GridScan)
  useEffect(() => {
    const imageUrl = data?.item?.album?.images?.[0]?.url;
    if (!imageUrl || !onDominantColor) return;

    getDominantColor(imageUrl)
      .then(onDominantColor)
      .catch(() => { /* ignore; keep previous color */ });
  }, [data?.item?.album?.images?.[0]?.url, onDominantColor]);

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
    <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
      
        {track ? (
            <div key={track.id} className="relative z-10">
              <div className="flex flex-col items-center gap-4">
                {/* Playing Status */}
                <div className="flex items-center justify-center !pt-4">
                    {isPlaying ? (
                      <>
                        <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                      </>
                    ) : (
                      <>
                        <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Paused</span>
                      </>
                    )}
                  </div>
                {/* Album Art - Large and Prominent */}
                <a
                  href={track.album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 relative group"
                >
                  <img
                    src={track.album.images[0]?.url || '/placeholder.png'}
                    alt={track.album.name}
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl shadow-2xl shadow-black/50"
                  />
                </a>

                {/* Track Info */}
                <div className="flex-1 min-w-0 text-center space-y-3">
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
                  <p className="text-zinc-200 text-lg truncate z-10">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>

                  {/* Album */}
                  <p className="text-zinc-400 text-sm truncate z-10">
                    {track.album.name}
                  </p>

                  {/* Progress Bar */}
                  <div className="!p-8">
                    <div className="min-w-72 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1DB954]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>{formatDuration(progress)}</span>
                      <span>{formatDuration(track.duration_ms)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        ) : (
          <div
            className="text-center !p-4"
          >
            <h3 className="text-zinc-400 text-lg font-medium mb-2">Nothing playing</h3>
            <p className="text-zinc-600 text-sm">Play something on Spotify to see it here</p>
          </div>
        )}
    </div>

  );
}
