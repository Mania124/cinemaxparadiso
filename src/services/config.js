// Configuration service for API keys and settings
export const AppConfig = {
  // TMDB Configuration
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',

  // OMDB Configuration
  OMDB_API_KEY: import.meta.env.VITE_OMDB_API_KEY,
  OMDB_BASE_URL: 'https://www.omdbapi.com',

  // Check if a specific API key is configured
  isConfigured(keyName) {
    switch (keyName) {
      case 'TMDB_API_KEY':
        return !!this.TMDB_API_KEY && this.TMDB_API_KEY !== 'undefined'
      case 'OMDB_API_KEY':
        return !!this.OMDB_API_KEY && this.OMDB_API_KEY !== 'undefined'
      default:
        return false
    }
  },

  // Get API key safely
  getApiKey(keyName) {
    if (!this.isConfigured(keyName)) {
      console.warn(`${keyName} is not configured`)
      return null
    }
    return this[keyName]
  }
}
