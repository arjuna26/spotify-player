import { useState, useEffect } from 'react';
import { getTopArtists } from '../services/spotify';
import type { SpotifyArtist, TimeRange } from '../services/spotify';
import TiltedCard from '../react-bits/TiltedCard';

interface TopArtistsProps {
  limit?: number;
  timeRange?: TimeRange;
}

export default function TopArtists({ limit = 6, timeRange = 'medium_term' }: TopArtistsProps) {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      const response = await getTopArtists(timeRange, limit);
      if (response?.items) {
        setArtists(response.items);
      }
      setLoading(false);
    };

    fetchArtists();
  }, [limit, timeRange]);

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <div className="h-5 w-24 bg-zinc-800 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-20 h-20 bg-zinc-800 rounded-full" />
              <div className="h-3 w-14 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
      <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">
        Top Artists
      </h3>
      <div className="grid grid-cols-3 gap-6">
        {artists.map((artist) => (
          <a
            key={artist.id}
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group"
          >
            <div className="relative">
              <TiltedCard
                imageSrc={artist.images?.[1]?.url || artist.images?.[0]?.url || '/placeholder.png'}
                altText={artist.name}
                containerWidth="5rem"
                containerHeight="5rem"
                imageWidth="5rem"
                imageHeight="5rem"
                scaleOnHover={1.08}
                rotateAmplitude={8}
                showMobileWarning={false}
                showTooltip={false}
              />
            </div>
            <p className="text-zinc-300 text-xs font-medium text-center truncate w-full group-hover:text-[#1DB954] transition-colors">
              {artist.name}
            </p>
            {artist.genres?.[0] && (
              <p className="text-zinc-600 text-[10px] truncate w-full text-center">
                {artist.genres[0]}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
