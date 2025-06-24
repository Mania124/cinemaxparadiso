import React from 'react'
import { AppConfig } from '../services/config'
import { useWatchlist } from '../hooks/useWatchlist'
import { useNotification } from '../hooks/useNotification'

const TrendingGrid = ({ movies }) => {
  const { addToWatchlist } = useWatchlist()
  const { showNotification } = useNotification()

  if (!movies || movies.length === 0) return null

  const handleAddToWatchlist = (movie) => {
    addToWatchlist(movie)
    showNotification('Added to watchlist!', 'success')
  }

  return (
    <div className="trending-grid">
      {movies.map(movie => {
        const title = movie.title || movie.name || 'No Title'
        const poster = movie.poster_path
          ? `${AppConfig.TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`
          : 'https://via.placeholder.com/300x450?text=No+Image'
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
        const popularity = movie.popularity ? Math.round(movie.popularity) : 'N/A'

        return (
          <div key={movie.id} className="trending-card">
            <div className="trending-image">
              <img src={poster} alt={title} loading="lazy" />
              <div className="trending-rating">{rating}</div>
              <div className="trending-popularity">{popularity}</div>
            </div>
            <div className="trending-content">
              <h3 className="trending-title">{title}</h3>
              <div className="trending-actions">
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handleAddToWatchlist(movie)}
                >
                  + Watchlist
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TrendingGrid
