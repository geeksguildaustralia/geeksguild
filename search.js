// Global search functionality for Geek's Guild
let allCards = [];
let isDataLoaded = false;

// Get the base path for fetching CSV
function getBasePath() {
  // GitHub Pages might host at /geeksguild/ or root /
  // Check if we're in a subdirectory
  const currentPath = window.location.pathname;
  
  if (currentPath.startsWith('/geeksguild/')) {
    return '/geeksguild/';
  }
  
  return '/';
}

// Load the CSV data once
async function loadCardData() {
  if (isDataLoaded) return;
  
  try {
    const basePath = getBasePath();
    const csvPath = `${basePath}pokemon-cards.csv`;
    console.log('Loading CSV from:', csvPath);
    
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV loaded, length:', csvText.length);
    
    // Parse CSV - handle quoted fields properly
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    console.log('CSV Headers:', headers);
    
    allCards = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        // Simple CSV parse (doesn't handle quotes with commas inside)
        const values = line.split(',');
        return {
          name: values[0]?.trim() || '',      // Product Name
          set: values[1]?.trim() || '',       // Set
          cardNumber: values[2]?.trim() || '', // Card Number
          series: values[8]?.trim() || ''     // Series
        };
      })
      .filter(card => card.series && card.set && card.cardNumber);
    
    console.log('Cards loaded:', allCards.length);
    console.log('Sample card:', allCards[0]);
    isDataLoaded = true;
  } catch (error) {
    console.error('Failed to load card data:', error);
  }
}

// Convert to URL-friendly slug
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[&:]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate card image path
function getCardImagePath(card) {
  const basePath = getBasePath();
  const seriesSlug = toSlug(card.series);
  const setSlug = toSlug(card.set);
  return `${basePath}images/${seriesSlug}/${setSlug}/${card.cardNumber}.jpg`;
}

// Generate card page URL
function getCardPageUrl(card) {
  const basePath = getBasePath();
  const seriesSlug = toSlug(card.series);
  const setSlug = toSlug(card.set);
  return `${basePath}series/${seriesSlug}/${setSlug}/index.html#card-${card.cardNumber}`;
}

// Search cards
function searchCards(query) {
  if (!query || query.length < 2) return [];
  
  query = query.toLowerCase();
  console.log('Searching for:', query, 'in', allCards.length, 'cards');
  
  const results = allCards.filter(card => {
    const cardNum = card.cardNumber.toLowerCase();
    const cardName = card.name.toLowerCase();
    const setName = card.set.toLowerCase();
    const seriesName = card.series.toLowerCase();
    
    return cardNum.includes(query) || 
           cardName.includes(query) || 
           setName.includes(query) ||
           seriesName.includes(query);
  });
  
  console.log('Found', results.length, 'results');
  
  // Limit to 20 results
  return results.slice(0, 20);
}

// Display search results
function displaySearchResults(results, query) {
  const resultsContainer = document.getElementById('search-results');
  
  if (!resultsContainer) return;
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="search-no-results">
        No cards found for "${query}"
      </div>
    `;
    resultsContainer.classList.add('active');
    return;
  }
  
  let html = '';
  results.forEach(card => {
    const imagePath = getCardImagePath(card);
    const pageUrl = getCardPageUrl(card);
    const displayName = card.name || `Card #${card.cardNumber}`;
    
    html += `
      <a href="${pageUrl}" class="search-result-item">
        <img src="${imagePath}" alt="${displayName}" class="search-result-image" onerror="this.style.display='none'" />
        <div class="search-result-info">
          <div class="search-result-name">${displayName}</div>
          <div class="search-result-details">#${card.cardNumber} · ${card.set} · ${card.series}</div>
        </div>
      </a>
    `;
  });
  
  resultsContainer.innerHTML = html;
  resultsContainer.classList.add('active');
}

// Hide search results
function hideSearchResults() {
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.classList.remove('active');
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize search
document.addEventListener('DOMContentLoaded', async function() {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  
  if (!searchInput) return;
  
  // Load card data
  await loadCardData();
  
  // Search on input
  const performSearch = debounce(function(query) {
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    
    const results = searchCards(query);
    displaySearchResults(results, query);
  }, 300);
  
  searchInput.addEventListener('input', function(e) {
    performSearch(e.target.value);
  });
  
  // Clear on Escape
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      hideSearchResults();
    }
  });
  
  // Hide results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !resultsContainer?.contains(e.target)) {
      hideSearchResults();
    }
  });
  
  // Prevent hiding when clicking inside search container
  searchInput.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  if (resultsContainer) {
    resultsContainer.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
});
