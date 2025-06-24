import React from 'react'

const Navigation = ({ currentView, onViewChange, contentType, onContentTypeChange }) => {
  const typeFilters = [
    { id: 'all', label: '🎬 All', icon: '🎬' },
    { id: 'movie', label: '🎥 Movies', icon: '🎥' },
    { id: 'tv', label: '📺 TV & Series', icon: '📺' }
  ]

  const navItems = [
    { id: 'search', label: '🔍 Search', icon: '🔍' },
    { id: 'trending', label: '🔥 Trending', icon: '🔥' },
    { id: 'watchlist', label: '📋 My Watchlist', icon: '📋' }
  ]

  return (
    <div className="navigation-container">
      <nav className="type-filters">
        {typeFilters.map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${contentType === filter.id ? 'active' : ''}`}
            onClick={() => onContentTypeChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </nav>

      <nav className="nav-buttons">
        {navItems.map(item => (
          <button
            key={item.id}
            className={currentView === item.id ? 'active' : ''}
            onClick={() => onViewChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Navigation
