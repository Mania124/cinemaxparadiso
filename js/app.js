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
const searchViewBtn = document.getElementById('search-view-btn');
const watchlistViewBtn = document.getElementById('watchlist-view-btn');
const searchView = document.getElementById('search-view');
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

  console.log('🎬 CinemaxParadiso initialized successfully!');
}

// View switchers
searchViewBtn.addEventListener('click', () => {
  searchView.style.display = 'block';
  watchlistView.style.display = 'none';
  searchViewBtn.classList.add('active');
  watchlistViewBtn.classList.remove('active');
});

watchlistViewBtn.addEventListener('click', () => {
  searchView.style.display = 'none';
  watchlistView.style.display = 'block';
  watchlistViewBtn.classList.add('active');
  searchViewBtn.classList.remove('active');
  displayWatchlist();
});

// Debounced search
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      resultsDiv.innerHTML = '';
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
    displayResults(data.results);
  } catch (error) {
    resultsDiv.innerHTML = '<div class="error">Error fetching data. Please try again.</div>';
    console.error('Search error:', error);
  }
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
    const overview = item.overview || 'No description available.';
    const releaseDate = item.release_date || item.first_air_date || 'Unknown date';
    const mediaType = item.media_type === 'tv' ? 'TV Show' : 'Movie';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    return `
      <div class="card" data-id="${item.id}" data-type="${item.media_type}">
        <div class="card-image">
          <img src="${poster}" alt="${title}" loading="lazy">
          <div class="rating">${rating}</div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
          <p class="card-type">${mediaType}</p>
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
