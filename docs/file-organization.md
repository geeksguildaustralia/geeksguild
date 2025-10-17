# File Organization

## Root Directory Structure

```
geeksguild/
├── docs/                       # Documentation (you are here!)
├── images/                     # All images (cards, logos, etc.)
├── node_modules/               # npm dependencies
├── output/                     # Build artifacts
├── scripts/                    # Utility scripts
├── series/                     # Generated HTML pages
├── build_series_index.js       # Build script for series pages
├── build_set_index.js          # Main build script
├── convert-to-web.js           # Image conversion script
├── featured-cards.js           # Homepage carousel
├── geeksguild.css              # Main stylesheet
├── geeksguild-logo.png         # Site logo
├── header.png                  # Hero background image
├── index.html                  # Homepage
├── lightbox.js                 # Card detail modal
├── package.json                # npm configuration
├── package-lock.json           # npm lock file
├── pokemon-cards.csv           # Card data (source of truth)
├── search.js                   # Search functionality
├── series_index_template.html  # Template for series pages
├── set_index_template.html     # Template for set pages
├── set_template.html           # (legacy/unused)
└── shop.html                   # Series grid page
```

## Documentation (`/docs`)

```
docs/
├── README.md                   # Documentation overview
├── architecture.md             # System architecture
├── build-system.md             # Build process details
├── data-structure.md           # CSV and data formats
├── features.md                 # Feature descriptions
├── file-organization.md        # This file
├── image-management.md         # Image handling guide
├── migration-notes.md          # Next.js migration guide
└── styling.md                  # CSS architecture
```

## Images Directory (`/images`)

```
images/
├── cards/                      # Card images by series/set
│   ├── scarlet-violet/
│   │   ├── base-set/
│   │   │   ├── 1.jpg
│   │   │   ├── 2.jpg
│   │   │   └── ...
│   │   ├── obsidian-flames/
│   │   │   └── ...
│   │   └── ...
│   ├── sword-shield/
│   │   └── ...
│   └── ...
├── scarlet-violet.png          # Series logo
├── sword-shield.png            # Series logo
├── obsidian-flames.png         # Set logo
├── base-set.png                # Set logo
├── default-card.jpg            # Fallback image
└── ...
```

### Image Naming Conventions

**Card Images**:
```
{card-number}.jpg
```
- Examples: `1.jpg`, `25.jpg`, `SV01.jpg`, `TG12.jpg`

**Series Logos**:
```
{series-slug}.png
```
- Examples: `scarlet-violet.png`, `wizards-of-the-coast.png`

**Set Logos**:
```
{set-slug}.png
```
- Examples: `obsidian-flames.png`, `base-set-shadowless.png`

## Generated Content (`/series`)

```
series/
├── scarlet-violet/
│   ├── index.html              # Series index (shows all sets)
│   ├── base-set/
│   │   └── index.html          # Set page (shows all cards)
│   ├── obsidian-flames/
│   │   └── index.html
│   ├── paldea-evolved/
│   │   └── index.html
│   └── ...
├── sword-shield/
│   ├── index.html
│   ├── astral-radiance/
│   │   └── index.html
│   └── ...
├── wizards-of-the-coast/
│   ├── index.html
│   ├── base-set-unlimited/
│   │   └── index.html
│   ├── base-set-shadowless/
│   │   └── index.html
│   └── ...
└── ...
```

### Directory Structure Rules

1. **Series directories** use series slug (e.g., `scarlet-violet/`)
2. **Set directories** use set slug (e.g., `obsidian-flames/`)
3. Each directory contains an `index.html` file
4. Series index lists all sets
5. Set index lists all cards

## Scripts Directory (`/scripts`)

```
scripts/
└── rename_images.js            # Bulk image renaming utility
```

### Script Purposes

**`rename_images.js`**:
- Renames image files from underscores to hyphens
- Useful for standardizing file names
- Usage: `node scripts/rename_images.js`

## Build Scripts (Root Level)

### `build_set_index.js`
**Purpose**: Main build script
**Generates**:
- All set pages (`series/{series}/{set}/index.html`)
- All series index pages (`series/{series}/index.html`)

### `build_series_index.js`
**Purpose**: Secondary build script
**Generates**:
- Series navigation pages (less frequently used)

### `convert-to-web.js`
**Purpose**: Image format conversion
**Features**:
- Convert images to web-optimized formats
- Batch processing

## Templates (Root Level)

### `series_index_template.html`
**Purpose**: Template for series index pages
**Placeholders**:
- `{{SERIES_NAME}}` - Display name
- `{{SETS}}` - Generated set cards HTML

### `set_index_template.html`
**Purpose**: Template for set pages
**Placeholders**:
- `{{SERIES_NAME}}` - Series display name
- `{{SET_NAME}}` - Set display name
- `{{CARDS}}` - Generated cards HTML

### `set_template.html`
**Status**: Legacy/unused
**Note**: Kept for reference, not actively used

## Static Pages (Root Level)

### `index.html`
**Purpose**: Homepage
**Features**:
- Hero section
- Featured cards carousel
- Navigation

### `shop.html`
**Purpose**: Series browsing page
**Features**:
- Grid of all series
- Series logos
- Links to series pages

## JavaScript Files (Root Level)

### `featured-cards.js`
**Purpose**: Homepage carousel
**Dependencies**: None
**Loaded by**: `index.html`

### `search.js`
**Purpose**: Global search functionality
**Dependencies**: None
**Loaded by**: All pages

### `lightbox.js`
**Purpose**: Card detail modal
**Dependencies**: None
**Loaded by**: Set pages

## CSS Files (Root Level)

### `geeksguild.css`
**Purpose**: Global stylesheet
**Sections**:
- Reset & Variables
- Typography
- Layout (Header, Nav, Footer)
- Components (Cards, Grids, Carousel)
- Utilities
- Responsive styles

## Data Files (Root Level)

### `pokemon-cards.csv`
**Purpose**: Single source of truth for all card data
**Format**: CSV (Comma-Separated Values)
**Encoding**: UTF-8
**Rows**: ~6,000

## Configuration Files (Root Level)

### `package.json`
**Purpose**: npm configuration
**Contains**:
- Project metadata
- Dependencies
- Scripts

### `package-lock.json`
**Purpose**: Dependency lock file
**Auto-generated**: Yes
**Commit**: Yes (for reproducible builds)

## Asset Files (Root Level)

### `geeksguild-logo.png`
**Purpose**: Site logo (displayed in header)
**Format**: PNG with transparency
**Size**: 140px height (responsive)

### `header.png`
**Purpose**: Hero section background
**Format**: PNG
**Usage**: Background image with gradient overlay

### Favicon Files
```
favicon-16x16.png
favicon-32x32.png
```

## Output Directory (`/output`)

```
output/
└── webp_images/                # Converted WebP images (optional)
```

**Purpose**: Build artifacts and converted images
**Git**: Usually ignored (`.gitignore`)

## Node Modules (`/node_modules`)

**Purpose**: npm dependencies
**Git**: Always ignored (`.gitignore`)
**Regenerate**: `npm install`

## Path References

### From Set Pages
```javascript
// Set page: series/scarlet-violet/base-set/index.html
const CSS_PATH = '../../../geeksguild.css';
const IMG_PATH = '../../../images/cards/scarlet-violet/base-set/1.jpg';
const HOME_PATH = '../../../index.html';
const SHOP_PATH = '../../../shop.html';
```

### From Series Index Pages
```javascript
// Series page: series/scarlet-violet/index.html
const CSS_PATH = '../../geeksguild.css';
const SET_PATH = './base-set/index.html';
const HOME_PATH = '../../index.html';
```

### From Root Pages
```javascript
// Homepage: index.html
const CSS_PATH = './geeksguild.css';
const IMG_PATH = './images/cards/...';
const SHOP_PATH = './shop.html';
```

## File Naming Conventions

### HTML Files
- Always named `index.html`
- One per directory
- Lowercase only

### JavaScript Files
- Kebab-case: `featured-cards.js`
- Descriptive names
- Single responsibility

### CSS Files
- Kebab-case: `geeksguild.css`
- Single global stylesheet

### Image Files
- **Cards**: Numeric or alphanumeric (e.g., `123.jpg`, `SV01.jpg`)
- **Logos**: Kebab-case slug (e.g., `scarlet-violet.png`)
- **Assets**: Descriptive kebab-case (e.g., `geeksguild-logo.png`)

### Directory Names
- Always lowercase
- Use hyphens (kebab-case)
- Match slug generation
- Examples: `scarlet-violet`, `base-set-shadowless`

## .gitignore Patterns

```
node_modules/
output/
.DS_Store
*.log
.env
```

## Deployment Files

For GitHub Pages:
- All files in root and `series/` are deployed
- No build step required on server
- Direct static file serving

## File Size Considerations

### Images
- Card images: 50-200 KB each (JPG)
- Logos: 10-50 KB each (PNG)
- Total: ~2-3 GB

### HTML Files
- Set pages: 50-500 KB (depends on card count)
- Series pages: 10-50 KB
- Total: ~50-100 MB

### CSS/JS
- CSS: ~100 KB (unminified)
- JS: ~50 KB total (all files)
- Minimal impact on load time

## Backup Strategy

**Important Files to Backup**:
1. `pokemon-cards.csv` (critical!)
2. `images/` directory
3. Build scripts
4. Templates
5. Static pages
6. CSS file

**Can Be Regenerated**:
- `series/` directory (via build scripts)
- `node_modules/` (via `npm install`)

