import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import SearchView from './components/SearchView'
import TrendingView from './components/TrendingView'
import WatchlistView from './components/WatchlistView'
import { AppConfig } from './services/config'
import './styles/App.css'

function App() {
  const [currentView, setCurrentView] = useState('search')
  const [isConfigured, setIsConfigured] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [contentType, setContentType] = useState('all')

  useEffect(() => {
    // Check if API keys are configured
    setIsConfigured(AppConfig.isConfigured('TMDB_API_KEY'))
  }, [])

  if (!isConfigured) {
    return (
      <div className="app">
        <div className="config-warning">
          <h2>⚠️ Configuration Required</h2>
          <p>Please add your TMDB API key to the .env file to use this application.</p>
          <p>Create a .env file in the root directory with:</p>
          <code>VITE_TMDB_API_KEY=your_api_key_here</code>
        </div>
      </div>
    )
  }

  const handleViewChange = (view) => {
    if (view === 'search' && currentView === 'search') {
      // If already on search view and search button clicked, toggle search input
      setShowSearchInput(!showSearchInput)
    } else {
      // Switch to different view
      setCurrentView(view)
      setShowSearchInput(false) // Hide search input when switching views
    }
  }

  const handleContentTypeChange = (type) => {
    setContentType(type)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search':
        return <SearchView showSearchInput={showSearchInput} onSearchInputToggle={setShowSearchInput} contentType={contentType} />
      case 'trending':
        return <TrendingView contentType={contentType} />
      case 'watchlist':
        return <WatchlistView contentType={contentType} />
      default:
        return <SearchView showSearchInput={showSearchInput} onSearchInputToggle={setShowSearchInput} contentType={contentType} />
    }
  }

  return (
    <div className="app">
      <Header />
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        contentType={contentType}
        onContentTypeChange={handleContentTypeChange}
      />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  )
}

export default App
