// Card Lightbox functionality
(function() {
  'use strict';

  // Create lightbox HTML if it doesn't exist
  function createLightbox() {
    if (document.getElementById('cardLightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.id = 'cardLightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
        <div class="lightbox-image">
          <img id="lightboxImage" src="" alt="">
        </div>
        <div class="lightbox-details">
          <h2 id="lightboxName"></h2>
          <div class="lightbox-detail-item">
            <span class="lightbox-detail-label">Card Number:</span>
            <span class="lightbox-detail-value" id="lightboxNumber"></span>
          </div>
          <div class="lightbox-detail-item">
            <span class="lightbox-detail-label">Set:</span>
            <span class="lightbox-detail-value" id="lightboxSet"></span>
          </div>
          <div class="lightbox-detail-item">
            <span class="lightbox-detail-label">Rarity:</span>
            <span class="lightbox-detail-value" id="lightboxRarity"></span>
          </div>
          <div class="lightbox-detail-item">
            <span class="lightbox-detail-label">Quantity:</span>
            <span class="lightbox-detail-value" id="lightboxQuantity"></span>
          </div>
          <div class="lightbox-detail-item" id="lightboxReverseHoloItem" style="display: none;">
            <span class="lightbox-detail-label">Reverse Holo Qty:</span>
            <span class="lightbox-detail-value" id="lightboxReverseHolo"></span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(lightbox);

    // Close on background click
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  // Initialize lightbox on page load
  function initLightbox() {
    createLightbox();
    attachCardClickListeners();
  }

  // Attach click listeners to all card images
  function attachCardClickListeners() {
    const cardImages = document.querySelectorAll('.card img');
    cardImages.forEach(img => {
      img.addEventListener('click', function() {
        const card = this.closest('.card');
        openLightbox(card, this);
      });
    });
  }

  // Open lightbox with card data
  window.openLightbox = function(cardElement, imgElement) {
    const lightbox = document.getElementById('cardLightbox');
    if (!lightbox) return;

    // Get card data from the card element
    const name = cardElement.querySelector('h3')?.textContent || 'Unknown';
    const imgSrc = imgElement.src;
    
    // Try to get data from data attributes if available
    const cardNumber = cardElement.dataset.cardNumber || extractCardNumber(imgSrc);
    const set = cardElement.dataset.set || getSetNameFromPage();
    const rarity = cardElement.dataset.rarity || 'N/A';
    const quantity = cardElement.dataset.quantity || '1';
    const reverseHolo = cardElement.dataset.reverseHolo || '0';

    // Populate lightbox
    document.getElementById('lightboxImage').src = imgSrc;
    document.getElementById('lightboxName').textContent = name;
    document.getElementById('lightboxNumber').textContent = cardNumber;
    document.getElementById('lightboxSet').textContent = set;
    document.getElementById('lightboxRarity').textContent = rarity;
    document.getElementById('lightboxQuantity').textContent = quantity;
    
    // Show/hide reverse holo item
    const reverseHoloItem = document.getElementById('lightboxReverseHoloItem');
    if (parseInt(reverseHolo) > 0) {
      document.getElementById('lightboxReverseHolo').textContent = reverseHolo;
      reverseHoloItem.style.display = 'flex';
    } else {
      reverseHoloItem.style.display = 'none';
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  // Close lightbox
  window.closeLightbox = function() {
    const lightbox = document.getElementById('cardLightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  };

  // Helper: Extract card number from image path
  function extractCardNumber(imgSrc) {
    const match = imgSrc.match(/\/(\d+)\.jpg$/);
    return match ? match[1] : 'N/A';
  }

  // Helper: Get set name from page title or h2
  function getSetNameFromPage() {
    const h2 = document.querySelector('.hero h2');
    if (h2) return h2.textContent;
    
    const title = document.title;
    const match = title.match(/^(.+?)\s*[–-]/);
    return match ? match[1] : 'Unknown Set';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();

