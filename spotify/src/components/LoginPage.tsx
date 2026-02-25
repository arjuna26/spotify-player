import { useEffect } from 'react';
import { initiateSpotifyLogin } from '../services/auth';
import LiquidEther from '../react-bits/LiquidEther.jsx';
import TopTracksTimeMachine from './TopTracksTimeMachine';
import CardSwap, { Card } from './CardSwap';
import { LogoLoop } from './LogoLoop';
import type { LogoItem } from './LogoLoop';
import type { SpotifyTrack, TimeRange } from '../services/spotify';
import ReactIcon from '../icons/react.svg?react';
import TypeScriptIcon from '../icons/typescript.svg?react';
import ViteIcon from '../icons/vite.svg?react';
import TailwindCssIcon from '../icons/tailwindcss.svg?react';
import SpotifyIcon from '../icons/spotify.svg?react';
import ReactBitsIcon from '../icons/reactbits.svg?react';

const m = (name: string) => `/mock/${name}.jpg`;

const mock = (id: string, name: string, artist: string, album: string, albumImg: string, duration: number): SpotifyTrack => ({
  id, name, duration_ms: duration, popularity: 0, preview_url: null,
  artists: [{ id: artist, name: artist, external_urls: { spotify: '#' } }],
  album: { id: album, name: album, images: [
    { url: albumImg, height: 640, width: 640 },
    { url: albumImg, height: 300, width: 300 },
    { url: albumImg, height: 64, width: 64 },
  ], external_urls: { spotify: '#' } },
  external_urls: { spotify: '#' },
});

const MOCK_DATA = new Map<TimeRange, SpotifyTrack[]>([
  ['short_term', [
    mock('1', 'Not Like Us', 'Kendrick Lamar', 'GNX', m('notlikeus'), 274000),
    mock('2', 'Rushed', 'Rema', 'HEIS', m('rushed'), 198000),
    mock('3', 'Birds of a Feather', 'Billie Eilish', 'HIT ME HARD AND SOFT', m('birdsofafeather'), 210000),
    mock('4', 'CARNIVAL', 'Kanye West', 'VULTURES 1', m('carnival'), 278000),
    mock('5', 'Timeless', 'The Weeknd', 'Hurry Up Tomorrow', m('timeless'), 241000),
  ]],
]);

function MockRecentlyPlayed() {
  const history = [
    { name: 'Redbone', artist: 'Childish Gambino', time: '2m ago', img: m('redbone') },
    { name: 'Self Control', artist: 'Frank Ocean', time: '6m ago', img: m('selfcontrol') },
    { name: 'EARFQUAKE', artist: 'Tyler, The Creator', time: '11m ago', img: m('earfquake') },
    { name: 'Pyramids', artist: 'Frank Ocean', time: '18m ago', img: m('pyramids') },
    { name: 'Alright', artist: 'Kendrick Lamar', time: '24m ago', img: m('alright') },
  ];
  return (
    <div className="w-full h-full bg-zinc-900 rounded-2xl p-6 overflow-hidden">
      <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">Recently Played</h3>
      <div className="flex flex-col gap-2">
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <img src={h.img} alt={h.name} className="rounded object-cover" style={{ width: 40, height: 40 }} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{h.name}</p>
              <p className="text-zinc-500 text-xs truncate">{h.artist}</p>
            </div>
            <span className="text-zinc-600 text-xs whitespace-nowrap">{h.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockTopArtists() {
  const artists = [
    { name: 'Frank Ocean', genre: 'alternative r&b', img: m('frankocean') },
    { name: 'Drake', genre: 'hip hop', img: m('kendricklamar') },
    { name: 'Tyler, The Creator', genre: 'hip hop', img: m('tyler') },
    { name: 'SZA', genre: 'r&b', img: m('sza') },
    { name: 'The Weeknd', genre: 'pop', img: m('theweeknd') },
    { name: 'Travis Scott', genre: 'rap', img: m('travisscott') },
  ];
  return (
    <div className="w-full h-full bg-zinc-900 rounded-2xl p-6 overflow-hidden">
      <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">Top Artists</h3>
      <div className="grid grid-cols-3 gap-6">
        {artists.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-3">
            <img src={a.img} alt={a.name} className="rounded-full object-cover" style={{ width: 80, height: 80 }} />
            <p className="text-zinc-300 text-xs font-medium text-center truncate w-full">{a.name}</p>
            <p className="text-zinc-600 text-[10px] truncate w-full text-center">{a.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechBadge({
  name,
  color,
  icon,
}: {
  name: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-base flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
      {icon ? (
        <span className="shrink-0 w-5 h-5 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full" aria-hidden>
          {icon}
        </span>
      ) : (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      )}
      <span className="text-white/60 text-sm font-medium whitespace-nowrap">{name}</span>
    </div>
  );
}

const TECH_ITEMS: LogoItem[] = [
  { node: <TechBadge name="React 19" color="#61DAFB" icon={<ReactIcon />} /> },
  { node: <TechBadge name="TypeScript" color="#3178C6" icon={<TypeScriptIcon />} /> },
  { node: <TechBadge name="Vite" color="#BD34FE" icon={<ViteIcon />} /> },
  { node: <TechBadge name="Tailwind CSS" color="#38BDF8" icon={<TailwindCssIcon />} /> },
  { node: <TechBadge name="Spotify API" color="#1DB954" icon={<SpotifyIcon />} /> },
  { node: <TechBadge name="React Bits" color="#F97316" icon={<ReactBitsIcon />} /> },
];

export default function LoginPage() {
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleLogin = async () => {
    await initiateSpotifyLogin();
  };

  return (
    <div className="h-screen w-screen overflow-hidden fixed inset-0">
      <div className="w-full h-full absolute top-0 left-0 -z-10">
        <LiquidEther
          mouseForce={16}
          cursorSize={100}
          isViscous
          viscous={30}
          colors={["#5227ff","#b19eef"]}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce={false}
          resolution={0.25}
        />
      </div>

      <div className="h-full flex flex-col">
        {/* Center area */}
        <div className="flex-1 flex items-center px-12">
          {/* Login — left side, centered vertically */}
          <div className="flex flex-col items-center gap-6 z-10 shrink-0 w-[280px] ml-auto mr-12">
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 !py-2.5 !px-5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full cursor-pointer transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Continue with Spotify
            </button>
            <p className="text-white/60 text-xs">
              Read-only access to your listening data
            </p>
          </div>

          {/* CardSwap — right side */}
          <div className="relative h-full w-[50%] shrink-0 pointer-events-none opacity-90">
            <CardSwap
              width={500}
              height={600}
              cardDistance={40}
              verticalDistance={30}
              delay={5000}
              skewAmount={5}
              easing="elastic"
            >
              <Card>
                <div className="w-full h-full overflow-hidden">
                  <TopTracksTimeMachine mockData={MOCK_DATA} />
                </div>
              </Card>
              <Card>
                <MockTopArtists />
              </Card>
              <Card>
                <MockRecentlyPlayed />
              </Card>
            </CardSwap>
          </div>
        </div>

        {/* Tech stack LogoLoop at bottom */}
        <div className="shrink-0 pb-8 opacity-60">
          <LogoLoop
            logos={TECH_ITEMS}
            speed={20}
            direction="left"
            gap={24}
            logoHeight={16}
            pauseOnHover={false}
            fadeOut={false}
          />
        </div>
      </div>
    </div>
  );
}
