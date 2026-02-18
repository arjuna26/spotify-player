import { useState, useEffect } from 'react';
import { getTopTracks, formatDuration } from '../services/spotify';
import type { SpotifyTrack, TimeRange } from '../services/spotify';

interface TopTracksProps {
  limit?: number;
  timeRange?: TimeRange;
}

export default function TopTracks({ limit = 5, timeRange = 'medium_term' }: TopTracksProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const response = await getTopTracks(timeRange, limit);
      if (response?.items) {
        setTracks(response.items);
      }
      setLoading(false);
    };

    fetchTracks();
  }, [limit, timeRange]);

  if (loading) {
    return (
      <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="h-5 w-24 bg-zinc-800 rounded mb-6 animate-pulse" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-4 bg-zinc-800 rounded" />
              <div className="w-10 h-10 bg-zinc-800 rounded" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
      <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">
        Top Tracks
      </h3>
      <div className="flex flex-col gap-3">
        {tracks.map((track, index) => (
          <a
            key={track.id}
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
          >
            <span className="w-6 text-zinc-600 text-sm font-medium tabular-nums text-right">
              {index + 1}
            </span>
            <img
              src={track.album.images[2]?.url || track.album.images[0]?.url}
              alt={track.album.name}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">
                {track.name}
              </p>
              <p className="text-zinc-500 text-xs truncate">
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <span className="text-zinc-600 text-xs tabular-nums">
              {formatDuration(track.duration_ms)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

