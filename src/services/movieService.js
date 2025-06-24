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

  // Get content by genre (movies, TV, or both)
  async getContentByGenre(contentType = 'all') {
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

    // Fetch content for each genre based on type
    const genreContent = await Promise.all(
      popularGenres.map(async (genre) => {
        let content = []

        if (contentType === 'all' || contentType === 'movie') {
          const movies = await this.fetchMoviesByGenre(genre.id)
          content.push(...movies)
        }

        if (contentType === 'all' || contentType === 'tv') {
          const tvShows = await this.fetchTVByGenre(genre.id)
          content.push(...tvShows)
        }

        // Sort by release/air date (newest first) and limit to 15
        content.sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01')
          const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01')
          return dateB - dateA
        })

        return {
          genre: genre.name,
          movies: content.slice(0, 15)
        }
      })
    )

    return genreContent.filter(genreData => genreData.movies.length > 0)
  }

  // Backward compatibility
  async getMoviesByGenre() {
    return this.getContentByGenre('movie')
  }

  // Fetch movies for a specific genre
  async fetchMoviesByGenre(genreId) {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    // Get today's date in YYYY-MM-DD format for filtering
    const today = new Date().toISOString().split('T')[0]

    // Fetch multiple pages to ensure we get movies
    const allMovies = []
    let page = 1
    const maxPages = 3 // Limit to prevent infinite loops

    while (allMovies.length < 10 && page <= maxPages) {
      const response = await fetch(
        `${AppConfig.TMDB_BASE_URL}/discover/movie?api_key=${this.tmdbApiKey}&with_genres=${genreId}&sort_by=release_date.desc&release_date.lte=${today}&page=${page}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // If no more results, break
      if (!data.results || data.results.length === 0) {
        break
      }

      allMovies.push(...data.results)
      page++
    }

    // Return movies with media_type
    return allMovies.slice(0, 10).map(movie => ({
      ...movie,
      media_type: 'movie' // Add media_type for consistency
    }))
  }

  // Fetch TV shows for a specific genre
  async fetchTVByGenre(genreId) {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    // Get today's date in YYYY-MM-DD format for filtering
    const today = new Date().toISOString().split('T')[0]

    // Fetch multiple pages to ensure we get TV shows
    const allTVShows = []
    let page = 1
    const maxPages = 3 // Limit to prevent infinite loops

    while (allTVShows.length < 10 && page <= maxPages) {
      const response = await fetch(
        `${AppConfig.TMDB_BASE_URL}/discover/tv?api_key=${this.tmdbApiKey}&with_genres=${genreId}&sort_by=first_air_date.desc&first_air_date.lte=${today}&page=${page}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // If no more results, break
      if (!data.results || data.results.length === 0) {
        break
      }

      allTVShows.push(...data.results)
      page++
    }

    // Return TV shows with media_type
    return allTVShows.slice(0, 10).map(tvShow => ({
      ...tvShow,
      media_type: 'tv' // Add media_type for consistency
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

  // Get detailed movie information
  async getMovieDetails(movieId, mediaType = 'movie') {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    const endpoint = mediaType === 'tv' ? 'tv' : 'movie'
    const response = await fetch(
      `${AppConfig.TMDB_BASE_URL}/${endpoint}/${movieId}?api_key=${this.tmdbApiKey}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // Get movie trailer from YouTube
  async getMovieTrailer(movieId, mediaType = 'movie') {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    const endpoint = mediaType === 'tv' ? 'tv' : 'movie'
    const response = await fetch(
      `${AppConfig.TMDB_BASE_URL}/${endpoint}/${movieId}/videos?api_key=${this.tmdbApiKey}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Find YouTube trailer
    const trailer = data.results?.find(video =>
      video.site === 'YouTube' &&
      (video.type === 'Trailer' || video.type === 'Teaser')
    )

    return trailer?.key || null
  }

  // Get streaming providers
  async getStreamingProviders(movieId, mediaType = 'movie') {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not configured')
    }

    try {
      const endpoint = mediaType === 'tv' ? 'tv' : 'movie'
      const response = await fetch(
        `${AppConfig.TMDB_BASE_URL}/${endpoint}/${movieId}/watch/providers?api_key=${this.tmdbApiKey}`
      )

      if (!response.ok) {
        return [] // Return empty array if providers not available
      }

      const data = await response.json()
      const usProviders = data.results?.US

      const providers = []

      // Add streaming providers (flatrate)
      if (usProviders?.flatrate) {
        usProviders.flatrate.forEach(provider => {
          providers.push({
            name: provider.provider_name,
            logo: `${AppConfig.TMDB_IMAGE_BASE_URL}/w92${provider.logo_path}`,
            link: usProviders.link || '#'
          })
        })
      }

      // Add rent/buy providers
      if (usProviders?.rent) {
        usProviders.rent.forEach(provider => {
          providers.push({
            name: `${provider.provider_name} (Rent)`,
            logo: `${AppConfig.TMDB_IMAGE_BASE_URL}/w92${provider.logo_path}`,
            link: usProviders.link || '#'
          })
        })
      }

      if (usProviders?.buy) {
        usProviders.buy.forEach(provider => {
          providers.push({
            name: `${provider.provider_name} (Buy)`,
            logo: `${AppConfig.TMDB_IMAGE_BASE_URL}/w92${provider.logo_path}`,
            link: usProviders.link || '#'
          })
        })
      }

      return providers
    } catch (error) {
      console.error('Error fetching streaming providers:', error)
      return []
    }
  }
}

export const movieService = new MovieService()
