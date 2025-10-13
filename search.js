// Search functionality for Geek's Guild
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  
  if (!searchInput) return;
  
  // Debounce function to limit search calls
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
  
  // Search function
  function performSearch(query) {
    query = query.toLowerCase().trim();
    
    if (query.length === 0) {
      // Show all items
      showAllItems();
      return;
    }
    
    // Get all searchable items (series cards, set cards, or individual cards)
    const seriesCards = document.querySelectorAll('.series-card');
    const setCards = document.querySelectorAll('.set-card');
    const cards = document.querySelectorAll('.card');
    
    // Search series
    if (seriesCards.length > 0) {
      seriesCards.forEach(card => {
        const seriesName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        if (seriesName.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    // Search sets
    if (setCards.length > 0) {
      setCards.forEach(card => {
        const setName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        if (setName.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    // Search individual cards
    if (cards.length > 0) {
      cards.forEach(card => {
        const cardNumber = card.querySelector('.card-number')?.textContent.toLowerCase() || '';
        const img = card.querySelector('img');
        const imgAlt = img?.alt.toLowerCase() || '';
        const imgSrc = img?.src.toLowerCase() || '';
        
        if (cardNumber.includes(query) || imgAlt.includes(query) || imgSrc.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }
  
  function showAllItems() {
    const allItems = document.querySelectorAll('.series-card, .set-card, .card');
    allItems.forEach(item => {
      item.style.display = '';
    });
  }
  
  // Add event listener with debounce
  searchInput.addEventListener('input', debounce(function(e) {
    performSearch(e.target.value);
  }, 300));
  
  // Clear search on Escape key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      showAllItems();
    }
  });
});

