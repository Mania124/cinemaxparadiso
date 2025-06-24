import { useState, useCallback } from 'react'
import { movieService } from '../services/movieService'

export const useMovieSearch = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchMovies = useCallback(async (query, page = 1) => {
    if (!query.trim()) {
      setMovies([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await movieService.searchMovies(query, page)
      setMovies(results)
    } catch (err) {
      setError(err.message)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    movies,
    loading,
    error,
    searchMovies
  }
}
