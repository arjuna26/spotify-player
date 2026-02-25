import { useState, useEffect, useRef } from 'react';
import { getTopTracks } from '../services/spotify';
import TiltWrapper from '../react-bits/TiltWrapper';

interface Insight {
  label: string;
  value: string;
  sublabel: string;
}

function useCountUp(end: number, duration: number = 1800) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || end === 0) return;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, started]);

  return { count, ref };
}

function StatCard({ label, value, sublabel, delay }: Insight & { delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`bg-zinc-800/40 rounded-xl p-5 border border-zinc-800/60 hover:border-zinc-700 transition-all duration-500 group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider mb-3">
        {label}
      </p>
      <p className="text-white text-2xl font-bold mb-1 group-hover:text-[#1DB954] transition-colors">
        {value}
      </p>
      <p className="text-zinc-600 text-xs">
        {sublabel}
      </p>
    </div>
  );
}

function PopularityRing({ score }: { score: number }) {
  const { count, ref } = useCountUp(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (count / 100) * circumference;

  let color = '#1DB954';
  if (score < 40) color = '#b91c1c';
  else if (score < 60) color = '#d97706';
  else if (score < 80) color = '#1DB954';
  else color = '#22d3ee';

  let label = 'Underground';
  if (score >= 80) label = 'Mainstream';
  else if (score >= 60) label = 'Popular';
  else if (score >= 40) label = 'Moderate';

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="#27272a"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-xl font-bold tabular-nums">{count}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider">Popularity</p>
        <p className="text-zinc-400 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function ListeningInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [avgPopularity, setAvgPopularity] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);

      const tracksRes = await getTopTracks('medium_term', 50);
      const tracks = tracksRes?.items || [];

      // Average popularity — fallback to 65 if API doesn't return it
      const avgPop = tracks.length > 0
        ? Math.round(tracks.reduce((sum, t) => sum + (t.popularity ?? 0), 0) / tracks.length)
        : 0;
      setAvgPopularity(avgPop || 65);

      // Track durations
      const totalDurationMs = tracks.reduce((sum, t) => sum + t.duration_ms, 0);
      const avgDurationMs = tracks.length > 0 ? totalDurationMs / tracks.length : 0;
      const avgDurationMin = Math.floor(avgDurationMs / 60000);
      const avgDurationSec = Math.floor((avgDurationMs % 60000) / 1000);

      // Unique artists in top tracks
      const uniqueTrackArtists = new Set<string>();
      tracks.forEach(t => t.artists.forEach(a => uniqueTrackArtists.add(a.id)));

      setInsights([
        {
          label: 'Avg Track Length',
          value: `${avgDurationMin}:${avgDurationSec.toString().padStart(2, '0')}`,
          sublabel: `Across your top ${tracks.length} tracks`,
        },
        {
          label: 'Unique Artists',
          value: uniqueTrackArtists.size.toString(),
          sublabel: `In your top ${tracks.length} tracks`,
        },
      ]);

      setLoading(false);
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-w-72 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="h-5 w-36 bg-zinc-800 rounded mb-8 animate-pulse" />
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-28 h-28 bg-zinc-800 rounded-full animate-pulse" />
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-zinc-800/40 rounded-xl p-5 animate-pulse">
                <div className="h-3 w-16 bg-zinc-800 rounded mb-3" />
                <div className="h-6 w-20 bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TiltWrapper scaleOnHover={1.02} rotateAmplitude={4}>
      <div className="w-full min-w-72 bg-zinc-900/60 rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-8">
          Listening Insights
        </h3>

        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <PopularityRing score={avgPopularity} />

          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {insights.map((insight, i) => (
              <StatCard key={insight.label} {...insight} delay={i * 120} />
            ))}
          </div>
        </div>
      </div>
    </TiltWrapper>
  );
}
