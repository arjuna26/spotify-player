import { useState, useEffect } from 'react';
import { getTopTracks, formatDuration } from '../services/spotify';
import type { SpotifyTrack, TimeRange } from '../services/spotify';
import TiltWrapper from '../react-bits/TiltWrapper';

const TIME_RANGES: { key: TimeRange; label: string; description: string }[] = [
  { key: 'short_term', label: '4 Weeks', description: 'Your recent obsessions' },
  { key: 'medium_term', label: '6 Months', description: 'Your current era' },
  { key: 'long_term', label: 'All Time', description: 'Your lifetime favorites' },
];

interface TopTracksTimeMachineProps {
  mockData?: Map<TimeRange, SpotifyTrack[]>;
}

export default function TopTracksTimeMachine({ mockData }: TopTracksTimeMachineProps = {}) {
  const [activeRange, setActiveRange] = useState<TimeRange>('short_term');
  const [tracks, setTracks] = useState<Map<TimeRange, SpotifyTrack[]>>(mockData || new Map());
  const [loading, setLoading] = useState(!mockData);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (mockData) return;
    const fetchAll = async () => {
      setLoading(true);
      const map = new Map<TimeRange, SpotifyTrack[]>();
      for (const { key } of TIME_RANGES) {
        const res = await getTopTracks(key, 10);
        map.set(key, res?.items || []);
      }
      setTracks(map);
      setLoading(false);
    };

    fetchAll();
  }, [mockData]);

  const handleRangeChange = (range: TimeRange) => {
    if (range === activeRange) return;
    setSwitching(true);
    setTimeout(() => {
      setActiveRange(range);
      setSwitching(false);
    }, 200);
  };

  const currentTracks = tracks.get(activeRange) || [];
  const activeInfo = TIME_RANGES.find(r => r.key === activeRange)!;

  // Find tracks that appear in multiple time ranges
  const getPresenceIndicator = (trackId: string) => {
    let count = 0;
    tracks.forEach((trackList) => {
      if (trackList.some(t => t.id === trackId)) count++;
    });
    return count;
  };

  if (loading) {
    return (
      <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="h-5 w-44 bg-zinc-800 rounded mb-6 animate-pulse" />
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-4 bg-zinc-800 rounded" />
              <div className="w-12 h-12 bg-zinc-800 rounded-lg" />
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
    <TiltWrapper scaleOnHover={1.01} rotateAmplitude={3}>
      <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
            Top Tracks Time Machine
          </h3>
        </div>
        <p className="text-zinc-600 text-xs mb-6">
          {activeInfo.description}
        </p>

        {/* Time Range Tabs */}
        <div className="flex gap-2 mb-8">
          {TIME_RANGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleRangeChange(key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeRange === key
                  ? 'bg-[#1DB954] text-black'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Track List */}
        <div
          className={`flex flex-col gap-2 transition-all duration-200 ${
            switching ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {currentTracks.map((track, index) => {
            const presence = getPresenceIndicator(track.id);
            return (
              <a
                key={track.id}
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
              >
                <span className="w-6 text-zinc-600 text-sm font-medium tabular-nums text-right shrink-0">
                  {index + 1}
                </span>
                <img
                  src={track.album.images[2]?.url || track.album.images[0]?.url}
                  alt={track.album.name}
                  className="rounded-lg object-cover shrink-0"
                  style={{ width: 48, height: 48 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">
                      {track.name}
                    </p>
                    {presence === 3 && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-1.5 py-0.5 rounded">
                        Staple
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-xs truncate">
                    {track.artists.map(a => a.name).join(', ')} · {track.album.name}
                  </p>
                </div>
                <span className="text-zinc-600 text-xs tabular-nums shrink-0">
                  {formatDuration(track.duration_ms)}
                </span>
              </a>
            );
          })}
        </div>

        {currentTracks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No tracks found for this time range</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-1.5 py-0.5 rounded">
              Staple
            </span>
            <span className="text-zinc-600 text-[11px]">
              Appears in all 3 time ranges
            </span>
          </div>
        </div>
      </div>
    </TiltWrapper>
  );
}
