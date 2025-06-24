# Cinema Paradiso 🎬

A modern movie and TV show discovery platform built with React and Vite, featuring trending content, search functionality, and personal watchlists.

## Features

- **Search Movies & TV Shows**: Comprehensive search using TMDB API
- **Trending Content**: Discover what's popular today and this week
- **Personal Watchlist**: Save movies and shows to watch later
- **Genre-based Discovery**: Browse latest movies organized by genre
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Multiple Rating Sources**: TMDB ratings with optional OMDB integration
- **Local Storage**: Persistent watchlist data

## Tech Stack

- **Frontend**: React 18, Vite
- **APIs**: TMDB (The Movie Database), OMDB (Optional)
- **Storage**: Browser LocalStorage
- **Styling**: Modern CSS with gradients and animations
- **Build Tool**: Vite for fast development and building

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mania124/cinemaxparadiso.git
   cd cinemaxparadiso
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Get API Keys**
   - **TMDB API Key** (Required): Get from [TMDB API](https://www.themoviedb.org/settings/api)
   - **OMDB API Key** (Optional): Get from [OMDB API](http://www.omdbapi.com/apikey.aspx)

4. **Configure Environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```bash
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_OMDB_API_KEY=your_omdb_api_key_here
   ```

5. **Run the Development Server**

   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```bash
Cinema Paradiso/
│
├── index.html              # Main HTML template
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Main App component
│   ├── components/        # React components
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── SearchView.jsx
│   │   ├── TrendingView.jsx
│   │   ├── WatchlistView.jsx
│   │   ├── MovieCard.jsx
│   │   ├── GenreSection.jsx
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   ├── useMovieSearch.js
│   │   ├── useWatchlist.js
│   │   └── ...
│   ├── services/          # API services
│   │   ├── config.js
│   │   └── movieService.js
│   └── styles/            # CSS files
│       ├── index.css
│       └── App.css
├── .env                   # Environment variables
├── .env.example           # Environment template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the comprehensive movie database
- [OMDB](http://www.omdbapi.com/) for additional movie ratings
- [React](https://reactjs.org/) for the component framework
- [Vite](https://vitejs.dev/) for the fast build tool
