import React, { useState, useEffect } from 'react'
import { movieService } from '../services/movieService'
import { useWatchlist } from '../hooks/useWatchlist'
import { useNotification } from '../hooks/useNotification'

const MovieDetails = ({ movie, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null)
  const [trailerKey, setTrailerKey] = useState(null)
  const [streamingLinks, setStreamingLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToWatchlist } = useWatchlist()
  const { showNotification } = useNotification()

  useEffect(() => {
    const loadMovieDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get detailed movie information
        const details = await movieService.getMovieDetails(movie.id, movie.media_type || 'movie')
        setMovieDetails(details)

        // Get trailer
        const trailer = await movieService.getMovieTrailer(movie.id, movie.media_type || 'movie')
        setTrailerKey(trailer)

        // Get streaming providers
        const providers = await movieService.getStreamingProviders(movie.id, movie.media_type || 'movie')
        setStreamingLinks(providers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (movie) {
      loadMovieDetails()
    }
  }, [movie])

  const handleAddToWatchlist = () => {
    addToWatchlist(movie)
    showNotification('Added to watchlist!', 'success')
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!movie) return null

  const title = movie.title || movie.name || 'No Title'
  const releaseDate = movie.release_date || movie.first_air_date || 'Unknown date'
  const mediaType = movie.media_type === 'tv' ? 'TV Show' : 'Movie'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  return (
    <div className="movie-details-overlay" onClick={handleBackdropClick}>
      <div className="movie-details-modal">
        <button className="close-button" onClick={onClose}>✕</button>
        
        {loading && <div className="loading">Loading movie details...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {!loading && !error && (
          <>
            <div className="movie-details-header">
              <h2 className="movie-details-title">{title}</h2>
              <div className="movie-details-meta">
                <span className="movie-type">{mediaType}</span>
                <span className="movie-rating">⭐ {rating}</span>
                <span className="movie-date">{new Date(releaseDate).getFullYear()}</span>
              </div>
            </div>

            {trailerKey && (
              <div className="trailer-section">
                <h3>Trailer</h3>
                <div className="trailer-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0`}
                    title={`${title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="movie-description">
              <h3>Description</h3>
              <p>{movieDetails?.overview || movie.overview || 'No description available.'}</p>
              
              {movieDetails && (
                <div className="additional-info">
                  <div className="info-row">
                    <strong>Runtime:</strong> {movieDetails.runtime ? `${movieDetails.runtime} minutes` : 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Genres:</strong> {movieDetails.genres?.map(g => g.name).join(', ') || 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Release Date:</strong> {releaseDate}
                  </div>
                  {movieDetails.budget > 0 && (
                    <div className="info-row">
                      <strong>Budget:</strong> ${movieDetails.budget.toLocaleString()}
                    </div>
                  )}
                  {movieDetails.revenue > 0 && (
                    <div className="info-row">
                      <strong>Revenue:</strong> ${movieDetails.revenue.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {streamingLinks.length > 0 && (
              <div className="streaming-section">
                <h3>🎬 Watch Now</h3>
                <div className="watch-now-buttons">
                  {streamingLinks.slice(0, 3).map((provider, index) => (
                    <a
                      key={index}
                      href={provider.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="watch-now-btn"
                    >
                      <img src={provider.logo} alt={provider.name} />
                      <div className="watch-info">
                        <span className="watch-action">Watch on</span>
                        <span className="watch-provider">{provider.name}</span>
                      </div>
                    </a>
                  ))}
                </div>

                {streamingLinks.length > 3 && (
                  <div className="more-providers">
                    <h4>More Options</h4>
                    <div className="streaming-providers">
                      {streamingLinks.slice(3).map((provider, index) => (
                        <a
                          key={index + 3}
                          href={provider.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="streaming-link"
                        >
                          <img src={provider.logo} alt={provider.name} />
                          <span>{provider.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="movie-details-actions">
              <button className="btn-primary" onClick={handleAddToWatchlist}>
                Add to Watchlist
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MovieDetails
