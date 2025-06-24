// Configuration Management for CinemaxParadiso
// This file handles API keys and configuration settings

class Config {
  constructor() {
    // Default configuration
    this.config = {
      TMDB_API_KEY: '',
      OMDB_API_KEY: '',
      TMDB_BASE_URL: 'https://api.themoviedb.org/3',
      OMDB_BASE_URL: 'http://www.omdbapi.com',
      TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p'
    };
    
    this.loadConfig();
  }

  loadConfig() {
    // Try to load from environment variables (if available in build process)
    if (typeof process !== 'undefined' && process.env) {
      this.config.TMDB_API_KEY = process.env.TMDB_API_KEY || this.config.TMDB_API_KEY;
      this.config.OMDB_API_KEY = process.env.OMDB_API_KEY || this.config.OMDB_API_KEY;
      this.config.TMDB_BASE_URL = process.env.TMDB_BASE_URL || this.config.TMDB_BASE_URL;
      this.config.OMDB_BASE_URL = process.env.OMDB_BASE_URL || this.config.OMDB_BASE_URL;
      this.config.TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || this.config.TMDB_IMAGE_BASE_URL;
    }
    
    // For development: Load from a separate config file (not committed to git)
    this.loadDevConfig();
  }

  loadDevConfig() {
    // This would typically be loaded from a build process or server
    // For now, we'll use the hardcoded values but with a warning
    if (!this.config.TMDB_API_KEY) {
      console.warn('⚠️ TMDB API key not found in environment variables. Using fallback configuration.');
      // In production, this should come from environment variables
      this.config.TMDB_API_KEY = '4e638237159859e0abbb6b15c1a693e4';
    }
    
    if (!this.config.OMDB_API_KEY || this.config.OMDB_API_KEY === 'your_omdb_api_key_here') {
      console.warn('⚠️ OMDB API key not configured. Some features may be limited.');
    }
  }

  get(key) {
    return this.config[key];
  }

  isConfigured(key) {
    const value = this.config[key];
    return value && value !== '' && !value.includes('your_') && !value.includes('_here');
  }

  validateConfig() {
    const issues = [];
    
    if (!this.isConfigured('TMDB_API_KEY')) {
      issues.push('TMDB API key is not properly configured');
    }
    
    if (!this.isConfigured('OMDB_API_KEY')) {
      issues.push('OMDB API key is not properly configured (optional but recommended)');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }
}

// Create global config instance
const AppConfig = new Config();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
