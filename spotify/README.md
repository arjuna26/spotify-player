# Spotify Analytics Dashboard

A minimalistic, visually stunning Spotify analytics dashboard built with React and TypeScript.

## Features

- **Currently Playing** - Real-time display of your current track with album art and progress
- **Recently Played** - Timeline of your listening history
- **Top Tracks** - Your most played tracks over time
- **Top Artists** - Your favorite artists displayed in an interactive grid

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Motion** - Spring-based animations
- **Lenis** - Smooth scrolling

## Credits

- [Spotify Web API](https://developer.spotify.com/documentation/web-api) - Music data and playback information
- [React Bits](https://reactbits.dev/) - Beautiful UI components (TiltedCard, Plasma, and more)
- [TypeScript](https://www.typescriptlang.org/) - Type safety and developer experience

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Spotify API credentials:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
