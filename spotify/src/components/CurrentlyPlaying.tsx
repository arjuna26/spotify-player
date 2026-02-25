import { useState, useEffect } from 'react';
import { getCurrentlyPlaying, formatDuration } from '../services/spotify';
import type { CurrentlyPlaying as CurrentlyPlayingType } from '../services/spotify';
import { getDominantColor } from '../utils/dominantColor';
import TiltWrapper from '../react-bits/TiltWrapper';

interface CurrentlyPlayingProps {
  onDominantColor?: (color: string) => void;
  onTrackChange?: (trackId: string | null, color: string) => void;
}

export default function CurrentlyPlaying({ onDominantColor, onTrackChange }: CurrentlyPlayingProps) {
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

  // Extract dominant color from album art and report to parent
  useEffect(() => {
    const imageUrl = data?.item?.album?.images?.[0]?.url;
    const trackId = data?.item?.id || null;
    
    if (!imageUrl) {
      onTrackChange?.(null, '');
      return;
    }

    getDominantColor(imageUrl)
      .then((color) => {
        onDominantColor?.(color);
        onTrackChange?.(trackId, color);
      })
      .catch(() => { /* ignore; keep previous color */ });
  }, [data?.item?.album?.images?.[0]?.url, data?.item?.id, onDominantColor, onTrackChange]);

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
    <TiltWrapper rotateAmplitude={0}>
      <div className="w-full bg-zinc-900/60 rounded-2xl p-12 border border-zinc-800">
        {track ? (
            <div key={track.id} className="relative z-10">
              <div className="flex flex-col items-center gap-4">
                {/* Playing Status */}
                <div className="flex items-center justify-center">
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
                  className="shrink-0 relative group block"
                >
                  <img
                    src={track.album.images[0]?.url ?? '/placeholder.png'}
                    alt={track.album.name}
                    className="rounded-xl shadow-lg object-cover"
                    style={{ width: '14rem', height: '14rem', display: 'block' }}
                  />
                </a>

                {/* Track Info */}
                <div className="w-full text-center space-y-3">
                  {/* Track Name */}
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h2 className="font-bold text-2xl sm:text-3xl text-white text-wrap break-words group-hover:text-[#1DB954] transition-colors">
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
                  <div className="pt-4">
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
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
          <div className="text-center py-8">
            <h3 className="text-zinc-400 text-lg font-medium mb-2">Nothing playing</h3>
            <p className="text-zinc-600 text-sm">Play something on Spotify to see it here</p>
          </div>
        )}
      </div>
    </TiltWrapper>
  );
}
