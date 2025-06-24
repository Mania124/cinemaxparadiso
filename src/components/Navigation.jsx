import React from 'react'

const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'search', label: '🔍 Search', icon: '🔍' },
    { id: 'trending', label: '🔥 Trending', icon: '🔥' },
    { id: 'watchlist', label: '📋 My Watchlist', icon: '📋' }
  ]

  return (
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
  )
}

export default Navigation
