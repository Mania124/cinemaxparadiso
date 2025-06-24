import React, { useState, useEffect } from 'react'
import { useMovieSearch } from '../hooks/useMovieSearch'
import { useMoviesByGenre } from '../hooks/useMoviesByGenre'
import MovieGrid from './MovieGrid'
import GenreSection from './GenreSection'

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { movies: searchResults, loading: searchLoading, error: searchError, searchMovies } = useMovieSearch()
  const { genreMovies, loading: genreLoading, error: genreError } = useMoviesByGenre()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMovies(searchQuery)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchMovies])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const showGenreView = !searchQuery.trim()
  const loading = searchQuery.trim() ? searchLoading : genreLoading
  const error = searchQuery.trim() ? searchError : genreError

  return (
    <div className="search-view">
      <div className="search-input-container">
        <input
          type="text"
          id="search-input"
          placeholder="Search for movies or TV shows..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div id="results">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {showGenreView && genreMovies && !loading && !error && (
          <div className="movies-by-genre">
            <h1 className="page-title">🎬 Latest Movies by Genre</h1>
            {genreMovies.map(genreData => (
              <GenreSection
                key={genreData.genre}
                genre={genreData.genre}
                movies={genreData.movies}
              />
            ))}
          </div>
        )}

        {!showGenreView && searchResults && !loading && !error && (
          <MovieGrid movies={searchResults} />
        )}

        {!loading && !error && (
          (showGenreView && (!genreMovies || genreMovies.length === 0)) ||
          (!showGenreView && (!searchResults || searchResults.length === 0))
        ) && (
          <div className="no-results">No results found.</div>
        )}
      </div>
    </div>
  )
}

export default SearchView
