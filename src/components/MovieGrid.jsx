import React from 'react'
import MovieCard from './MovieCard'

const MovieGrid = ({ movies, onMovieSelect }) => {
  if (!movies || movies.length === 0) return null

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard
          key={`${movie.id}-${movie.media_type}`}
          movie={movie}
          variant="default"
          onMovieSelect={onMovieSelect}
        />
      ))}
    </div>
  )
}

export default MovieGrid
