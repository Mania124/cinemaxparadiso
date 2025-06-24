const apiKey = '4e638237159859e0abbb6b15c1a693e4'; 
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');
let debounceTimeout = null;

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    } else {
      resultsDiv.innerHTML = '';
    }
  }, 500); // Debounce delay
});

async function searchMovies(query) {
  resultsDiv.innerHTML = '<p>Loading...</p>';
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    displayResults(data.results);
  } catch (error) {
    resultsDiv.innerHTML = '<p>Error fetching data. Please try again.</p>';
    console.error('API Error:', error);
  }
}

function displayResults(results) {
  if (!results || results.length === 0) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }

  resultsDiv.innerHTML = results.map(item => {
    const title = item.title || item.name || 'No Title';
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';
    const overview = item.overview || 'No description available.';
    const releaseDate = item.release_date || item.first_air_date || 'Unknown date';

    return `
      <div class="card">
        <img src="${poster}" alt="${title}">
        <h3>${title}</h3>
        <p>${overview.substring(0, 100)}...</p>
        <p><strong>Release:</strong> ${releaseDate}</p>
      </div>
    `;
  }).join('');
}
