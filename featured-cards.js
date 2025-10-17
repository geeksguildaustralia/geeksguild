// Featured Cards Carousel
(function() {
  'use strict';

  let allCards = [];
  let currentSlide = 10; // Start from middle so cards are on both sides
  const FEATURED_COUNT = 20;
  let autoRotateInterval = null;

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
    const seriesSlug = normalizeSeriesName(card.series);
    let setSlug = normalizeSetName(card.set);
    
    // Special cases for set slugs
    if (card.set.includes('Trainer Gallery')) {
      const parentSet = card.set.replace(/\s*Trainer Gallery\s*/i, '').trim();
      setSlug = normalizeSetName(parentSet);
    } else if (card.set === 'HGSS Promos') {
      setSlug = 'heartgold-soulsilver-promos';
    }
    
    const cardLink = `series/${seriesSlug}/${setSlug}/index.html`;
    
    cardDiv.innerHTML = `
      <a href="${cardLink}" class="featured-card-link">
        <div class="featured-card-inner">
          <img src="${imgPath}" alt="${card.name}" onerror="this.src='images/default-card.jpg'" />
          <div class="featured-card-info">
            <h3>${card.name}</h3>
            <div class="featured-card-details">
              <span class="featured-card-set">${card.set}</span>
              <span class="featured-card-number">#${card.cardNum}</span>
            </div>
          </div>
        </div>
      </a>
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
      if (i === currentSlide) dot.classList.add('active');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(dot);
    }
    
    // Setup navigation buttons
    document.querySelector('.carousel-prev').addEventListener('click', previousSlide);
    document.querySelector('.carousel-next').addEventListener('click', nextSlide);
    
    // Auto-advance every 5 seconds
    startAutoRotate();
    
    // Stop auto-rotation when hovering over carousel
    const carouselSection = document.querySelector('.featured-carousel');
    if (carouselSection) {
      carouselSection.addEventListener('mouseenter', stopAutoRotate);
      carouselSection.addEventListener('mouseleave', startAutoRotate);
    }
    
    updateCarousel();
  }
  
  function startAutoRotate() {
    if (autoRotateInterval) return; // Already running
    autoRotateInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
      autoRotateInterval = null;
    }
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
    const dots = document.querySelectorAll('.pagination-dot');
    const cards = document.querySelectorAll('.featured-card');
    
    // Apply 3D transforms to each card based on distance from center
    cards.forEach((card, index) => {
      const distance = index - currentSlide;
      const absDistance = Math.abs(distance);
      
      // Show more cards (1 center + 5 on each side = 11 total)
      if (absDistance > 5) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.visibility = 'hidden';
      } else {
        card.style.visibility = 'visible';
        card.style.pointerEvents = 'auto';
        
        // Calculate position and rotation for carousel arc effect
        let translateX, translateZ, rotateY, scale, opacity;
        
        if (absDistance === 0) {
          // Center card - front and center
          translateX = 0;
          translateZ = 0;
          rotateY = 0;
          scale = 1;
          opacity = 1;
        } else if (absDistance === 1) {
          // Adjacent cards - much closer spacing
          translateX = distance * 220;
          translateZ = -120;
          rotateY = distance * -40;
          scale = 0.88;
          opacity = 0.85;
        } else if (absDistance === 2) {
          // Second tier cards - closer
          translateX = distance * 380;
          translateZ = -220;
          rotateY = distance * -45;
          scale = 0.75;
          opacity = 0.7;
        } else if (absDistance === 3) {
          // Third tier cards - closer
          translateX = distance * 520;
          translateZ = -310;
          rotateY = distance * -50;
          scale = 0.65;
          opacity = 0.55;
        } else if (absDistance === 4) {
          // Fourth tier cards
          translateX = distance * 640;
          translateZ = -390;
          rotateY = distance * -53;
          scale = 0.55;
          opacity = 0.4;
        } else if (absDistance === 5) {
          // Fifth tier cards - furthest visible
          translateX = distance * 750;
          translateZ = -460;
          rotateY = distance * -55;
          scale = 0.5;
          opacity = 0.25;
        }
        
        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = 100 - absDistance * 10;
      }
    });
    
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

