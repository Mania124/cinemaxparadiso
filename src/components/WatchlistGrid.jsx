import React from 'react'
import { AppConfig } from '../services/config'

const WatchlistGrid = ({ movies, onRemove, onToggleWatched }) => {
  if (!movies || movies.length === 0) return null

  return (
    <div id="watchlist">
      {movies.map(movie => {
        const title = movie.title || movie.name || 'No Title'
        const poster = movie.poster_path
          ? `${AppConfig.TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`
          : 'https://via.placeholder.com/300x450?text=No+Image'
        const mediaType = movie.media_type === 'tv' ? 'TV Show' : 'Movie'
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
        const watchedClass = movie.watched ? 'watched' : ''

        return (
          <div key={movie.id} className={`card ${watchedClass}`} data-id={movie.id}>
            <div className="card-image">
              <img src={poster} alt={title} loading="lazy" />
              <div className="rating">{rating}</div>
              {movie.watched && <div className="watched-badge">✓</div>}
            </div>
            <div className="card-content">
              <h3 className="card-title">{title}</h3>
              <p className="card-type">{mediaType}</p>
              <div className="card-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => onToggleWatched(movie.id)}
                >
                  {movie.watched ? 'Mark Unwatched' : 'Mark Watched'}
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => onRemove(movie.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WatchlistGrid
