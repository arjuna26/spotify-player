import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  getRecentlyPlayed, 
  getCachedRecentlyPlayed,
  formatDuration 
} from '../services/spotify';
import type { RecentlyPlayedItem } from '../services/spotify';

function formatPlayedAt(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentlyPlayed() {
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedRecentlyPlayed();
    if (cached.length > 0) {
      setItems(cached);
      setLoading(false);
    }

    const fetchRecentlyPlayed = async () => {
      try {
        const result = await getRecentlyPlayed(20);
        setItems(result);
      } catch (error) {
        console.error('Failed to fetch recently played:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRecentlyPlayed, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recently Played</h2>
        {items.length > 0 && (
          <span className="text-xs text-zinc-600">{items.length} tracks</span>
        )}
      </div>

      {/* Track List */}
      <div className="space-y-1">
        {loading && items.length === 0 ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))
        ) : (
          items.map((item, index) => (
            <motion.a
              key={`${item.track.id}-${item.played_at}`}
              href={item.track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors group"
            >
              {/* Album Art */}
              <div className="relative shrink-0">
                <img
                  src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                  alt={item.track.album.name}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-[#1DB954] transition-colors">
                  {item.track.name}
                </h4>
                <p className="text-zinc-500 text-xs truncate">
                  {item.track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              {/* Time & Duration */}
              <div className="text-right shrink-0">
                <span className="text-zinc-500 text-xs block">
                  {formatPlayedAt(item.played_at)}
                </span>
                <span className="text-zinc-600 text-xs">
                  {formatDuration(item.track.duration_ms)}
                </span>
              </div>
            </motion.a>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">No recently played tracks</p>
        </div>
      )}
    </div>
  );
}
