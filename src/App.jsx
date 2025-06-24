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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search':
        return <SearchView />
      case 'trending':
        return <TrendingView />
      case 'watchlist':
        return <WatchlistView />
      default:
        return <SearchView />
    }
  }

  return (
    <div className="app">
      <Header />
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  )
}

export default App
