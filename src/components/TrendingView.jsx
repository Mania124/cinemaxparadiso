import React from 'react'
import { useTrendingContent } from '../hooks/useTrendingContent'
import TrendingGrid from './TrendingGrid'

const TrendingView = ({ onMovieSelect }) => {
  const { trendingData, loading, error } = useTrendingContent()

  if (loading) return <div className="loading">Loading trending content...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="trending-view">
      <div className="trending-section">
        <h1 className="trending-title">🔥 Trending Now</h1>
        {trendingData && trendingData.map(category => (
          <div key={category.title} className="trending-category">
            <h2 className="category-title">{category.title}</h2>
            <TrendingGrid movies={category.items} onMovieSelect={onMovieSelect} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrendingView
