import React from 'react'
import MovieCard from './MovieCard'

const GenreSection = ({ genre, movies, onMovieSelect }) => {
  if (!movies || movies.length === 0) return null

  return (
    <div className="genre-section">
      <h2 className="genre-title">{genre}</h2>
      <div className="genre-grid">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant="genre"
            onMovieSelect={onMovieSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default GenreSection
