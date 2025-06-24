import React from 'react'
import MovieCard from './MovieCard'

const MovieGrid = ({ movies }) => {
  if (!movies || movies.length === 0) return null

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard
          key={`${movie.id}-${movie.media_type}`}
          movie={movie}
          variant="default"
        />
      ))}
    </div>
  )
}

export default MovieGrid
