# Features & Components

## Homepage Features

### 1. Hero Section

**Location**: `index.html`

**Components**:
- Background image with gradient overlay
- Title: "World Of Rare Pokémon Cards"
- Subtitle text
- Two CTA buttons:
  - "Discover More" (primary)
  - "All Collections" (secondary)

**Styling**:
```css
.hero {
  background: url('header.png');
  background-size: cover;
  padding: 4rem 2rem;
  text-align: center;
}
```

### 2. Featured Cards Carousel

**Location**: `featured-cards.js`

**Features**:
- Displays 20 random cards from collection
- 3D carousel with rotation and depth effects
- Shows 11 cards at once (1 center + 5 on each side)
- Auto-rotation every 5 seconds
- Pauses on hover
- Click card to navigate to set page
- Manual navigation with arrow buttons
- Pagination dots

**Configuration**:
```javascript
const FEATURED_COUNT = 20;  // Total cards in rotation
let currentSlide = 10;      // Start from middle
```

**3D Transform Logic**:
```javascript
// Distance from center determines position
if (absDistance === 0) {
  // Center card - front and center
  translateX = 0;
  translateZ = 0;
  rotateY = 0;
  scale = 1;
  opacity = 1;
} else if (absDistance === 1) {
  // Adjacent cards
  translateX = distance * 220;
  translateZ = -120;
  rotateY = distance * -40;
  scale = 0.88;
  opacity = 0.85;
}
// ... up to distance 5
```

**Card Selection**:
- Random selection from valid cards (with name, set, cardNum, series)
- Excludes cards with missing data
- Reshuffles on each page load

**Navigation**:
- Previous/Next buttons
- Click pagination dots
- Auto-advance (stops on hover)

## Search Functionality

**Location**: `search.js`

**Features**:
- Real-time search across all cards
- Searches through:
  - Card names
  - Set names
  - Card numbers
- Dropdown results with thumbnails
- Click result to navigate to set page
- Keyboard navigation (future enhancement)

**Implementation**:
```javascript
// Load all cards from CSV
fetch('pokemon-cards.csv')
  .then(response => response.text())
  .then(csvText => {
    allCards = parseCSV(csvText);
  });

// Search on input
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  if (query.length < 2) {
    clearResults();
    return;
  }
  
  const results = allCards.filter(card => 
    card.name.toLowerCase().includes(query) ||
    card.set.toLowerCase().includes(query) ||
    card.cardNum.toLowerCase().includes(query)
  );
  
  displayResults(results.slice(0, 10)); // Show top 10
});
```

**Result Display**:
- Card thumbnail image
- Card name
- Set name
- Card number

## Card Lightbox

**Location**: `lightbox.js`

**Features**:
- Modal overlay for card details
- Large card image
- Card information:
  - Name
  - Set name
  - Card number
  - Rarity
- Quantity indicators for each variant:
  - Normal quantity
  - Reverse Holo quantity
  - Poke Ball Pattern quantity
  - Master Ball Pattern quantity
- Close button
- Click outside to close
- ESC key to close

**Trigger**:
```javascript
// Click on any card in grid
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    openLightbox(card.dataset);
  });
});
```

**Data Passed**:
```javascript
{
  name: "Card Name",
  set: "Set Name",
  number: "123",
  rarity: "Rare",
  normal: "1",
  reverse: "0",
  pokeball: "1",
  masterball: "0",
  variants: "Normal,Poke Ball"
}
```

## Card Variants System

**Purpose**: Group multiple versions of the same card together.

**Variant Types**:
1. **Normal** - Base card
2. **Reverse Holo** - Holographic background
3. **Poke Ball Pattern** - Special pattern variant
4. **Master Ball Pattern** - Special pattern variant

**Visual Indicators**:
- Variant badge showing count (e.g., "2 variants")
- Quantity labels for each variant in lightbox
- Color-coded badges (optional)

**Grouping Rules**:
- Same base name (patterns removed)
- Same card number
- Different variant types tracked separately

**Example**:
```
Card: Pikachu #25
├── Normal (qty: 1)
├── Reverse Holo (qty: 0)
├── Poke Ball Pattern (qty: 1)
└── Master Ball Pattern (qty: 0)

Display: "Pikachu #25" with "2 variants" badge
```

## Navigation

### Header Navigation

**Components**:
- Logo (clickable, links to home)
- Navigation links:
  - Home
  - Shop
- Search bar
- Active state highlighting

**Sticky Header**:
```css
header {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
}
```

### Breadcrumb Navigation

**Location**: Series and Set pages

**Example**:
```
Home > Shop > Scarlet and Violet > Obsidian Flames
```

**Implementation**:
```html
<nav class="breadcrumb">
  <a href="../../../index.html">Home</a>
  <span>/</span>
  <a href="../../../shop.html">Shop</a>
  <span>/</span>
  <a href="../index.html">Scarlet and Violet</a>
  <span>/</span>
  <span>Obsidian Flames</span>
</nav>
```

## Series Grid

**Location**: `shop.html`

**Layout**: CSS Grid of series cards

**Card Structure**:
```html
<a href="series/scarlet-violet/index.html" class="series-card">
  <img src="images/scarlet-violet.png" alt="Scarlet and Violet" />
  <span>Scarlet and Violet</span>
</a>
```

**Styling**:
- Hover effects (scale, shadow)
- Responsive grid (1-4 columns based on screen width)
- Image with title overlay

## Set Grid

**Location**: Series index pages

**Layout**: CSS Grid of set cards

**Card Structure**:
```html
<a href="obsidian-flames/index.html" class="set-card">
  <img src="../../images/obsidian-flames.png" alt="Obsidian Flames" />
  <span>Obsidian Flames</span>
</a>
```

**Features**:
- Set logos
- Set names
- Click to view cards

## Cards Grid

**Location**: Set pages

**Layout**: CSS Grid of card thumbnails

**Card Structure**:
```html
<div class="card" 
     data-name="Pikachu"
     data-number="25"
     data-rarity="Common"
     data-normal="1"
     data-reverse="0"
     data-pokeball="0"
     data-masterball="0"
     data-variants="Normal">
  <div class="card-image">
    <img src="../../../images/cards/scarlet-violet/base-set/25.jpg" />
    <span class="variant-badge">1 variant</span>
  </div>
  <div class="card-info">
    <h3>Pikachu</h3>
    <p class="card-number">#25</p>
    <p class="card-rarity">Common</p>
  </div>
  <div class="card-quantity">
    <span class="qty-normal">Normal: 1</span>
  </div>
</div>
```

**Features**:
- Card image with lazy loading
- Card name, number, rarity
- Quantity indicators
- Variant badge
- Hover effects
- Click to open lightbox

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .featured-carousel {
    /* Simplified carousel for mobile */
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile Optimizations
- Simplified carousel (fewer visible cards)
- Smaller navigation
- Stacked layout for card details
- Touch-friendly buttons
- Optimized image sizes

## Image Handling

### Lazy Loading
```html
<img loading="lazy" src="card.jpg" alt="Card Name" />
```

### Error Handling
```html
<img src="card.jpg" 
     onerror="this.src='../../../images/default-card.jpg'" />
```

### Image Optimization
- JPG format for cards (balance of quality/size)
- PNG format for logos (transparency support)
- Appropriate sizing (not oversized)

## Performance Features

### Static Generation
- Pre-generated HTML (instant page loads)
- No database queries
- No server-side processing

### CSS Optimizations
- Single CSS file (cached)
- Minimal selectors
- CSS Grid/Flexbox (hardware accelerated)

### JavaScript Optimizations
- Vanilla JS (no framework overhead)
- Event delegation where possible
- Debounced search input
- Lazy image loading

## Accessibility

### Semantic HTML
```html
<header>, <nav>, <main>, <section>, <article>, <footer>
```

### Alt Text
All images have descriptive alt text:
```html
<img src="pikachu.jpg" alt="Pikachu card from Scarlet & Violet Base Set" />
```

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons/links
- ESC to close lightbox

### ARIA Labels (Future Enhancement)
```html
<button aria-label="Previous card">←</button>
<button aria-label="Next card">→</button>
```

## Future Feature Ideas

- [ ] Advanced filtering (by rarity, type, artist)
- [ ] Sorting options (by number, name, rarity)
- [ ] Collection statistics dashboard
- [ ] User accounts and wishlists
- [ ] Card value tracking
- [ ] Print quality indicators
- [ ] Multiple languages
- [ ] Dark/Light theme toggle
- [ ] Export collection to PDF
- [ ] Share specific cards on social media

