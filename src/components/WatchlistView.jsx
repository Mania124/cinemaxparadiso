import React from 'react'
import { useWatchlist } from '../hooks/useWatchlist'
import WatchlistGrid from './WatchlistGrid'

const WatchlistView = ({ onMovieSelect }) => {
  const { watchlist, loading, error, removeFromWatchlist, toggleWatched } = useWatchlist()

  if (loading) return <div className="loading">Loading watchlist...</div>
  if (error) return <div className="error">Error: {error}</div>

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="watchlist-view">
        <div className="empty-state">
          Your watchlist is empty. Start adding movies and TV shows!
        </div>
      </div>
    )
  }

  return (
    <div className="watchlist-view">
      <WatchlistGrid
        movies={watchlist}
        onRemove={removeFromWatchlist}
        onToggleWatched={toggleWatched}
        onMovieSelect={onMovieSelect}
      />
    </div>
  )
}

export default WatchlistView
