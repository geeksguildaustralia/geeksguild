# Styling Guide

## CSS Architecture

### Single Stylesheet Approach

**File**: `geeksguild.css`
**Size**: ~850 lines
**Approach**: Single global stylesheet (no CSS-in-JS, no modules)

**Sections**:
1. CSS Reset & Variables
2. Global Styles
3. Layout (Header, Footer, Main)
4. Components
5. Page-Specific Styles
6. Responsive Styles

## CSS Variables (Custom Properties)

```css
:root {
  /* Colors */
  --bg-dark: #111827;
  --bg-light: #1f2937;
  --surface-dark: #2d3748;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --primary-accent: #4FC3F7;  /* Light blue */
  --secondary-accent: #fdd835;
  --shadow-dark: rgba(0, 0, 0, 0.5);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  
  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.6s ease;
}
```

## Layout System

### Header

**Style**: Fixed, transparent with blur

```css
header {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

**Features**:
- Fixed positioning (stays on screen during scroll)
- Semi-transparent background
- Blur effect for depth
- High z-index for layering

### Navigation

```css
nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-primary);
  text-decoration: none;
  position: relative;
  padding: 0.5rem 1rem;
}

.nav-links a.active,
.nav-links a:hover {
  color: var(--primary-accent);
}

/* Animated underline */
.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-accent);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}
```

### Main Content Area

```css
main {
  margin-top: 80px; /* Account for fixed header */
  min-height: calc(100vh - 80px - 100px); /* Full height minus header and footer */
  padding: 2rem;
}
```

### Footer

```css
footer {
  background: var(--bg-light);
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
```

## Component Styles

### Cards

**Base Card Style**:
```css
.card {
  background: var(--surface-dark);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
```

**Card Image**:
```css
.card-image {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

**Variant Badge**:
```css
.variant-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(79, 195, 247, 0.9);
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

### Grids

**Series/Set Grid**:
```css
.series-grid,
.set-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
```

**Cards Grid**:
```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}
```

### Buttons

**Primary Button**:
```css
.btn-primary {
  background: var(--primary-accent);
  color: #000;
  padding: 0.875rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 195, 247, 0.4);
}
```

**Secondary Button**:
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  padding: 0.875rem 2rem;
  border-radius: 50px;
  border: 2px solid var(--text-primary);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
```

### Search

```css
.search-container {
  position: relative;
}

.search-input {
  background: var(--surface-dark);
  border: 2px solid transparent;
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  color: var(--text-primary);
  width: 300px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-accent);
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.2);
}

#search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-dark);
  border-radius: 12px;
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
```

## 3D Carousel Styles

**Container**:
```css
.carousel-container {
  width: 100%;
  position: relative;
  perspective: 1500px;
  perspective-origin: center center;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  transform-style: preserve-3d;
  position: relative;
  min-height: 600px;
}
```

**Featured Cards**:
```css
.featured-card {
  width: 280px;
  cursor: pointer;
  transition: all 0.6s ease-in-out;
  transform-style: preserve-3d;
  position: absolute;
  left: 50%;
  margin-left: -140px;
  transform-origin: center center;
}

.featured-card-inner {
  background: var(--surface-dark);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  transition: all 0.5s ease;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.featured-card:hover .featured-card-inner {
  box-shadow: 0 25px 80px rgba(79, 195, 247, 0.5),
              0 0 40px rgba(79, 195, 247, 0.3);
  border: 2px solid rgba(79, 195, 247, 0.5);
}
```

**Carousel Buttons**:
```css
.carousel-btn {
  background: var(--surface-dark);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-btn:hover {
  background: var(--primary-accent);
  color: #000;
  transform: scale(1.1);
}
```

## Lightbox (Modal)

```css
.lightbox {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  align-items: center;
  justify-content: center;
}

.lightbox.active {
  display: flex;
}

.lightbox-content {
  background: var(--surface-dark);
  border-radius: 16px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 2rem;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lightbox-close:hover {
  background: rgba(255, 59, 48, 0.8);
  transform: rotate(90deg);
}
```

## Hero Section

```css
.hero {
  background: linear-gradient(
    135deg,
    rgba(17, 24, 39, 0.95),
    rgba(31, 41, 55, 0.9)
  ),
  url('header.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 6rem 2rem 4rem;
  text-align: center;
  color: var(--text-primary);
}

.hero h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 2rem;
}
```

## Responsive Design

### Mobile (max-width: 768px)

```css
@media (max-width: 768px) {
  /* Header */
  header {
    padding: 1rem;
  }
  
  .header-logo {
    height: 60px;
  }
  
  /* Navigation */
  nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  /* Grids */
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem;
  }
  
  .series-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Hero */
  .hero h2 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
  
  /* Carousel */
  .featured-card {
    width: 200px;
    margin-left: -100px;
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
}
```

### Tablet (769px - 1024px)

```css
@media (min-width: 769px) and (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .series-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Desktop (1025px+)

```css
@media (min-width: 1025px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .series-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Animations

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeIn 0.5s ease-in-out;
}
```

### Slide Up

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero {
  animation: slideUp 0.8s ease-out;
}
```

## Utility Classes

```css
/* Text Alignment */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Spacing */
.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }

/* Display */
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }
```

## Print Styles (Future Enhancement)

```css
@media print {
  header,
  footer,
  .carousel,
  .search-container {
    display: none;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .card {
    break-inside: avoid;
  }
}
```

## Dark Mode (Already Default)

The site uses a dark theme by default. Variables make it easy to add light mode:

```css
/* Light mode (future) */
[data-theme="light"] {
  --bg-dark: #ffffff;
  --bg-light: #f5f5f5;
  --surface-dark: #ffffff;
  --text-primary: #000000;
  --text-secondary: #666666;
}
```

## Performance Considerations

### CSS Optimizations
- Single stylesheet (one HTTP request)
- Minimal use of expensive properties (shadows, filters)
- Hardware-accelerated transforms (3D carousel)
- Efficient selectors (avoid deep nesting)

### Loading Strategy
- CSS loaded in `<head>` (render-blocking, but necessary)
- No unused CSS (keep stylesheet lean)
- Consider CSS minification for production

## Browser Compatibility

**Minimum Support**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Modern Features Used**:
- CSS Grid
- CSS Custom Properties
- Flexbox
- 3D Transforms
- `backdrop-filter`
- `:has()` selector (optional enhancement)

**Fallbacks**:
- Graceful degradation for older browsers
- Progressive enhancement approach

