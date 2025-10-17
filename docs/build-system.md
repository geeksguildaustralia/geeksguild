# Build System

## Overview

The build system transforms CSV data into static HTML pages using Node.js scripts and HTML templates.

## Build Scripts

### 1. `build_set_index.js`

**Purpose**: Main build script that generates both set pages and series index pages.

**What it does**:
1. Reads `pokemon-cards.csv`
2. Parses and groups cards by series and set
3. Generates individual set pages (cards grid)
4. Generates series index pages (sets grid)
5. Writes HTML files to `series/` directory

**Usage**:
```bash
node build_set_index.js
```

**Key Functions**:

#### `parseCSV(csvText)`
Converts CSV text into array of arrays.

```javascript
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}
```

#### `normalizeName(name)`
Converts names to URL-friendly slugs (for sets).

```javascript
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

#### `normalizeSeriesNameForFilename(name)`
Converts series names to URL-friendly slugs (removes "and").

```javascript
function normalizeSeriesNameForFilename(name) {
  return name
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

#### `generateCardList(cards)`
Groups cards by base name and number, handles variants.

**Logic**:
1. Remove pattern suffixes from name
2. Group by `baseName|cardNumber`
3. Track quantities per variant type
4. Sort by numeric card number
5. Generate HTML for each card

**Card Grouping**:
```javascript
const baseName = name
  .replace(/\s*\(Poke Ball Pattern\)\s*/gi, '')
  .replace(/\s*\(Master Ball Pattern\)\s*/gi, '')
  .trim();

const key = `${baseName}|${trimmedCardNum}`;
```

**HTML Output**:
```html
<div class="card" 
     data-name="Card Name"
     data-number="123"
     data-normal="1"
     data-reverse="0"
     data-pokeball="1"
     data-masterball="0"
     data-variants="Normal,Poke Ball">
  <div class="card-image">
    <img src="path/to/card.jpg" alt="Card Name" />
    <span class="variant-badge">2 variants</span>
  </div>
  <div class="card-info">
    <h3>Card Name</h3>
    <p class="card-number">#123</p>
    <p class="card-rarity">Rare</p>
  </div>
  <div class="card-quantity">
    <span>Normal: 1</span>
    <span>Poke Ball: 1</span>
  </div>
</div>
```

#### `generateSetPage(seriesName, setName, cards)`
Creates complete HTML page for a set.

**Process**:
1. Read `set_index_template.html`
2. Replace placeholders:
   - `{{SERIES_NAME}}` → Series display name
   - `{{SET_NAME}}` → Set display name
   - `{{CARDS}}` → Generated cards HTML
3. Return complete HTML

#### `generateSetLinks(seriesName, setNames)`
Creates grid of set cards for series index page.

```javascript
function generateSetLinks(seriesName, setNames) {
  const seriesSlug = normalizeName(seriesName);
  return setNames.map(setName => {
    const setSlug = normalizeName(setName);
    return `
      <a href="${setSlug}/index.html" class="set-card">
        <img src="../../images/${setSlug}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}
```

#### `generateSeriesPage(seriesName, setNames)`
Creates series index page showing all sets.

**Process**:
1. Read `series_index_template.html`
2. Replace placeholders:
   - `{{SERIES_NAME}}` → Series display name
   - `{{SETS}}` → Generated set links HTML
3. Return complete HTML

### 2. `build_series_index.js`

**Purpose**: Secondary script for generating series navigation pages.

**Usage**:
```bash
node build_series_index.js
```

**Note**: This script is less frequently used as `build_set_index.js` handles most generation needs.

## Templates

### 1. `set_index_template.html`

Template for individual set pages.

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{SET_NAME}} - Geek's Guild</title>
  <link rel="stylesheet" href="../../../geeksguild.css" />
</head>
<body>
  <header>
    <!-- Navigation -->
  </header>
  
  <main>
    <h1>{{SERIES_NAME}} - {{SET_NAME}}</h1>
    <div class="cards-grid">
      {{CARDS}}
    </div>
  </main>
  
  <footer>
    <p>&copy; 2025 Geek's Guild</p>
  </footer>
  
  <script src="../../../lightbox.js"></script>
  <script src="../../../search.js"></script>
</body>
</html>
```

**Placeholders**:
- `{{SERIES_NAME}}` - Display name of series
- `{{SET_NAME}}` - Display name of set
- `{{CARDS}}` - Generated HTML for all cards

### 2. `series_index_template.html`

Template for series index pages (showing all sets).

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{SERIES_NAME}} - Geek's Guild</title>
  <link rel="stylesheet" href="../../geeksguild.css" />
</head>
<body>
  <header>
    <!-- Navigation -->
  </header>
  
  <main>
    <h1>{{SERIES_NAME}}</h1>
    <div class="series-grid">
      {{SETS}}
    </div>
  </main>
  
  <footer>
    <p>&copy; 2025 Geek's Guild</p>
  </footer>
  
  <script src="../../search.js"></script>
</body>
</html>
```

**Placeholders**:
- `{{SERIES_NAME}}` - Display name of series
- `{{SETS}}` - Generated HTML for set links

## Build Process Flow

```
1. Start Build
   ↓
2. Read pokemon-cards.csv
   ↓
3. Parse CSV into array
   ↓
4. Group by Series
   ├── Scarlet and Violet
   ├── Sword and Shield
   └── ...
   ↓
5. For each Series:
   ├── Group by Set
   │   ├── Obsidian Flames
   │   ├── Paldea Evolved
   │   └── ...
   │   ↓
   ├── For each Set:
   │   ├── Get cards for set
   │   ├── Group cards by variant
   │   ├── Sort by card number
   │   ├── Generate card HTML
   │   ├── Generate set page HTML
   │   ├── Create directory if needed
   │   └── Write index.html
   │   ↓
   └── Generate series index page
       ├── Get all set names
       ├── Generate set links HTML
       ├── Generate series page HTML
       └── Write index.html
       ↓
6. Build Complete
```

## Directory Creation

Build script automatically creates necessary directories:

```javascript
const dirPath = path.join(OUTPUT_DIR, seriesSlug, setSlug);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}
```

**Example Output**:
```
series/
├── scarlet-violet/
│   ├── index.html
│   ├── obsidian-flames/
│   │   └── index.html
│   ├── paldea-evolved/
│   │   └── index.html
│   └── ...
├── sword-shield/
│   ├── index.html
│   └── ...
```

## Special Case Handling

### Trainer Gallery Cards
```javascript
if (card.set.includes('Trainer Gallery')) {
  const parentSet = card.set.replace(/\s*Trainer Gallery\s*/i, '').trim();
  setSlug = normalizeSetName(parentSet);
}
```

### HGSS Promos
```javascript
if (card.set === 'HGSS Promos') {
  setSlug = 'heartgold-soulsilver-promos';
}
```

### Shiny Vault
```javascript
if (card.set === 'Shiny Vault') {
  // Use separate folder with sequential numbering
  setSlug = 'shiny-vault';
}
```

### Celebrations Classic Collection
```javascript
if (card.set === 'Celebrations: Classic Collection') {
  // Separate from main Celebrations
  setSlug = 'celebrations-classic-collection';
}
```

## Error Handling

### Missing Data
```javascript
if (!name || !set || !cardNum || !series) {
  console.warn(`Skipping invalid card:`, row);
  return;
}
```

### Empty Slugs
```javascript
if (!seriesSlug || !setSlug) {
  console.warn(`Warning: Empty slug generated`);
  return;
}
```

### File Write Errors
```javascript
try {
  fs.writeFileSync(filePath, html);
  console.log(`Generated: ${filePath}`);
} catch (error) {
  console.error(`Error writing file: ${filePath}`, error);
}
```

## Configuration

### Constants in `build_set_index.js`

```javascript
const CSV_FILE = 'pokemon-cards.csv';
const SERIES_TEMPLATE_FILE = 'series_index_template.html';
const SET_TEMPLATE_FILE = 'set_index_template.html';
const OUTPUT_DIR = 'series';
const CARD_IMG_BASE_PATH = '../../../images/cards';
const FALLBACK_IMG = '../../../images/default-card.jpg';
const CSS_PATH_SERIES = '../../geeksguild.css';
const CSS_PATH_SET = '../../../geeksguild.css';
```

## Performance

### Build Time
- Full build: ~2-3 seconds
- ~100 HTML files generated
- ~6,000 cards processed

### Optimization
- Single CSV read
- Efficient grouping with Maps
- Reuse of templates
- Minimal file I/O

## Rebuilding

### When to Rebuild
- After adding/editing cards in CSV
- After updating templates
- After changing build logic
- Before deploying to production

### Commands
```bash
# Full rebuild
node build_set_index.js

# Clean build (delete old files first)
rm -rf series/
node build_set_index.js
```

## Output Verification

After building, verify:
- [ ] All expected directories created
- [ ] No empty `index.html` files
- [ ] All card images load correctly
- [ ] No console warnings/errors
- [ ] Test navigation between pages

