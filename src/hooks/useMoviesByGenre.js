import { useState, useEffect } from 'react'
import { movieService } from '../services/movieService'

export const useMoviesByGenre = (contentType = 'all') => {
  const [genreMovies, setGenreMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMoviesByGenre = async () => {
      setLoading(true)
      setError(null)

      try {
        const results = await movieService.getContentByGenre(contentType)
        setGenreMovies(results)
      } catch (err) {
        setError(err.message)
        setGenreMovies([])
      } finally {
        setLoading(false)
      }
    }

    loadMoviesByGenre()
  }, [contentType])

  return {
    genreMovies,
    loading,
    error
  }
}
