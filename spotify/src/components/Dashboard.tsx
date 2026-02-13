import { useState } from 'react';
import CurrentlyPlaying from './CurrentlyPlaying';
// import RecentlyPlayed from './RecentlyPlayed';
import { useAuth } from '../context/AuthContext';
import LiquidEther from '../react-bits/LiquidEther.jsx';
// import GridScan from '../react-bits/GridScan.jsx';

const DEFAULT_SCAN_COLOR = '#1DB954';

export default function Dashboard() {
  const { logout } = useAuth();
  const [scanColor, setScanColor] = useState(DEFAULT_SCAN_COLOR);

  return (
    <>
    <div className="w-full h-full absolute top-0 left-0">
      <LiquidEther
        mouseForce={16}
        cursorSize={100}
        isViscous
        viscous={30}
        colors={[scanColor]}
        autoDemo
        autoSpeed={0.7}
        autoIntensity={1.2}
        resolution={0.25}
      />
    </div>

    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
      {/* Header */}
      <header className="absolute top-5 z-50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center w-full h-full">
          <CurrentlyPlaying onDominantColor={setScanColor} />
      </main> 
    </div>
    </>
  );
}
