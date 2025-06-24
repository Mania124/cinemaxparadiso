import React from 'react'
import { useRecommendations } from '../hooks/useRecommendations'
import { useWatchlist } from '../hooks/useWatchlist'
import { useNotification } from '../hooks/useNotification'

const RecommendationsView = ({ onMovieSelect }) => {
  const { recommendations, loading, error, preferences, refreshRecommendations } = useRecommendations(24)
  const { watchlist, addToWatchlist } = useWatchlist()
  const { showNotification } = useNotification()

  const handleAddToWatchlist = (e, movie) => {
    e.stopPropagation()
    addToWatchlist(movie)
    showNotification('Added to watchlist!', 'success')
  }

  if (loading) return <div className="loading">Analyzing your preferences and finding recommendations...</div>
  if (error) return <div className="error">Error loading recommendations: {error}</div>

  // Show message if no watchlist
  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="recommendations-view">
        <div className="recommendations-header">
          <h1 className="page-title">🎯 Recommendations for You</h1>
        </div>
        <div className="empty-recommendations">
          <div className="empty-state">
            <h3>Build Your Watchlist First!</h3>
            <p>Add some movies and TV shows to your watchlist so we can learn your preferences and recommend similar content you'll love.</p>
            <div className="empty-tips">
              <h4>How it works:</h4>
              <ul>
                <li>🎬 Add movies you like to your watchlist</li>
                <li>🤖 Our AI analyzes your preferences</li>
                <li>✨ Get personalized recommendations</li>
                <li>🔄 Recommendations improve as you add more content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="recommendations-view">
      <div className="recommendations-header">
        <h1 className="page-title">🎯 Recommendations for You</h1>
        <button className="refresh-btn" onClick={refreshRecommendations}>
          🔄 Refresh Recommendations
        </button>
      </div>

      {preferences && (
        <div className="preferences-summary">
          <h3>Your Preferences</h3>
          <div className="preference-stats">
            <div className="stat-item">
              <span className="stat-label">Movies in Watchlist:</span>
              <span className="stat-value">{preferences.totalItems}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Rating:</span>
              <span className="stat-value">⭐ {preferences.averageRating.toFixed(1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Preferred Content:</span>
              <span className="stat-value">
                {preferences.mediaTypes.movie > preferences.mediaTypes.tv ? '🎬 Movies' : '📺 TV Shows'}
              </span>
            </div>
          </div>
          {preferences.topGenres && preferences.topGenres.length > 0 && (
            <div className="favorite-genres">
              <span className="genres-label">Favorite Genres:</span>
              <div className="genre-tags">
                {preferences.topGenres.slice(0, 3).map(genreId => (
                  <span key={genreId} className="genre-tag">
                    {getGenreName(genreId)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="recommendations-content">
        {recommendations.length > 0 ? (
          <>
            <div className="recommendations-info">
              <p>Based on your watchlist, here are {recommendations.length} movies and shows we think you'll enjoy:</p>
            </div>
            <div className="recommendations-section">
              <div className="genre-section">
                <h2 className="genre-title">🎯 Recommended for You</h2>
                <div className="genre-grid">
                  {recommendations.map(movie => (
                    <div key={movie.id} className="genre-movie-card" onClick={() => onMovieSelect && onMovieSelect(movie)}>
                      <div className="genre-movie-image">
                        <img
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
                          alt={movie.title || movie.name || 'No Title'}
                          loading="lazy"
                        />
                        <div className="genre-movie-rating">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
                        <div className="genre-movie-year">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</div>
                      </div>
                      <div className="genre-movie-content">
                        <h4 className="genre-movie-title">{movie.title || movie.name || 'No Title'}</h4>
                        <div className="genre-movie-actions">
                          <button
                            className="btn-small btn-primary"
                            onClick={(e) => handleAddToWatchlist(e, movie)}
                          >
                            + List
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              onMovieSelect && onMovieSelect(movie)
                            }}
                          >
                            Info
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-recommendations">
            <h3>No recommendations available</h3>
            <p>Try adding more movies to your watchlist to get better recommendations.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get genre names
const getGenreName = (genreId) => {
  const genreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  }
  return genreMap[genreId] || 'Unknown'
}

export default RecommendationsView
