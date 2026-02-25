import { useState, useEffect, useRef } from 'react';
import { getTopArtists } from '../services/spotify';
import type { SpotifyArtist } from '../services/spotify';
import TiltWrapper from '../react-bits/TiltWrapper';

interface GenreData {
  genre: string;
  count: number;
  percentage: number;
}

function AnimatedBar({ percentage, delay }: { percentage: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(percentage), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percentage, delay]);

  return (
    <div ref={ref} className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, #1DB954 0%, #1ed760 100%)`,
        }}
      />
    </div>
  );
}

export default function GenreBreakdown() {
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);

      const short = await getTopArtists('short_term', 50);
      const medium = await getTopArtists('medium_term', 50);
      const long = await getTopArtists('long_term', 50);

      const allArtists: SpotifyArtist[] = [];
      const seen = new Set<string>();

      for (const response of [short, medium, long]) {
        if (response?.items) {
          for (const artist of response.items) {
            if (!seen.has(artist.id)) {
              seen.add(artist.id);
              allArtists.push(artist);
            }
          }
        }
      }

      const genreMap = new Map<string, number>();
      for (const artist of allArtists) {
        if (artist.genres) {
          for (const genre of artist.genres) {
            genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
          }
        }
      }

      const sorted = Array.from(genreMap.entries())
        .sort((a, b) => b[1] - a[1]);

      const maxCount = sorted[0]?.[1] || 1;

      const genreData: GenreData[] = sorted.map(([genre, count]) => ({
        genre,
        count,
        percentage: (count / maxCount) * 100,
      }));

      setGenres(genreData);
      setLoading(false);
    };

    fetchGenres();
  }, []);

  const displayGenres = showAll ? genres : genres.slice(0, 12);

  if (loading) {
    return (
      <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="h-5 w-36 bg-zinc-800 rounded mb-8 animate-pulse" />
        <div className="flex flex-col gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-3 w-8 bg-zinc-800 rounded" />
              </div>
              <div className="h-2 bg-zinc-800 rounded-full" style={{ width: `${100 - i * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (genres.length === 0) return null;

  return (
    <TiltWrapper scaleOnHover={1.02} rotateAmplitude={4}>
      <div className="w-full min-w-72 bg-zinc-900/60 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
            Your Genres
          </h3>
          <span className="text-zinc-600 text-xs tabular-nums">
            {genres.length} genres found
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {displayGenres.map((item, index) => (
            <div key={item.genre} className="group">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-zinc-300 text-sm font-medium group-hover:text-[#1DB954] transition-colors capitalize">
                  {item.genre}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-xs tabular-nums">
                    {item.count} {item.count === 1 ? 'artist' : 'artists'}
                  </span>
                </div>
              </div>
              <AnimatedBar percentage={item.percentage} delay={index * 60} />
            </div>
          ))}
        </div>

        {genres.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-6 w-full text-center text-zinc-500 text-xs font-medium hover:text-[#1DB954] transition-colors"
          >
            {showAll ? 'Show less' : `Show all ${genres.length} genres`}
          </button>
        )}
      </div>
    </TiltWrapper>
  );
}
