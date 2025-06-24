import { useState, useEffect, useCallback } from 'react'

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('watchlist')
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist))
      }
    } catch (err) {
      setError('Failed to load watchlist')
      console.error('Error loading watchlist:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('watchlist', JSON.stringify(watchlist))
      } catch (err) {
        console.error('Error saving watchlist:', err)
      }
    }
  }, [watchlist, loading])

  const addToWatchlist = useCallback((movie) => {
    setWatchlist(prev => {
      // Prevent duplicates
      const exists = prev.some(item => 
        item.id === movie.id && item.media_type === movie.media_type
      )
      
      if (exists) {
        return prev
      }

      const watchlistItem = {
        ...movie,
        addedAt: new Date().toISOString(),
        watched: false
      }

      return [...prev, watchlistItem]
    })
  }, [])

  const removeFromWatchlist = useCallback((movieId) => {
    setWatchlist(prev => prev.filter(item => item.id !== movieId))
  }, [])

  const toggleWatched = useCallback((movieId) => {
    setWatchlist(prev => prev.map(item => {
      if (item.id === movieId) {
        return {
          ...item,
          watched: !item.watched,
          watchedAt: !item.watched ? new Date().toISOString() : null
        }
      }
      return item
    }))
  }, [])

  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched
  }
}
