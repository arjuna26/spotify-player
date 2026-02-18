import { useEffect, useState, useRef } from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
  formatValue?: (value: number) => string;
}

function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
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
  }, [end, duration]);

  return count;
}

export default function StatsCard({ 
  label, 
  value, 
  suffix = '', 
  icon,
  formatValue 
}: StatsCardProps) {
  const animatedValue = useCountUp(value);
  const displayValue = formatValue ? formatValue(animatedValue) : animatedValue.toLocaleString();

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-white text-2xl font-bold tabular-nums">
            {displayValue}
            {suffix && <span className="text-zinc-400 text-lg ml-1">{suffix}</span>}
          </p>
        </div>
        {icon && (
          <div className="text-zinc-600 group-hover:text-[#1DB954] transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
