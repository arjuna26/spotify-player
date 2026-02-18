import { useState, useEffect } from 'react';
import { getRecentlyPlayed, formatRelativeTime } from '../services/spotify';
import type { PlayHistoryItem } from '../services/spotify';

interface RecentlyPlayedProps {
  limit?: number;
}

export default function RecentlyPlayed({ limit = 10 }: RecentlyPlayedProps) {
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const response = await getRecentlyPlayed(limit);
      if (response?.items) {
        setHistory(response.items);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [limit]);

  if (loading) {
    return (
      <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="h-5 w-32 bg-zinc-800 rounded mb-6 animate-pulse" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-zinc-800 rounded" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                <div className="h-2.5 w-1/3 bg-zinc-800 rounded" />
              </div>
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
      <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">
        Recently Played
      </h3>
      <div className="flex flex-col gap-2">
        {history.map((item, index) => (
          <a
            key={`${item.track.id}-${index}`}
            href={item.track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
          >
            <img
              src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
              alt={item.track.album.name}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate group-hover:text-[#1DB954] transition-colors">
                {item.track.name}
              </p>
              <p className="text-zinc-500 text-xs truncate">
                {item.track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <span className="text-zinc-600 text-xs whitespace-nowrap">
              {formatRelativeTime(item.played_at)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
