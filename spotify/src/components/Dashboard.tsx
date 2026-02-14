import { useState } from 'react';
import CurrentlyPlaying from './CurrentlyPlaying';
import { useAuth } from '../context/AuthContext';
import LiquidEther from '../react-bits/LiquidEther.jsx';

// const DEFAULT_SCAN_COLOR = '#0a0a0a';

export default function Dashboard() {
  const { logout } = useAuth();
  const [scanColor, setScanColor] = useState('');

  return (
    <>
    <div className="w-full h-full absolute top-0 left-0">
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
