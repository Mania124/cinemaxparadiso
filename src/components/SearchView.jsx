import React, { useState, useEffect } from 'react'
import { useMovieSearch } from '../hooks/useMovieSearch'
import { useMoviesByGenre } from '../hooks/useMoviesByGenre'
import MovieGrid from './MovieGrid'
import GenreSection from './GenreSection'

const SearchView = ({ showSearchInput, onSearchInputToggle, contentType, onMovieSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { movies: searchResults, loading: searchLoading, error: searchError, searchMovies } = useMovieSearch()
  const { genreMovies, loading: genreLoading, error: genreError } = useMoviesByGenre(contentType)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMovies(searchQuery)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchMovies])

  useEffect(() => {
    // Clear search when input is hidden
    if (!showSearchInput) {
      setSearchQuery('')
    }
  }, [showSearchInput])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const showGenreView = !searchQuery.trim()
  const loading = searchQuery.trim() ? searchLoading : genreLoading
  const error = searchQuery.trim() ? searchError : genreError

  return (
    <div className="search-view">
      {showSearchInput && (
        <div className="search-input-container">
          <input
            type="text"
            id="search-input"
            placeholder="Search for movies or TV shows..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
        </div>
      )}

      <div id="results" className={showGenreView ? 'genre-view' : ''}>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {showGenreView && genreMovies && !loading && !error && (
          <div className="movies-by-genre">
            <h1 className="page-title">
              {contentType === 'movie' && '🎥 Latest Movies by Genre'}
              {contentType === 'tv' && '📺 Latest TV & Series by Genre'}
              {contentType === 'all' && '🎬 Latest Movies & TV by Genre'}
            </h1>
            {genreMovies.map(genreData => (
              <GenreSection
                key={genreData.genre}
                genre={genreData.genre}
                movies={genreData.movies}
                onMovieSelect={onMovieSelect}
              />
            ))}
          </div>
        )}

        {!showGenreView && searchResults && !loading && !error && (
          <MovieGrid movies={searchResults} onMovieSelect={onMovieSelect} />
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
