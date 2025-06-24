import { useState, useEffect } from 'react'
import { recommendationService } from '../services/recommendationService'
import { useWatchlist } from './useWatchlist'

export const useRecommendations = (limit = 20) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const { watchlist } = useWatchlist()

  const loadRecommendations = async (forceRefresh = false) => {
    if (loading && !forceRefresh) return

    setLoading(true)
    setError(null)

    try {
      // Analyze user preferences
      const userPreferences = recommendationService.analyzeWatchlistPreferences(watchlist)
      setPreferences(userPreferences)

      // Get recommendations
      const recommendedMovies = await recommendationService.getRecommendations(watchlist, limit)
      setRecommendations(recommendedMovies)
    } catch (err) {
      setError(err.message)
      console.error('Error loading recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load recommendations when watchlist changes
  useEffect(() => {
    if (watchlist) {
      loadRecommendations()
    }
  }, [watchlist, limit])

  const refreshRecommendations = () => {
    loadRecommendations(true)
  }

  return {
    recommendations,
    loading,
    error,
    preferences,
    refreshRecommendations
  }
}
