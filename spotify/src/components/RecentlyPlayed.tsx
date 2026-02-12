import { useState, useEffect, useRef } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // First, try to load from cache for instant display
    const cached = getCachedRecentlyPlayed();
    if (cached.length > 0) {
      setItems(cached);
      setLoading(false);
    }

    // Then fetch fresh data
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

    fetchRecentlyPlayed();
  }, []);

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
      transition={{ delay: 0.2 }}
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
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-[#8A2BE2] to-white bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradientShift_4s_ease-in-out_infinite]">
          Recently Played
        </h2>
        <span className="text-xs text-[#71717a] font-medium">
          {items.length > 0 ? `${items.length} tracks` : ''}
        </span>
      </div>

      {/* Track List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 relative z-10">
        {loading && items.length === 0 ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
              <div className="w-14 h-14 bg-[#2a2a2a] rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-[#2a2a2a] rounded" />
                <div className="h-3 w-1/2 bg-[#2a2a2a] rounded" />
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ backgroundColor: 'rgba(138, 43, 226, 0.1)' }}
              className="flex items-center gap-4 p-3 rounded-xl group transition-all"
            >
              {/* Album Art */}
              <div className="relative shrink-0">
                <img
                  src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                  alt={item.track.album.name}
                  className="w-14 h-14 rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#8A2BE2] transition-colors">
                  {item.track.name}
                </h4>
                <p className="text-[#71717a] text-xs truncate">
                  {item.track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              {/* Time & Duration */}
              <div className="text-right shrink-0 space-y-0.5">
                <span className="text-[#71717a] text-xs block font-medium">
                  {formatPlayedAt(item.played_at)}
                </span>
                <span className="text-[#52525b] text-xs">
                  {formatDuration(item.track.duration_ms)}
                </span>
              </div>
            </motion.a>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12 relative z-10">
          <p className="text-[#71717a]">No recently played tracks found.</p>
        </div>
      )}
    </motion.div>
  );
}
