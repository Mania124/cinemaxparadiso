import React from 'react'
import MovieCard from './MovieCard'

const GenreSection = ({ genre, movies }) => {
  if (!movies || movies.length === 0) return null

  return (
    <div className="genre-section">
      <h2 className="genre-title">{genre}</h2>
      <div className="genre-horizontal-scroll">
        {movies.slice(0, 15).map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant="genre"
          />
        ))}
      </div>
    </div>
  )
}

export default GenreSection
