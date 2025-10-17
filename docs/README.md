# Geek's Guild - Pokémon Card Collection Website

## Overview

Geek's Guild is a static website showcasing a personal Pokémon card collection. The site displays approximately 6,000 cards organized by series and sets, with features for browsing, searching, and viewing card details.

## Quick Links

- [Project Architecture](./architecture.md)
- [Data Structure](./data-structure.md)
- [Build System](./build-system.md)
- [Features & Components](./features.md)
- [File Organization](./file-organization.md)
- [Image Management](./image-management.md)
- [Styling Guide](./styling.md)
- [Migration Notes](./migration-notes.md)

## Key Features

1. **Homepage** - Hero section with featured cards carousel
2. **Shop Page** - Browse all Pokémon card series
3. **Series Pages** - View all sets within a series
4. **Set Pages** - View all cards within a set
5. **Search Functionality** - Real-time card search across entire collection
6. **3D Carousel** - Animated featured cards with 3D transforms
7. **Lightbox** - Detailed card view with variant information
8. **Card Variants** - Support for Normal, Reverse Holo, Poke Ball Pattern, Master Ball Pattern

## Technology Stack

### Current Implementation
- **Frontend**: Static HTML, CSS, Vanilla JavaScript
- **Build System**: Node.js scripts
- **Data Storage**: CSV file (`pokemon-cards.csv`)
- **Image Format**: JPG images stored in structured folders
- **Hosting**: GitHub Pages compatible

### Planned Migration
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules or Tailwind CSS
- **Image Optimization**: Next.js Image component
- **Routing**: File-based dynamic routing

## Project Statistics

- **Total Cards**: ~6,000
- **Series**: 13 major series (WOTC, Ex, Diamond & Pearl, etc.)
- **Sets**: 100+ individual sets
- **Images**: 22,000+ files (cards, series logos, set logos)
- **Generated Pages**: ~100 HTML files

## Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Building the Site

```bash
# Build all series and set pages
node build_set_index.js

# Build series index pages
node build_series_index.js
```

### Local Development

Open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

## Project Goals

1. **Preserve Collection Data**: Maintain accurate inventory of personal card collection
2. **Easy Browsing**: Intuitive navigation through series → sets → cards
3. **Search & Discovery**: Quick card lookup by name, set, or number
4. **Visual Appeal**: Modern, responsive design with 3D effects
5. **Performance**: Fast loading, optimized images
6. **Maintainability**: Clean code, well-documented systems

## Future Enhancements

- [ ] Convert to Next.js for better performance and SEO
- [ ] Add user accounts and wishlist functionality
- [ ] Implement card value tracking
- [ ] Add filtering by rarity, type, artist
- [ ] Mobile app version
- [ ] Admin panel for adding/editing cards

## Contact

For questions or contributions, refer to the repository maintainer.

