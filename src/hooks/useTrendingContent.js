import { useState, useEffect } from 'react'
import { movieService } from '../services/movieService'

export const useTrendingContent = () => {
  const [trendingData, setTrendingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTrendingContent = async () => {
      setLoading(true)
      setError(null)

      try {
        const results = await movieService.getTrendingContent()
        setTrendingData(results)
      } catch (err) {
        setError(err.message)
        setTrendingData([])
      } finally {
        setLoading(false)
      }
    }

    loadTrendingContent()
  }, [])

  return {
    trendingData,
    loading,
    error
  }
}
