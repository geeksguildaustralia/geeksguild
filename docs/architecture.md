# Project Architecture

## System Overview

Geek's Guild uses a **static site generation** approach where Node.js build scripts read card data from a CSV file and generate HTML pages for each series and set.

```
CSV Data → Build Scripts → Static HTML Pages → Browser
```

## Architecture Diagram

```
pokemon-cards.csv (Source of Truth)
        ↓
Build Scripts (Node.js)
├── build_set_index.js      → Generates set pages & series index
└── build_series_index.js   → Generates series navigation
        ↓
HTML Output
├── index.html              (Homepage)
├── shop.html               (All series)
└── series/
    ├── {series-slug}/
    │   ├── index.html      (Series page - lists sets)
    │   └── {set-slug}/
    │       └── index.html  (Set page - lists cards)
```

## Core Components

### 1. Data Layer
- **Source**: `pokemon-cards.csv` (~6,000 rows)
- **Format**: Comma-separated values
- **Columns**: Name, Set, Card Number, Rarity, Variance, Status, Notes, Quantity, Series

### 2. Build Layer
- **Purpose**: Transform CSV data into browsable HTML pages
- **Scripts**:
  - `build_set_index.js` - Main builder (sets & series pages)
  - `build_series_index.js` - Series navigation generator
- **Templates**:
  - `series_index_template.html` - Template for series pages
  - `set_index_template.html` - Template for set pages

### 3. Presentation Layer
- **Static HTML**: Pre-generated pages for all routes
- **CSS**: Single `geeksguild.css` file
- **JavaScript**:
  - `search.js` - Global search functionality
  - `featured-cards.js` - Homepage carousel
  - `lightbox.js` - Card detail modal
  - `shop.js` - Series page interactivity

## Data Flow

### Build Time
1. Read `pokemon-cards.csv`
2. Parse and validate data
3. Group cards by series and set
4. Normalize names into URL slugs
5. Generate HTML for each set
6. Generate HTML for each series index
7. Write files to `series/` directory

### Runtime
1. User navigates to page
2. Browser loads static HTML
3. JavaScript enhances interactivity:
   - Search functionality
   - Carousel animations
   - Lightbox modals
   - Image lazy loading

## URL Structure

```
/                                    → index.html (Homepage)
/shop.html                           → Shop (All series)
/series/{series-slug}/index.html     → Series page (Shows sets)
/series/{series-slug}/{set-slug}/index.html  → Set page (Shows cards)
```

### Slug Generation Rules

**Series Slug** (removes "and" from series names):
```javascript
"Scarlet and Violet" → "scarlet-violet"
"Black and White" → "black-white"
```

**Set Slug** (keeps "and" in folder names):
```javascript
"Scarlet & Violet Base Set" → "scarlet-violet-base-set"
"XY - Fates Collide" → "xy-fates-collide"
```

## Page Types

### 1. Homepage (`index.html`)
- Hero section with background image
- Featured cards carousel (20 random cards)
- Navigation header
- Search bar

### 2. Shop Page (`shop.html`)
- Grid of all series with logos
- Navigation header
- Search bar

### 3. Series Index Page
- Grid of all sets within the series
- Breadcrumb navigation
- Set logos and names

### 4. Set Page
- Grid of all cards in the set
- Card thumbnails with details
- Quantity indicators
- Variant badges
- Click to open lightbox

## State Management

Since this is a static site, there's no centralized state management. State is handled locally:

- **Search**: State in `search.js` (input value, results array)
- **Carousel**: State in `featured-cards.js` (currentSlide, autoRotateInterval)
- **Lightbox**: State in `lightbox.js` (isOpen, selectedCard)

## Performance Considerations

### Current Implementation
- **Pros**:
  - Extremely fast page loads (pre-generated HTML)
  - No server required
  - Free hosting (GitHub Pages)
  - SEO-friendly (static HTML)

- **Cons**:
  - Full page reload on navigation
  - No client-side routing
  - Manual rebuild required for data changes
  - Large number of files (~100 HTML pages)

### Future (Next.js)
- **Improvements**:
  - Client-side navigation (no reloads)
  - Image optimization
  - Code splitting
  - Incremental Static Regeneration (ISR)
  - API routes for dynamic features

## File Generation Strategy

### What Gets Generated
- One HTML file per set (~80-100 files)
- One HTML file per series (~13 files)
- All files stored in `series/` directory

### What's Static
- `index.html` (manually maintained)
- `shop.html` (manually maintained)
- `geeksguild.css` (manually maintained)
- All JavaScript files (manually maintained)
- All images (manually maintained)

## Build Process Details

### Step 1: Parse CSV
```javascript
const csvText = fs.readFileSync('pokemon-cards.csv', 'utf-8');
const rows = parseCSV(csvText);
```

### Step 2: Group by Series & Set
```javascript
const groupedData = {};
rows.forEach(row => {
  const series = row[8]; // Series column
  const set = row[1];    // Set column
  // Group cards
});
```

### Step 3: Generate HTML
```javascript
Object.keys(groupedData).forEach(series => {
  Object.keys(groupedData[series]).forEach(set => {
    const html = generateSetPage(cards);
    fs.writeFileSync(`series/${seriesSlug}/${setSlug}/index.html`, html);
  });
});
```

### Step 4: Write Files
All generated files are written to disk, ready to be served statically.

## Dependencies

### Build Dependencies
- `fs` (Node.js built-in)
- `path` (Node.js built-in)

### Runtime Dependencies
- None! Pure vanilla JavaScript

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features used
- CSS Grid and Flexbox for layout
- CSS 3D Transforms for carousel

