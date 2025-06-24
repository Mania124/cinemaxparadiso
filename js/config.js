// Configuration Management for CinemaxParadiso
// This file handles API keys and configuration settings
//
// IMPORTANT: For production deployment, API keys should be:
// 1. Set via environment variables in your build process
// 2. Never committed to version control
// 3. Loaded securely from your hosting platform
//
// Current setup is for development purposes only

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
    // For client-side applications, we need to set the API keys directly
    // In a production environment, these would come from environment variables via a build process

    if (!this.config.TMDB_API_KEY) {
      // Load TMDB API key
      this.config.TMDB_API_KEY = '4e638237159859e0abbb6b15c1a693e4';
    }

    if (!this.config.OMDB_API_KEY || this.config.OMDB_API_KEY === 'your_omdb_api_key_here') {
      // Load OMDB API key
      this.config.OMDB_API_KEY = 'ac37b2ac';
    }

    // Only show warnings if keys are still not configured
    if (!this.isConfigured('TMDB_API_KEY')) {
      console.warn('⚠️ TMDB API key not properly configured.');
    }

    if (!this.isConfigured('OMDB_API_KEY')) {
      console.warn('⚠️ OMDB API key not configured. Some features may be limited.');
    }
  }

  get(key) {
    return this.config[key];
  }

  isConfigured(key) {
    const value = this.config[key];
    return value &&
           value !== '' &&
           !value.includes('your_') &&
           !value.includes('_here') &&
           value.length > 3; // Basic validation for API key length
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
