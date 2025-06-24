import { movieService } from './movieService'

class RecommendationService {
  constructor() {
    this.genreWeights = {}
    this.preferredRatingRange = { min: 0, max: 10 }
    this.preferredYearRange = { min: 1900, max: new Date().getFullYear() }
  }

  // Analyze user's watchlist to build preference profile
  analyzeWatchlistPreferences(watchlist) {
    if (!watchlist || watchlist.length === 0) {
      return null
    }

    const preferences = {
      genres: {},
      averageRating: 0,
      preferredYears: [],
      mediaTypes: { movie: 0, tv: 0 },
      totalItems: watchlist.length
    }

    let totalRating = 0
    let ratingCount = 0

    watchlist.forEach(item => {
      // Analyze genres (from genre_ids if available)
      if (item.genre_ids && item.genre_ids.length > 0) {
        item.genre_ids.forEach(genreId => {
          preferences.genres[genreId] = (preferences.genres[genreId] || 0) + 1
        })
      }

      // Analyze ratings
      if (item.vote_average && item.vote_average > 0) {
        totalRating += item.vote_average
        ratingCount++
      }

      // Analyze release years
      const releaseDate = item.release_date || item.first_air_date
      if (releaseDate) {
        const year = new Date(releaseDate).getFullYear()
        if (year > 1900) {
          preferences.preferredYears.push(year)
        }
      }

      // Analyze media types
      const mediaType = item.media_type === 'tv' ? 'tv' : 'movie'
      preferences.mediaTypes[mediaType]++
    })

    // Calculate average rating
    if (ratingCount > 0) {
      preferences.averageRating = totalRating / ratingCount
    }

    // Sort genres by preference
    preferences.topGenres = Object.entries(preferences.genres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genreId]) => parseInt(genreId))

    // Calculate preferred year range
    if (preferences.preferredYears.length > 0) {
      preferences.preferredYears.sort((a, b) => b - a)
      const recentYears = preferences.preferredYears.slice(0, Math.ceil(preferences.preferredYears.length * 0.7))
      preferences.yearRange = {
        min: Math.min(...recentYears) - 5,
        max: Math.max(...recentYears) + 2
      }
    }

    return preferences
  }

  // Get recommendations based on watchlist analysis
  async getRecommendations(watchlist, limit = 20) {
    try {
      const preferences = this.analyzeWatchlistPreferences(watchlist)
      
      if (!preferences) {
        // If no watchlist, return popular movies
        return await this.getPopularRecommendations(limit)
      }

      const recommendations = []
      
      // Get recommendations for top genres
      for (const genreId of preferences.topGenres.slice(0, 3)) {
        try {
          const genreMovies = await movieService.getMoviesByGenre(genreId, 1)
          if (genreMovies && genreMovies.length > 0) {
            // Filter and score movies
            const scoredMovies = genreMovies
              .filter(movie => this.isGoodRecommendation(movie, preferences, watchlist))
              .map(movie => ({
                ...movie,
                recommendationScore: this.calculateRecommendationScore(movie, preferences)
              }))
              .sort((a, b) => b.recommendationScore - a.recommendationScore)
              .slice(0, Math.ceil(limit / 3))

            recommendations.push(...scoredMovies)
          }
        } catch (error) {
          console.warn(`Error fetching recommendations for genre ${genreId}:`, error)
        }
      }

      // Remove duplicates and sort by score
      const uniqueRecommendations = this.removeDuplicates(recommendations)
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)

      // If we don't have enough recommendations, fill with popular movies
      if (uniqueRecommendations.length < limit) {
        const popularMovies = await this.getPopularRecommendations(limit - uniqueRecommendations.length)
        const filteredPopular = popularMovies.filter(movie => 
          !uniqueRecommendations.some(rec => rec.id === movie.id) &&
          !watchlist.some(watched => watched.id === movie.id)
        )
        uniqueRecommendations.push(...filteredPopular)
      }

      return uniqueRecommendations.slice(0, limit)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return await this.getPopularRecommendations(limit)
    }
  }

  // Check if a movie is a good recommendation
  isGoodRecommendation(movie, preferences, watchlist) {
    // Don't recommend movies already in watchlist
    if (watchlist.some(watched => watched.id === movie.id)) {
      return false
    }

    // Filter by rating (prefer movies close to user's average rating)
    if (movie.vote_average && preferences.averageRating > 0) {
      const ratingDiff = Math.abs(movie.vote_average - preferences.averageRating)
      if (ratingDiff > 3) return false
    }

    // Filter by minimum rating
    if (movie.vote_average && movie.vote_average < 6.0) {
      return false
    }

    // Filter by year range
    if (preferences.yearRange) {
      const releaseDate = movie.release_date || movie.first_air_date
      if (releaseDate) {
        const year = new Date(releaseDate).getFullYear()
        if (year < preferences.yearRange.min || year > preferences.yearRange.max) {
          return false
        }
      }
    }

    return true
  }

  // Calculate recommendation score for a movie
  calculateRecommendationScore(movie, preferences) {
    let score = 0

    // Base score from TMDB rating and popularity
    score += (movie.vote_average || 0) * 10
    score += Math.log(movie.popularity || 1) * 5

    // Genre matching bonus
    if (movie.genre_ids && preferences.genres) {
      movie.genre_ids.forEach(genreId => {
        const genreWeight = preferences.genres[genreId] || 0
        score += genreWeight * 20
      })
    }

    // Rating similarity bonus
    if (movie.vote_average && preferences.averageRating > 0) {
      const ratingDiff = Math.abs(movie.vote_average - preferences.averageRating)
      score += Math.max(0, (3 - ratingDiff) * 10)
    }

    // Recent release bonus
    const releaseDate = movie.release_date || movie.first_air_date
    if (releaseDate) {
      const year = new Date(releaseDate).getFullYear()
      const currentYear = new Date().getFullYear()
      if (year >= currentYear - 3) {
        score += 15
      }
    }

    return score
  }

  // Remove duplicate movies
  removeDuplicates(movies) {
    const seen = new Set()
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false
      }
      seen.add(movie.id)
      return true
    })
  }

  // Get popular movies as fallback
  async getPopularRecommendations(limit = 20) {
    try {
      const popularMovies = await movieService.getTrendingMovies('week')
      return popularMovies.slice(0, limit).map(movie => ({
        ...movie,
        recommendationScore: movie.popularity || 0
      }))
    } catch (error) {
      console.error('Error fetching popular recommendations:', error)
      return []
    }
  }

  // Get genre name from ID (basic mapping)
  getGenreName(genreId) {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    }
    return genreMap[genreId] || 'Unknown'
  }
}

export const recommendationService = new RecommendationService()
