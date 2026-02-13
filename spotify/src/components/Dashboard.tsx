import CurrentlyPlaying from './CurrentlyPlaying';
// import RecentlyPlayed from './RecentlyPlayed';
import { useAuth } from '../context/AuthContext';
// import LiquidEther from '../react-bits/LiquidEther.jsx';
import GridScan from '../react-bits/GridScan.jsx';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <>
    <div className="w-full h-full absolute top-0 left-0">
      <GridScan
        sensitivity={0.25}
        lineThickness={1}
        linesColor="#392e4e"
        scanColor="#ff9ffc"
        scanOpacity={0.4}
        gridScale={0.03}
        lineStyle="solid"
        lineJitter={0.1}
        scanDirection="pingpong"
        noiseIntensity={0.04}
        scanGlow={0.9}
        scanSoftness={2}
        scanDuration={1.5}
        scanDelay={2}
        scanOnClick={true}
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
          <CurrentlyPlaying />
      </main> 
    </div>
    </>
  );
}
