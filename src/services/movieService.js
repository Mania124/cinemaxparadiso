import { AppConfig } from './config'

class MovieService {
  constructor() {
    this.tmdbApiKey = AppConfig.getApiKey('TMDB_API_KEY')
    this.omdbApiKey = AppConfig.getApiKey('OMDB_API_KEY')
  }

  // Search movies and TV shows
  async searchMovies(query, page = 1) {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    const response = await fetch(
      `${AppConfig.TMDB_BASE_URL}/search/multi?api_key=${this.tmdbApiKey}&query=${encodeURIComponent(query)}&page=${page}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  }

  // Get movies by genre
  async getMoviesByGenre() {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    // Popular genres
    const popularGenres = [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 14, name: 'Fantasy' },
      { id: 27, name: 'Horror' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' }
    ]

    // Fetch movies for each genre
    const genreMovies = await Promise.all(
      popularGenres.map(async (genre) => {
        const movies = await this.fetchMoviesByGenre(genre.id)
        return {
          genre: genre.name,
          movies: movies.slice(0, 15) // First 15 movies
        }
      })
    )

    return genreMovies.filter(genreData => genreData.movies.length > 0)
  }

  // Fetch movies for a specific genre
  async fetchMoviesByGenre(genreId) {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    // Get today's date in YYYY-MM-DD format for filtering
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch multiple pages to ensure we get enough movies
    const pages = [1, 2] // Fetch first 2 pages (40 movies total)
    const allMovies = []
    
    for (const page of pages) {
      const response = await fetch(
        `${AppConfig.TMDB_BASE_URL}/discover/movie?api_key=${this.tmdbApiKey}&with_genres=${genreId}&sort_by=release_date.desc&release_date.lte=${today}&page=${page}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      allMovies.push(...data.results)
      
      // If we have enough movies, break early
      if (allMovies.length >= 15) break
    }
    
    return allMovies.map(movie => ({
      ...movie,
      media_type: 'movie' // Add media_type for consistency
    }))
  }

  // Get trending content
  async getTrendingContent() {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    const trendingCategories = [
      { endpoint: 'trending/movie/day', title: '🎬 Trending Movies Today' },
      { endpoint: 'trending/tv/day', title: '📺 Trending TV Shows Today' },
      { endpoint: 'trending/movie/week', title: '🔥 Hot Movies This Week' },
      { endpoint: 'trending/tv/week', title: '⭐ Popular TV Shows This Week' }
    ]

    const results = await Promise.all(
      trendingCategories.map(async (category) => {
        try {
          const response = await fetch(
            `${AppConfig.TMDB_BASE_URL}/${category.endpoint}?api_key=${this.tmdbApiKey}`
          )

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          return {
            title: category.title,
            items: (data.results || []).slice(0, 20) // First 20 items
          }
        } catch (error) {
          console.error(`Error fetching ${category.title}:`, error)
          return {
            title: category.title,
            items: []
          }
        }
      })
    )

    return results.filter(category => category.items.length > 0)
  }
}

export const movieService = new MovieService()
