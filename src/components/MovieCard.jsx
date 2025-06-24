import React from 'react'
import { AppConfig } from '../services/config'
import { useWatchlist } from '../hooks/useWatchlist'
import { useNotification } from '../hooks/useNotification'

const MovieCard = ({ movie, variant = 'default' }) => {
  const { addToWatchlist } = useWatchlist()
  const { showNotification } = useNotification()

  const title = movie.title || movie.name || 'No Title'
  const poster = movie.poster_path
    ? `${AppConfig.TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image'
  const overview = movie.overview || 'No description available.'
  const releaseDate = movie.release_date || movie.first_air_date || 'Unknown date'
  const mediaType = movie.media_type === 'tv' ? 'TV Show' : 'Movie'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  const handleAddToWatchlist = () => {
    addToWatchlist(movie)
    showNotification('Added to watchlist!', 'success')
  }

  const handleViewDetails = () => {
    showNotification('Detailed view coming soon!', 'info')
  }

  if (variant === 'genre') {
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'
    
    return (
      <div className="genre-movie-card" data-id={movie.id} data-type="movie">
        <div className="genre-movie-image">
          <img src={poster} alt={title} loading="lazy" />
          <div className="genre-movie-rating">{rating}</div>
          <div className="genre-movie-year">{releaseYear}</div>
        </div>
        <div className="genre-movie-content">
          <h4 className="genre-movie-title">{title}</h4>
          <div className="genre-movie-actions">
            <button className="btn-small btn-primary" onClick={handleAddToWatchlist}>
              + Watchlist
            </button>
            <button className="btn-small btn-secondary" onClick={handleViewDetails}>
              Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" data-id={movie.id} data-type={movie.media_type}>
      <div className="card-image">
        <img src={poster} alt={title} loading="lazy" />
        <div className="rating-tmdb">{rating}</div>
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-type">{mediaType}</p>
        <div className="ratings-single">
          <span className="rating-item tmdb">TMDB: {rating}</span>
        </div>
        <p className="card-overview">
          {overview.substring(0, 120)}{overview.length > 120 ? '...' : ''}
        </p>
        <p className="card-date"><strong>Release:</strong> {releaseDate}</p>
        <div className="card-actions">
          <button className="btn-primary" onClick={handleAddToWatchlist}>
            Add to Watchlist
          </button>
          <button className="btn-secondary" onClick={handleViewDetails}>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
