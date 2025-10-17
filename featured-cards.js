// Featured Cards Carousel
(function() {
  'use strict';

  let allCards = [];
  let currentSlide = 0;
  const FEATURED_COUNT = 7;

  // Load CSV and initialize carousel
  fetch('pokemon-cards.csv')
    .then(response => response.text())
    .then(csvText => {
      allCards = parseCSV(csvText);
      initCarousel();
    })
    .catch(error => console.error('Error loading cards:', error));

  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    return lines.map(line => {
      const cells = line.split(',').map(cell => cell.trim());
      return {
        name: cells[0],
        set: cells[1],
        cardNum: cells[2],
        rarity: cells[3],
        variant: cells[4],
        quantity: cells[7],
        series: cells[8]
      };
    });
  }

  function normalizeSeriesName(name) {
    return name
      .toLowerCase()
      .replace(/\band\b/g, '')
      .replace(/'/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeSetName(name) {
    return name
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\band\b/g, '')
      .replace(/'/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getRandomCards(count) {
    // Filter out cards with valid data
    const validCards = allCards.filter(card => 
      card.name && card.set && card.cardNum && card.series
    );
    
    // Shuffle and pick random cards
    const shuffled = validCards.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function getCardImagePath(card) {
    const seriesSlug = normalizeSeriesName(card.series);
    let setSlug = normalizeSetName(card.set);
    
    // Special cases
    if (card.set.includes('Trainer Gallery')) {
      const parentSet = card.set.replace(/\s*Trainer Gallery\s*/i, '').trim();
      setSlug = normalizeSetName(parentSet);
    } else if (card.set === 'HGSS Promos') {
      setSlug = 'heartgold-soulsilver-promos';
    }
    
    // Extract numeric card number
    const numericMatch = card.cardNum.match(/\d+/);
    const cardNumber = numericMatch ? numericMatch[0] : card.cardNum;
    
    return `images/cards/${seriesSlug}/${setSlug}/${cardNumber}.jpg`;
  }

  function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'featured-card';
    cardDiv.dataset.index = index;
    
    const imgPath = getCardImagePath(card);
    
    cardDiv.innerHTML = `
      <div class="featured-card-inner">
        <div class="featured-card-timer">00h 13m 40s</div>
        <img src="${imgPath}" alt="${card.name}" onerror="this.src='images/default-card.jpg'" />
        <div class="featured-card-info">
          <h3>${card.name}</h3>
          <div class="featured-card-details">
            <span class="featured-card-set">${card.set}</span>
            <span class="featured-card-number">#${card.cardNum}</span>
          </div>
        </div>
      </div>
    `;
    
    return cardDiv;
  }

  function initCarousel() {
    const track = document.getElementById('featuredCardsTrack');
    const pagination = document.getElementById('carouselPagination');
    
    if (!track) return;
    
    // Get 7 random cards
    const featuredCards = getRandomCards(FEATURED_COUNT);
    
    // Create card elements
    featuredCards.forEach((card, index) => {
      track.appendChild(createCardElement(card, index));
    });
    
    // Create pagination dots
    for (let i = 0; i < FEATURED_COUNT; i++) {
      const dot = document.createElement('button');
      dot.className = 'pagination-dot';
      if (i === 0) dot.classList.add('active');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(dot);
    }
    
    // Setup navigation buttons
    document.querySelector('.carousel-prev').addEventListener('click', previousSlide);
    document.querySelector('.carousel-next').addEventListener('click', nextSlide);
    
    // Auto-advance every 5 seconds
    setInterval(nextSlide, 5000);
    
    updateCarousel();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
  }

  function previousSlide() {
    currentSlide = (currentSlide - 1 + FEATURED_COUNT) % FEATURED_COUNT;
    updateCarousel();
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % FEATURED_COUNT;
    updateCarousel();
  }

  function updateCarousel() {
    const track = document.getElementById('featuredCardsTrack');
    const dots = document.querySelectorAll('.pagination-dot');
    
    if (!track) return;
    
    // Calculate offset based on card width + gap
    const cardWidth = 280; // card width + gap
    const offset = -currentSlide * cardWidth;
    
    track.style.transform = `translateX(${offset}px)`;
    
    // Update pagination dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Initialization happens in fetch callback
    });
  }
})();

