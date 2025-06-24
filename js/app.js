// API Configuration - Now loaded from config.js
const TMDB_API_KEY = AppConfig.get('TMDB_API_KEY');
const OMDB_API_KEY = AppConfig.get('OMDB_API_KEY');
const TMDB_BASE_URL = AppConfig.get('TMDB_BASE_URL');
const OMDB_BASE_URL = AppConfig.get('OMDB_BASE_URL');
const TMDB_IMAGE_BASE_URL = AppConfig.get('TMDB_IMAGE_BASE_URL');
// DOM Elements
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');
const watchlistDiv = document.getElementById('watchlist');
const trendingContentDiv = document.getElementById('trending-content');
const searchViewBtn = document.getElementById('search-view-btn');
const trendingViewBtn = document.getElementById('trending-view-btn');
const watchlistViewBtn = document.getElementById('watchlist-view-btn');
const searchView = document.getElementById('search-view');
const trendingView = document.getElementById('trending-view');
const watchlistView = document.getElementById('watchlist-view');

// State Management
let debounceTimeout = null;
let currentPage = 1;
let totalPages = 1;

// Initialize app and validate configuration
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // Validate API configuration
  const configValidation = AppConfig.validateConfig();

  if (!configValidation.isValid) {
    console.warn('⚠️ Configuration Issues:', configValidation.issues);

    // Show user-friendly message for missing OMDB key
    if (configValidation.issues.some(issue => issue.includes('OMDB'))) {
      showNotification('OMDB API not configured. Some features may be limited.', 'warning');
    }
  }

  // Load movies by genre on startup (landing page)
  loadMoviesByGenre();

  console.log('🎬 CinemaxParadiso initialized successfully!');
}

// Trending Content Functions
async function loadTrendingContent() {
  try {
    const [trendingMovies, trendingTV] = await Promise.all([
      fetchTrendingMovies(),
      fetchTrendingTV()
    ]);

    // Display in search view if search is empty
    displayTrendingContent(trendingMovies, trendingTV);

    // Also store for trending view
    window.cachedTrendingData = { movies: trendingMovies, tv: trendingTV };

    return { movies: trendingMovies, tv: trendingTV };
  } catch (error) {
    console.error('Error loading trending content:', error);
    return { movies: [], tv: [] };
  }
}

async function loadTrendingContentForView() {
  // Use cached data if available, otherwise fetch fresh
  if (window.cachedTrendingData) {
    displayTrendingContentForView(window.cachedTrendingData.movies, window.cachedTrendingData.tv);
  } else {
    try {
      const [trendingMovies, trendingTV] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingTV()
      ]);

      displayTrendingContentForView(trendingMovies, trendingTV);
      window.cachedTrendingData = { movies: trendingMovies, tv: trendingTV };
    } catch (error) {
      console.error('Error loading trending content for view:', error);
      trendingContentDiv.innerHTML = '<div class="error">Error loading trending content. Please try again.</div>';
    }
  }
}

async function fetchTrendingMovies() {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results.slice(0, 10); // Get top 10
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
}

async function fetchTrendingTV() {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results.slice(0, 10); // Get top 10
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return [];
  }
}

function displayTrendingContent(movies, tvShows) {
  // This will be displayed in the search view when search is empty
  if (searchInput.value.trim() === '') {
    const trendingHtml = createTrendingHTML(movies, tvShows);
    resultsDiv.innerHTML = trendingHtml;
  }
}

function loadTrendingContentForView() {
  // Load trending content specifically for the trending view
  loadTrendingContent().then(() => {
    // The content will be displayed in displayTrendingContentForView
  });
}

function displayTrendingContentForView(movies, tvShows) {
  // Display trending content in the dedicated trending view
  const trendingHtml = createTrendingHTML(movies, tvShows);
  trendingContentDiv.innerHTML = trendingHtml;
}

function createTrendingHTML(movies, tvShows) {
  return `
    <div class="trending-section">
      <h2 class="trending-title">🔥 Trending This Week</h2>

      <div class="trending-category">
        <h3 class="category-title">Movies</h3>
        <div class="trending-grid">
          ${movies.map(movie => createTrendingCard({...movie, media_type: 'movie'})).join('')}
        </div>
      </div>

      <div class="trending-category">
        <h3 class="category-title">TV Shows</h3>
        <div class="trending-grid">
          ${tvShows.map(show => createTrendingCard({...show, media_type: 'tv'})).join('')}
        </div>
      </div>
    </div>
  `;
}

function createTrendingCard(item) {
  const title = item.title || item.name || 'No Title';
  const poster = item.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w200${item.poster_path}`
    : 'https://via.placeholder.com/200x300?text=No+Image';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const popularity = item.popularity ? Math.round(item.popularity) : 0;

  return `
    <div class="trending-card" data-id="${item.id}" data-type="${item.media_type}">
      <div class="trending-image">
        <img src="${poster}" alt="${title}" loading="lazy">
        <div class="trending-rating">${rating}</div>
        <div class="trending-popularity">${popularity}</div>
      </div>
      <div class="trending-content">
        <h4 class="trending-title">${title}</h4>
        <div class="trending-actions">
          <button class="btn-small btn-primary" onclick='addToWatchlist(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
            + Watchlist
          </button>
        </div>
      </div>
    </div>
  `;
}

// Genre-based Movie Loading Functions
async function loadMoviesByGenre() {
  resultsDiv.innerHTML = '<div class="loading">Loading latest movies...</div>';

  try {
    // Popular genres to display (limiting to most popular ones)
    const popularGenres = [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 14, name: 'Fantasy' },
      { id: 27, name: 'Horror' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' }
    ];

    // Fetch movies for each genre
    const genreMovies = await Promise.all(
      popularGenres.map(async (genre) => {
        const movies = await fetchMoviesByGenre(genre.id);
        return {
          genre: genre.name,
          movies: movies.slice(0, 15) // First 15 movies
        };
      })
    );

    displayMoviesByGenre(genreMovies);
  } catch (error) {
    console.error('Error loading movies by genre:', error);
    resultsDiv.innerHTML = '<div class="error">Error loading movies. Please try again.</div>';
  }
}

async function fetchMovieGenres() {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
}

async function fetchMoviesByGenre(genreId) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=release_date.desc&page=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map(movie => ({
      ...movie,
      media_type: 'movie' // Add media_type for consistency
    }));
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error);
    return [];
  }
}

function displayMoviesByGenre(genreMovies) {
  const genreHtml = genreMovies
    .filter(genreData => genreData.movies.length > 0) // Only show genres with movies
    .map(genreData => `
      <div class="genre-section">
        <h2 class="genre-title">${genreData.genre}</h2>
        <div class="genre-horizontal-scroll">
          ${genreData.movies.slice(0, 15).map(movie => createGenreMovieCard(movie)).join('')}
        </div>
      </div>
    `).join('');

  const fullHtml = `
    <div class="movies-by-genre">
      <h1 class="page-title">🎬 Latest Movies by Genre</h1>
      ${genreHtml}
    </div>
  `;

  resultsDiv.innerHTML = fullHtml;
}



function createGenreMovieCard(movie) {
  const title = movie.title || 'No Title';
  const poster = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w300${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const releaseDate = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';

  return `
    <div class="genre-movie-card" data-id="${movie.id}" data-type="movie">
      <div class="genre-movie-image">
        <img src="${poster}" alt="${title}" loading="lazy">
        <div class="genre-movie-rating">${rating}</div>
        <div class="genre-movie-year">${releaseDate}</div>
      </div>
      <div class="genre-movie-content">
        <h4 class="genre-movie-title">${title}</h4>
        <div class="genre-movie-actions">
          <button class="btn-small btn-primary" onclick='addToWatchlist(${JSON.stringify(movie).replace(/'/g, "&apos;")})'>
            + Watchlist
          </button>
          <button class="btn-small btn-secondary" onclick='viewDetails(${movie.id}, "movie")'>
            Details
          </button>
        </div>
      </div>
    </div>
  `;
}

// View switchers
searchViewBtn.addEventListener('click', () => {
  showView('search');
});

trendingViewBtn.addEventListener('click', () => {
  showView('trending');
});

watchlistViewBtn.addEventListener('click', () => {
  showView('watchlist');
});

function showView(viewName) {
  // Hide all views
  searchView.style.display = 'none';
  trendingView.style.display = 'none';
  watchlistView.style.display = 'none';

  // Remove active class from all buttons
  searchViewBtn.classList.remove('active');
  trendingViewBtn.classList.remove('active');
  watchlistViewBtn.classList.remove('active');

  // Show selected view and activate button
  switch(viewName) {
    case 'search':
      searchView.style.display = 'block';
      searchViewBtn.classList.add('active');
      // Load movies by genre in search view if search is empty
      if (!searchInput.value.trim()) {
        loadMoviesByGenre();
      }
      break;
    case 'trending':
      trendingView.style.display = 'block';
      trendingViewBtn.classList.add('active');
      loadTrendingContentForView();
      break;
    case 'watchlist':
      watchlistView.style.display = 'block';
      watchlistViewBtn.classList.add('active');
      displayWatchlist();
      break;
  }
}

// Debounced search
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      // Show movies by genre when search is empty
      loadMoviesByGenre();
    }
  }, 500);
});

async function searchMovies(query, page = 1) {
  resultsDiv.innerHTML = '<div class="loading">Loading...</div>';
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    currentPage = data.page;
    totalPages = data.total_pages;

    // Enhance results with OMDB data if available
    const enhancedResults = await enhanceWithOMDBData(data.results);
    displayResults(enhancedResults);
  } catch (error) {
    resultsDiv.innerHTML = '<div class="error">Error fetching data. Please try again.</div>';
    console.error('Search error:', error);
  }
}

// OMDB API Integration
async function getOMDBData(title, year, type = '') {
  if (!AppConfig.isConfigured('OMDB_API_KEY')) {
    return null;
  }

  try {
    const searchTitle = encodeURIComponent(title);
    const typeParam = type === 'tv' ? '&type=series' : type === 'movie' ? '&type=movie' : '';
    const yearParam = year ? `&y=${year}` : '';

    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${searchTitle}${yearParam}${typeParam}`
    );

    if (!response.ok) {
      throw new Error(`OMDB HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === 'True') {
      return {
        imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
        rottenTomatoesRating: extractRottenTomatoesRating(data.Ratings),
        metacriticRating: data.Metascore !== 'N/A' ? data.Metascore : null,
        plot: data.Plot !== 'N/A' ? data.Plot : null,
        director: data.Director !== 'N/A' ? data.Director : null,
        actors: data.Actors !== 'N/A' ? data.Actors : null,
        awards: data.Awards !== 'N/A' ? data.Awards : null,
        boxOffice: data.BoxOffice !== 'N/A' ? data.BoxOffice : null
      };
    }
  } catch (error) {
    console.warn('OMDB API error:', error);
  }

  return null;
}

function extractRottenTomatoesRating(ratings) {
  if (!ratings || !Array.isArray(ratings)) return null;

  const rtRating = ratings.find(rating => rating.Source === 'Rotten Tomatoes');
  return rtRating ? rtRating.Value : null;
}

async function enhanceWithOMDBData(tmdbResults) {
  if (!AppConfig.isConfigured('OMDB_API_KEY')) {
    return tmdbResults;
  }

  // Enhance first 5 results to avoid rate limiting
  const enhancedResults = await Promise.all(
    tmdbResults.slice(0, 5).map(async (item, index) => {
      const title = item.title || item.name;
      const year = item.release_date ? new Date(item.release_date).getFullYear() :
                   item.first_air_date ? new Date(item.first_air_date).getFullYear() : null;

      // Add delay to respect rate limits
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const omdbData = await getOMDBData(title, year, item.media_type);

      return {
        ...item,
        omdbData: omdbData
      };
    })
  );

  // Return enhanced results + remaining unenhanced results
  return [...enhancedResults, ...tmdbResults.slice(5)];
}

function displayResults(results) {
  if (!results || results.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No results found.</div>';
    return;
  }

  resultsDiv.innerHTML = results.map(item => {
    const title = item.title || item.name || 'No Title';
    const poster = item.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w300${item.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';
    const overview = item.overview || (item.omdbData?.plot) || 'No description available.';
    const releaseDate = item.release_date || item.first_air_date || 'Unknown date';
    const mediaType = item.media_type === 'tv' ? 'TV Show' : 'Movie';
    const tmdbRating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    // Create ratings display with OMDB data if available
    const ratingsHtml = createRatingsDisplay(tmdbRating, item.omdbData);

    return `
      <div class="card" data-id="${item.id}" data-type="${item.media_type}">
        <div class="card-image">
          <img src="${poster}" alt="${title}" loading="lazy">
          <div class="rating-tmdb">${tmdbRating}</div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
          <p class="card-type">${mediaType}</p>
          ${ratingsHtml}
          <p class="card-overview">${overview.substring(0, 120)}${overview.length > 120 ? '...' : ''}</p>
          <p class="card-date"><strong>Release:</strong> ${releaseDate}</p>
          <div class="card-actions">
            <button class="btn-primary" onclick='addToWatchlist(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
              Add to Watchlist
            </button>
            <button class="btn-secondary" onclick='viewDetails(${item.id}, "${item.media_type}")'>
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function createRatingsDisplay(tmdbRating, omdbData) {
  if (!omdbData) {
    return `<div class="ratings-single">
      <span class="rating-item tmdb">TMDB: ${tmdbRating}</span>
    </div>`;
  }

  const ratings = [];

  if (tmdbRating !== 'N/A') {
    ratings.push(`<span class="rating-item tmdb">TMDB: ${tmdbRating}</span>`);
  }

  if (omdbData.imdbRating) {
    ratings.push(`<span class="rating-item imdb">IMDb: ${omdbData.imdbRating}</span>`);
  }

  if (omdbData.rottenTomatoesRating) {
    ratings.push(`<span class="rating-item rt">RT: ${omdbData.rottenTomatoesRating}</span>`);
  }

  if (omdbData.metacriticRating) {
    ratings.push(`<span class="rating-item mc">MC: ${omdbData.metacriticRating}</span>`);
  }

  return ratings.length > 0 ?
    `<div class="ratings-multiple">${ratings.join('')}</div>` :
    `<div class="ratings-single"><span class="rating-item tmdb">TMDB: ${tmdbRating}</span></div>`;
}

function addToWatchlist(item) {
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

  // Prevent duplicates
  if (!watchlist.some(existing => existing.id === item.id && existing.media_type === item.media_type)) {
    // Add timestamp and watched status
    const watchlistItem = {
      ...item,
      addedAt: new Date().toISOString(),
      watched: false
    };

    watchlist.push(watchlistItem);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    showNotification('Added to watchlist!', 'success');
  } else {
    showNotification('Already in watchlist!', 'warning');
  }
}

function displayWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  if (watchlist.length === 0) {
    watchlistDiv.innerHTML = '<div class="empty-state">Your watchlist is empty. Start adding movies and TV shows!</div>';
    return;
  }

  watchlistDiv.innerHTML = watchlist.map(item => {
    const title = item.title || item.name || 'No Title';
    const poster = item.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w300${item.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';
    const mediaType = item.media_type === 'tv' ? 'TV Show' : 'Movie';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const watchedClass = item.watched ? 'watched' : '';

    return `
      <div class="card ${watchedClass}" data-id="${item.id}">
        <div class="card-image">
          <img src="${poster}" alt="${title}" loading="lazy">
          <div class="rating">${rating}</div>
          ${item.watched ? '<div class="watched-badge">✓</div>' : ''}
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
          <p class="card-type">${mediaType}</p>
          <div class="card-actions">
            <button class="btn-secondary" onclick='toggleWatched(${item.id})'>
              ${item.watched ? 'Mark Unwatched' : 'Mark Watched'}
            </button>
            <button class="btn-danger" onclick='removeFromWatchlist(${item.id})'>Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function removeFromWatchlist(id) {
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const removedItem = watchlist.find(item => item.id === id);
  watchlist = watchlist.filter(item => item.id !== id);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  displayWatchlist();

  if (removedItem) {
    showNotification(`Removed "${removedItem.title || removedItem.name}" from watchlist`, 'success');
  }
}

function toggleWatched(id) {
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const item = watchlist.find(item => item.id === id);

  if (item) {
    item.watched = !item.watched;
    item.watchedAt = item.watched ? new Date().toISOString() : null;
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayWatchlist();

    const status = item.watched ? 'watched' : 'unwatched';
    showNotification(`Marked "${item.title || item.name}" as ${status}`, 'success');
  }
}

// Utility Functions
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function viewDetails(id, mediaType) {
  // TODO: Implement detailed view
  console.log(`View details for ${mediaType} with ID: ${id}`);
  showNotification('Detailed view coming soon!', 'info');
}
