# Image Management

## Image Directory Structure

```
images/
├── cards/                          # Card images organized by series/set
│   ├── {series-slug}/
│   │   ├── {set-slug}/
│   │   │   ├── {card-number}.jpg
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── {series-slug}.png               # Series logo
├── {set-slug}.png                  # Set logo
├── default-card.jpg                # Fallback image
├── geeksguild-logo.png            # (in root)
└── header.png                      # (in root)
```

## Image Types

### 1. Card Images

**Location**: `images/cards/{series-slug}/{set-slug}/{card-number}.jpg`

**Format**: JPG
**Dimensions**: Typically 488x680 pixels (standard card aspect ratio)
**File Size**: 50-200 KB per image
**Total**: ~22,000 files

**Naming Convention**:
- Use card number only (no prefixes)
- Examples: `1.jpg`, `25.jpg`, `123.jpg`
- Alphanumeric allowed: `SV01.jpg`, `TG12.jpg`

**Example Paths**:
```
images/cards/scarlet-violet/base-set/1.jpg
images/cards/sword-shield/astral-radiance/123.jpg
images/cards/wizards-of-the-coast/base-set-shadowless/4.jpg
```

### 2. Series Logos

**Location**: `images/{series-slug}.png`

**Format**: PNG (with transparency)
**Dimensions**: Variable (typically 300-600px wide)
**File Size**: 10-50 KB per image
**Total**: 13 files

**Naming Convention**:
- Series name converted to slug
- Remove "and" from series names
- Examples: `scarlet-violet.png`, `wizards-of-the-coast.png`

**List of Series Logos**:
```
images/scarlet-violet.png
images/sword-shield.png
images/sun-moon.png
images/xy.png
images/mega-evolution.png
images/black-white.png
images/call-of-legends.png
images/heartgold-soulsilver.png
images/platinum.png
images/diamond-pearl.png
images/ex-series.png
images/wizards-of-the-coast.png
images/japanese-cards.png
```

### 3. Set Logos

**Location**: `images/{set-slug}.png`

**Format**: PNG (with transparency)
**Dimensions**: Variable (typically 200-400px wide)
**File Size**: 10-50 KB per image
**Total**: ~100 files

**Naming Convention**:
- Set name converted to slug
- Keep "and" in set names (as "and", not "&")
- Examples: `obsidian-flames.png`, `base-set-shadowless.png`

**Example Files**:
```
images/obsidian-flames.png
images/paldea-evolved.png
images/base-set-unlimited.png
images/base-set-shadowless.png
images/jungle.png
images/fossil.png
```

### 4. Default/Fallback Image

**Location**: `images/default-card.jpg`

**Purpose**: Displayed when card image is missing
**Format**: JPG
**Dimensions**: Same as card images (488x680)

**Usage**:
```html
<img src="card.jpg" onerror="this.src='../../../images/default-card.jpg'" />
```

### 5. Site Assets

**Geek's Guild Logo**:
- Location: `geeksguild-logo.png` (root)
- Format: PNG with transparency
- Usage: Site header

**Header Background**:
- Location: `header.png` (root)
- Format: PNG
- Usage: Hero section background

## Slug Generation for Images

### Series Slug (for card image paths)

```javascript
function normalizeSeriesName(name) {
  return name
    .toLowerCase()
    .replace(/\band\b/g, '')      // Remove "and"
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

**Examples**:
- "Scarlet and Violet" → `scarlet-violet`
- "Black and White" → `black-white`
- "Sun and Moon" → `sun-moon`

### Set Slug (for card image paths and set logos)

```javascript
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '')      // Also removes "and"
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

**Examples**:
- "Scarlet & Violet Base Set" → `scarlet-violet-base-set`
- "Base Set (Shadowless)" → `base-set-shadowless`
- "XY - Fates Collide" → `xy-fates-collide`

## Image Path Resolution

### In Build Scripts

```javascript
function getCardImagePath(card) {
  const seriesSlug = normalizeSeriesName(card.series);
  let setSlug = normalizeName(card.set);
  
  // Special case handling
  if (card.set.includes('Trainer Gallery')) {
    const parentSet = card.set.replace(/\s*Trainer Gallery\s*/i, '').trim();
    setSlug = normalizeName(parentSet);
  } else if (card.set === 'HGSS Promos') {
    setSlug = 'heartgold-soulsilver-promos';
  }
  
  // Extract numeric card number
  const numericMatch = card.cardNum.match(/\d+/);
  const cardNumber = numericMatch ? numericMatch[0] : card.cardNum;
  
  return `${CARD_IMG_BASE_PATH}/${seriesSlug}/${setSlug}/${cardNumber}.jpg`;
}
```

### In HTML

```html
<!-- From set page (3 levels deep) -->
<img src="../../../images/cards/scarlet-violet/base-set/25.jpg" />

<!-- From series page (2 levels deep) -->
<img src="../../images/scarlet-violet.png" />

<!-- From root page -->
<img src="images/scarlet-violet.png" />
```

## Special Cases

### Trainer Gallery Cards

**Problem**: Cards listed as "Set Name Trainer Gallery" in CSV
**Solution**: Use parent set folder for images

```javascript
if (card.set.includes('Trainer Gallery')) {
  const parentSet = card.set.replace(/\s*Trainer Gallery\s*/i, '').trim();
  setSlug = normalizeName(parentSet);
}
```

**Example**:
- CSV: "Astral Radiance Trainer Gallery"
- Folder: `astral-radiance/`
- Path: `images/cards/sword-shield/astral-radiance/TG01.jpg`

### HGSS Promos

**Problem**: CSV uses "HGSS Promos" but folder is different
**Solution**: Explicit mapping

```javascript
if (card.set === 'HGSS Promos') {
  setSlug = 'heartgold-soulsilver-promos';
}
```

**Example**:
- CSV: "HGSS Promos"
- Folder: `heartgold-soulsilver-promos/`
- Path: `images/cards/heartgold-soulsilver/heartgold-soulsilver-promos/1.jpg`

### Shiny Vault

**Problem**: Cards split from Shining Fates into separate set
**Solution**: Dedicated folder with sequential numbering

```javascript
if (card.set === 'Shiny Vault') {
  setSlug = 'shiny-vault';
  // Card numbers are 1, 2, 3, etc. (sequential)
}
```

**Example**:
- CSV: "Shiny Vault", Card #1
- Folder: `shiny-vault/`
- Path: `images/cards/sword-shield/shiny-vault/1.jpg`

### Celebrations: Classic Collection

**Problem**: Cards 26+ split into separate collection
**Solution**: Dedicated folder

```javascript
if (card.set === 'Celebrations: Classic Collection') {
  setSlug = 'celebrations-classic-collection';
}
```

## Image Optimization

### Current Format
- **Cards**: JPG (good balance of quality and size)
- **Logos**: PNG (supports transparency)

### Optimization Tips
1. Resize images to actual display size
2. Use appropriate compression (80-85% quality for JPG)
3. Consider WebP for modern browsers (future)
4. Implement lazy loading (already done)

### Lazy Loading

```html
<img loading="lazy" src="card.jpg" alt="Card Name" />
```

**Benefits**:
- Faster initial page load
- Reduced bandwidth usage
- Better performance on mobile

## Error Handling

### Missing Images

```html
<img src="card.jpg" 
     onerror="this.src='../../../images/default-card.jpg'" 
     alt="Card Name" />
```

**Fallback Chain**:
1. Try to load actual card image
2. On error, load default card image
3. If both fail, browser shows broken image icon

### Debugging Missing Images

**Check**:
1. Does image file exist at expected path?
2. Is filename correct (including extension)?
3. Is slug generation correct?
4. Is path construction correct (number of `../`)?
5. Are there special characters in filename?

**Common Issues**:
- Case sensitivity (especially on Linux/macOS vs Windows)
- Missing file extension
- Incorrect slug generation
- Wrong number of parent directories in path

## Image Naming Scripts

### Batch Rename Script

Located at `scripts/rename_images.js`

**Purpose**: Rename images in bulk (e.g., underscores to hyphens)

```javascript
// Rename all images from underscores to hyphens
const fs = require('fs');
const path = require('path');

function renameImages(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    if (file.includes('_')) {
      const newName = file.replace(/_/g, '-');
      fs.renameSync(
        path.join(directory, file),
        path.join(directory, newName)
      );
    }
  });
}
```

**Usage**:
```bash
node scripts/rename_images.js
```

## Adding New Images

### Adding Card Images

1. **Get image file** (scan or download)
2. **Determine correct path**:
   - Find series slug
   - Find set slug
   - Determine card number
3. **Name file**: `{card-number}.jpg`
4. **Place in**: `images/cards/{series-slug}/{set-slug}/`
5. **Update CSV** if new card
6. **Rebuild site**: `node build_set_index.js`

### Adding Series Logo

1. **Get logo image** (PNG with transparency preferred)
2. **Generate slug**: Use `normalizeSeriesName()`
3. **Name file**: `{series-slug}.png`
4. **Place in**: `images/`
5. **Update `shop.html`** if new series

### Adding Set Logo

1. **Get logo image** (PNG with transparency preferred)
2. **Generate slug**: Use `normalizeName()`
3. **Name file**: `{set-slug}.png`
4. **Place in**: `images/`
5. **Rebuild site** to use new logo

## Image Conversion

### Convert to WebP (Optional)

```bash
# Install cwebp (part of WebP tools)
brew install webp

# Convert single image
cwebp input.jpg -q 85 -o output.webp

# Bulk convert
for file in *.jpg; do
  cwebp "$file" -q 85 -o "${file%.jpg}.webp"
done
```

### Convert PNG to JPG (for cards)

```bash
# Using ImageMagick
convert input.png output.jpg

# Or using sips (macOS)
sips -s format jpeg input.png --out output.jpg
```

## Storage Considerations

### Current Size
- Total images: ~22,000 files
- Total size: ~2-3 GB
- Average per card: ~100 KB

### Git LFS (Large File Storage)

If repository becomes too large, consider Git LFS:

```bash
# Track all JPG and PNG files
git lfs track "*.jpg"
git lfs track "*.png"

# Commit .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS"
```

### CDN Hosting (Future)

For better performance:
- Host images on CDN (Cloudflare, CloudFront)
- Update image paths to CDN URLs
- Keep originals in repository

## Image Quality Standards

### Card Images
- **Minimum**: 400px wide
- **Recommended**: 488px wide
- **Aspect Ratio**: 2:3 (card standard)
- **Format**: JPG, 80-85% quality
- **Color**: RGB (not CMYK)

### Logos
- **Format**: PNG with transparency
- **Background**: Transparent
- **Colors**: Original brand colors
- **Size**: Flexible, but reasonable for web

## Backup Strategy

**Critical**:
- Original card images (irreplaceable)
- Logos (can be recreated but time-consuming)

**Backup Methods**:
1. Git repository (if using Git LFS)
2. External hard drive
3. Cloud storage (Google Drive, Dropbox)
4. Multiple copies in different locations

