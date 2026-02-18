import { useEffect } from 'react';
import CurrentlyPlaying from './CurrentlyPlaying';
import TopTracks from './TopTracks';
import TopArtists from './TopArtists';
import RecentlyPlayed from './RecentlyPlayed';
import UserProfile from './UserProfile';
import { useAuth } from '../context/AuthContext';
import Plasma from '../react-bits/Plasma.jsx';
import Lenis from 'lenis';

export default function Dashboard() {
  const { logout } = useAuth();

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
        <Plasma color="#1DB954"/>
      </div>

      <div className="min-h-screen flex flex-col items-center">
        <header className="w-full sticky top-0 z-50 py-6">
          <div className="flex items-center justify-center gap-8">
            <UserProfile />
            <button
              onClick={logout}
              className="text-white font-bold hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="z-10 gap-20 flex flex-col items-center pb-20">
          <CurrentlyPlaying />
          <TopTracks limit={5} />
          <RecentlyPlayed limit={8} />
          <TopArtists limit={6} />
        </main>

        <footer className="w-full py-8 text-center text-white font-semibold text-xs">
          <p>
            Built with{' '}
            <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">TypeScript</a>
            {' • '}
            <a href="https://developer.spotify.com/documentation/web-api" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-colors">Spotify API</a>
            {' • '}
            <a href="https://reactbits.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">React Bits</a>
          </p>
        </footer>
      </div>
    </>
  );
}
