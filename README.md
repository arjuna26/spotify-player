# Spotify Analytics

A beautiful, real-time Spotify analytics dashboard built with React + react-bits, TypeScript, and the Spotify Web API.

<img width="750" height="430" alt="image" src="https://github.com/user-attachments/assets/f7f4f231-d426-4203-8dd0-fa388e272842" />


![Spotify Analytics](https://img.shields.io/badge/Spotify-Analytics-1DB954?style=for-the-badge&logo=spotify&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Motion** - Animations (Framer Motion)
- **React Router** - Navigation
- **Spotify Web API** - Data source

## Getting Started

### Prerequisites

- Node.js 18+
- A Spotify account
- A Spotify Developer application

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add your redirect URIs:
   - Development: `http://127.0.0.1:5173/callback`
   - Production: `https://your-domain.com/callback`
4. Note your **Client ID** (you won't need the client secret for PKCE flow)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spotify-analytics.git
cd spotify-analytics

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Spotify Client ID
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

### Development

```bash
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `VITE_SPOTIFY_CLIENT_ID` - Your Spotify Client ID
   - `VITE_SPOTIFY_REDIRECT_URI` - `https://your-domain.com/callback`
4. Deploy!

Remember to add your production redirect URI to your Spotify app settings.

## Project Structure

```
spotify/
├── src/
│   ├── components/        # React components
│   │   ├── Callback.tsx       # OAuth callback handler
│   │   ├── CurrentlyPlaying.tsx
│   │   ├── Dashboard.tsx      # Main dashboard layout
│   │   ├── LoginPage.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── RecentlyPlayed.tsx
│   │   └── TopTracks.tsx
│   ├── config/
│   │   └── spotify.ts     # Spotify configuration
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication state
│   ├── services/
│   │   ├── auth.ts        # OAuth PKCE implementation
│   │   └── spotify.ts     # Spotify API client
│   ├── App.tsx
│   ├── index.css          # Global styles + Tailwind
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `GET /me` | Current user profile |
| `GET /me/top/tracks` | User's top tracks |
| `GET /me/player/currently-playing` | Currently playing track |
| `GET /me/player/recently-played` | Recently played tracks |

## Authentication

This app uses **OAuth 2.0 Authorization Code Flow with PKCE** (Proof Key for Code Exchange), which is the recommended flow for single-page applications. This approach:

- Doesn't require a client secret on the frontend
- Is more secure than the implicit grant flow
- Supports token refresh

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [React Bits](https://reactbits.dev) - UI inspiration
- [Motion](https://motion.dev) - Animation library

---

Made with ♥ and lots of music 🎵
