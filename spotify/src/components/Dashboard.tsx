import { useState, useEffect } from 'react';
import CurrentlyPlaying from './CurrentlyPlaying';
import TopTracks from './TopTracks';
import TopArtists from './TopArtists';
import RecentlyPlayed from './RecentlyPlayed';
import UserProfile from './UserProfile';
import { useAuth } from '../context/AuthContext';
import LiquidEther from '../react-bits/LiquidEther.jsx';
import Lenis from 'lenis';

export default function Dashboard() {
  const { logout } = useAuth();
  const [scanColor, setScanColor] = useState('');

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <div className="w-full h-full fixed top-0 left-0 pointer-events-none">
        <LiquidEther
          mouseForce={16}
          cursorSize={150}
          isViscous
          viscous={30}
          colors={[scanColor]}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2}
          resolution={0.5}
        />
      </div>

      <div className="min-h-screen flex flex-col items-center">
        <header className="w-full sticky top-0 z-50 py-6 bg-transparent backdrop-blur-xl">
          <div className="flex items-center justify-center gap-8">
            <UserProfile />
            <button
              onClick={logout}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="z-10 gap-20 flex flex-col items-center pb-20">
          <CurrentlyPlaying onDominantColor={setScanColor} />
          <TopTracks limit={5} />
          <TopArtists limit={6} />
          <RecentlyPlayed limit={8} />
        </main>
      </div>
    </>
  );
}
