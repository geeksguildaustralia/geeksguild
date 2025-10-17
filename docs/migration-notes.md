# Next.js Migration Guide

## Overview

This document outlines the plan for migrating Geek's Guild from a static HTML site to a modern Next.js application.

## Migration Goals

1. **Preserve All Functionality**: Maintain every feature from the current site
2. **Improve Performance**: Faster page loads, better SEO, optimized images
3. **Better Developer Experience**: TypeScript, hot reload, component reusability
4. **Future-Proof**: Easier to add new features (user accounts, filtering, etc.)
5. **Maintain URL Structure**: Keep existing URLs for SEO

## Technology Stack

### Next.js 14+ (App Router)
- Server Components by default
- Client Components for interactivity
- File-based routing
- Built-in image optimization
- API routes for future features

### TypeScript
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

### Styling Options
**Option A**: CSS Modules (similar to current approach)
**Option B**: Tailwind CSS (utility-first)
**Option C**: Styled Components (CSS-in-JS)
**Recommended**: CSS Modules for easier migration

### Data Management
- Parse CSV at build time
- Generate static pages (SSG)
- Optional: Convert CSV to JSON for easier parsing
- Optional: Use Prisma + SQLite for future database needs

## Project Structure (Proposed)

```
geeksguild-nextjs/
├── app/
│   ├── layout.tsx              # Root layout (header, footer)
│   ├── page.tsx                # Homepage
│   ├── shop/
│   │   └── page.tsx            # Series grid
│   ├── series/
│   │   └── [seriesSlug]/
│   │       ├── page.tsx        # Series index (sets grid)
│   │       └── [setSlug]/
│   │           └── page.tsx    # Set page (cards grid)
│   └── api/                    # API routes (optional)
│       └── search/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   ├── SearchBar.tsx
│   ├── FeaturedCarousel.tsx
│   ├── CardGrid.tsx
│   ├── Card.tsx
│   ├── Lightbox.tsx
│   ├── SeriesCard.tsx
│   └── SetCard.tsx
├── lib/
│   ├── cardData.ts             # CSV parsing & data utilities
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Helper functions
├── public/
│   ├── images/                 # All existing images
│   ├── pokemon-cards.csv
│   └── favicon.ico
├── styles/
│   ├── globals.css             # Global styles
│   └── [component].module.css  # Component styles
├── next.config.js
├── tsconfig.json
└── package.json
```

## TypeScript Types

### Card Type
```typescript
interface Card {
  name: string;
  set: string;
  cardNum: string;
  rarity: string;
  variance?: string;
  status?: string;
  notes?: string;
  quantity: number;
  series: string;
}
```

### Grouped Card Type (with variants)
```typescript
interface GroupedCard {
  name: string;
  set: string;
  cardNum: string;
  rarity: string;
  series: string;
  normalQty: number;
  reverseHoloQty: number;
  pokeBallQty: number;
  masterBallQty: number;
  variants: ('Normal' | 'Reverse Holo' | 'Poke Ball' | 'Master Ball')[];
  cleanCardNum: number;
}
```

### Series/Set Types
```typescript
interface Series {
  name: string;
  slug: string;
  sets: Set[];
}

interface Set {
  name: string;
  slug: string;
  series: string;
  cards: GroupedCard[];
}
```

## Routing Migration

### Current URLs → Next.js Routes

| Current URL | Next.js Route | Page Type |
|-------------|---------------|-----------|
| `/index.html` | `/` | Static |
| `/shop.html` | `/shop` | Static |
| `/series/scarlet-violet/index.html` | `/series/scarlet-violet` | Dynamic (SSG) |
| `/series/scarlet-violet/base-set/index.html` | `/series/scarlet-violet/base-set` | Dynamic (SSG) |

### Dynamic Route Implementation

**`app/series/[seriesSlug]/page.tsx`**:
```typescript
export async function generateStaticParams() {
  const series = await getAllSeries();
  return series.map((s) => ({
    seriesSlug: s.slug,
  }));
}

export default function SeriesPage({ params }: { params: { seriesSlug: string } }) {
  const seriesData = getSeriesData(params.seriesSlug);
  return <SeriesView series={seriesData} />;
}
```

**`app/series/[seriesSlug]/[setSlug]/page.tsx`**:
```typescript
export async function generateStaticParams() {
  const allSets = await getAllSets();
  return allSets.map((set) => ({
    seriesSlug: set.seriesSlug,
    setSlug: set.slug,
  }));
}

export default function SetPage({ params }: { params: { seriesSlug: string; setSlug: string } }) {
  const setData = getSetData(params.seriesSlug, params.setSlug);
  return <SetView set={setData} />;
}
```

## Component Migration

### 1. Header Component

**Current**: Static HTML in every page
**Next.js**: Shared layout component

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// components/Header.tsx
'use client';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image src="/geeksguild-logo.png" alt="Logo" width={200} height={140} />
      </Link>
      <Navigation />
      <SearchBar />
    </header>
  );
}
```

### 2. Featured Carousel

**Current**: `featured-cards.js` with vanilla JS
**Next.js**: React component with state

```typescript
// components/FeaturedCarousel.tsx
'use client';

import { useState, useEffect } from 'react';

interface FeaturedCarouselProps {
  cards: Card[];
}

export default function FeaturedCarousel({ cards }: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % cards.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPaused, cards.length]);
  
  return (
    <div 
      className={styles.carousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel implementation */}
    </div>
  );
}
```

### 3. Search Component

**Current**: Fetches CSV, filters in browser
**Next.js**: API route or server-side filtering

**Option A: Client-side (similar to current)**:
```typescript
// components/SearchBar.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    const filtered = allCards.filter(card =>
      card.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(filtered.slice(0, 10));
  }, [query]);
  
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cards..."
      />
      {results.length > 0 && (
        <SearchResults results={results} />
      )}
    </div>
  );
}
```

**Option B: API route (better for large datasets)**:
```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchCards } from '@/lib/cardData';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }
  
  const results = searchCards(query);
  return NextResponse.json(results.slice(0, 10));
}
```

### 4. Lightbox Component

**Current**: Vanilla JS modal
**Next.js**: React Portal with state

```typescript
// components/Lightbox.tsx
'use client';

import { createPortal } from 'react-dom';

interface LightboxProps {
  card: GroupedCard | null;
  onClose: () => void;
}

export default function Lightbox({ card, onClose }: LightboxProps) {
  if (!card) return null;
  
  return createPortal(
    <div className={styles.lightbox} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>×</button>
        {/* Card details */}
      </div>
    </div>,
    document.body
  );
}
```

## Data Layer Migration

### CSV Parser

```typescript
// lib/cardData.ts
import fs from 'fs';
import path from 'path';

export function parseCSV(csvText: string): Card[] {
  const lines = csvText.trim().split('\n');
  return lines.map(line => {
    const cells = line.split(',').map(cell => cell.trim());
    return {
      name: cells[0],
      set: cells[1],
      cardNum: cells[2],
      rarity: cells[3],
      variance: cells[4],
      status: cells[5],
      notes: cells[6],
      quantity: parseInt(cells[7]) || 1,
      series: cells[8],
    };
  });
}

export function getAllCards(): Card[] {
  const csvPath = path.join(process.cwd(), 'public/pokemon-cards.csv');
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  return parseCSV(csvText);
}

export function getCardsBySeries(seriesSlug: string): Card[] {
  const allCards = getAllCards();
  return allCards.filter(card => 
    normalizeSeriesName(card.series) === seriesSlug
  );
}

export function getCardsBySet(seriesSlug: string, setSlug: string): Card[] {
  const allCards = getAllCards();
  return allCards.filter(card => 
    normalizeSeriesName(card.series) === seriesSlug &&
    normalizeName(card.set) === setSlug
  );
}
```

### Grouping Logic (Same as Current)

```typescript
// lib/cardData.ts
export function groupCards(cards: Card[]): GroupedCard[] {
  const cardMap = new Map<string, GroupedCard>();
  
  cards.forEach(card => {
    const baseName = card.name
      .replace(/\s*\(Poke Ball Pattern\)\s*/gi, '')
      .replace(/\s*\(Master Ball Pattern\)\s*/gi, '')
      .trim();
      
    const key = `${baseName}|${card.cardNum}`;
    
    if (!cardMap.has(key)) {
      cardMap.set(key, {
        name: baseName,
        set: card.set,
        cardNum: card.cardNum,
        rarity: card.rarity,
        series: card.series,
        normalQty: 0,
        reverseHoloQty: 0,
        pokeBallQty: 0,
        masterBallQty: 0,
        variants: [],
        cleanCardNum: parseInt(card.cardNum.match(/\d+/)?.[0] || '0'),
      });
    }
    
    const grouped = cardMap.get(key)!;
    const isPokeBall = card.name.toLowerCase().includes('poke ball pattern');
    const isMasterBall = card.name.toLowerCase().includes('master ball pattern');
    const isReverse = card.variance?.toLowerCase().includes('reverse');
    
    if (isPokeBall) {
      grouped.pokeBallQty += card.quantity;
      if (!grouped.variants.includes('Poke Ball')) grouped.variants.push('Poke Ball');
    } else if (isMasterBall) {
      grouped.masterBallQty += card.quantity;
      if (!grouped.variants.includes('Master Ball')) grouped.variants.push('Master Ball');
    } else if (isReverse) {
      grouped.reverseHoloQty += card.quantity;
      if (!grouped.variants.includes('Reverse Holo')) grouped.variants.push('Reverse Holo');
    } else {
      grouped.normalQty += card.quantity;
      if (!grouped.variants.includes('Normal')) grouped.variants.push('Normal');
    }
  });
  
  return Array.from(cardMap.values()).sort((a, b) => a.cleanCardNum - b.cleanCardNum);
}
```

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

// Before (current)
<img src="../../../images/cards/scarlet-violet/base-set/25.jpg" alt="Pikachu" />

// After (Next.js)
<Image
  src="/images/cards/scarlet-violet/base-set/25.jpg"
  alt="Pikachu"
  width={488}
  height={680}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/images/default-card.jpg"
/>
```

**Benefits**:
- Automatic image optimization
- WebP/AVIF conversion
- Responsive images
- Lazy loading
- Blur placeholders

## Styling Migration

### CSS Modules Approach

```typescript
// components/Card.module.css
.card {
  background: var(--surface-dark);
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

// components/Card.tsx
import styles from './Card.module.css';

export default function Card({ card }: { card: GroupedCard }) {
  return (
    <div className={styles.card}>
      {/* Card content */}
    </div>
  );
}
```

### Global Styles

```css
/* styles/globals.css */
@import './variables.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-primary);
  background: var(--bg-dark);
  color: var(--text-primary);
}
```

## Build Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For static export (GitHub Pages)
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Match current URL structure
};

module.exports = nextConfig;
```

### Static Export

```bash
# Build static site
npm run build

# Output directory
out/
├── index.html
├── shop.html
├── series/
│   ├── scarlet-violet.html
│   └── scarlet-violet/
│       └── base-set.html
```

## Migration Steps

### Phase 1: Setup (Day 1)
1. Create new Next.js project
2. Set up TypeScript configuration
3. Copy over images and CSV file
4. Create basic types
5. Implement CSV parser

### Phase 2: Core Pages (Days 2-3)
1. Create root layout (header, footer)
2. Build homepage with hero
3. Implement shop page (series grid)
4. Create dynamic series pages
5. Create dynamic set pages

### Phase 3: Components (Days 4-5)
1. Build Card component
2. Implement Lightbox
3. Create SearchBar
4. Build FeaturedCarousel
5. Add Navigation

### Phase 4: Features (Day 6)
1. Implement search functionality
2. Add variant grouping
3. Create pagination
4. Add error pages (404, 500)

### Phase 5: Polish (Day 7)
1. Style refinements
2. Responsive design
3. Performance optimization
4. SEO metadata
5. Testing

### Phase 6: Deployment
1. Build static export
2. Test locally
3. Deploy to GitHub Pages (or Vercel)
4. Verify all features work

## Testing Strategy

### Unit Tests (Optional)
- Test CSV parser
- Test grouping logic
- Test slug generation
- Test utility functions

### Integration Tests (Optional)
- Test page rendering
- Test navigation
- Test search
- Test lightbox

### Manual Testing (Required)
- Test all pages load
- Test all images display
- Test search works
- Test carousel works
- Test lightbox works
- Test mobile responsiveness

## Deployment Options

### Option A: GitHub Pages (Static Export)
- Free hosting
- Same as current
- No server-side features
- Requires `output: 'export'`

### Option B: Vercel (Recommended)
- Free for personal projects
- Automatic deployments
- Edge network (faster)
- Can use server-side features
- Built-in analytics

### Option C: Netlify
- Similar to Vercel
- Free tier
- Good DX

## Future Enhancements (Post-Migration)

1. **User Accounts**: Next Auth for authentication
2. **Database**: Migrate from CSV to Prisma + PostgreSQL
3. **API Routes**: RESTful API for card data
4. **Admin Panel**: Add/edit cards through UI
5. **Advanced Search**: Filters, sorting, facets
6. **Card Values**: Track and display market prices
7. **Wishlists**: User collections and wishlists
8. **Social Features**: Share cards, comments
9. **Mobile App**: React Native with shared components
10. **Analytics**: Track popular cards, searches

## Backup Plan

- Keep current site live during migration
- Test Next.js version on subdomain
- Gradual rollout if needed
- Easy rollback to current version

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)

