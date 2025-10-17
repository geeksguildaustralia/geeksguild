# Data Structure

## CSV File Structure

The entire card collection is stored in `pokemon-cards.csv`, which serves as the single source of truth for all card data.

### CSV Schema

| Column | Index | Type | Description | Example |
|--------|-------|------|-------------|---------|
| Name | 0 | String | Card name (with variants) | "Pikachu (Poke Ball Pattern)" |
| Set | 1 | String | Set name | "Scarlet & Violet Base Set" |
| Card Number | 2 | String | Card number (can include letters) | "25", "SV01", "TG01" |
| Rarity | 3 | String | Card rarity | "Rare", "Holo Rare", "Ultra Rare" |
| Variance | 4 | String | Card variant type | "Reverse Holo", "" |
| Status | 5 | String | Collection status | "In Collection" |
| Notes | 6 | String | Additional notes | "" |
| Quantity | 7 | Number | Number of copies owned | "1", "2", "3" |
| Series | 8 | String | Pokémon series name | "Scarlet and Violet" |

### Sample Rows

```csv
Pikachu,Scarlet & Violet Base Set,25,Common,,In Collection,,1,Scarlet and Violet
Charizard ex,Obsidian Flames,125,Double Rare,,In Collection,,1,Scarlet and Violet
Mewtwo,Base Set (Shadowless),10,Rare,,In Collection,,1,Wizards of the Coast
Rayquaza,Shiny Vault,SV1,Shiny Rare,,In Collection,,2,Sword and Shield
```

## Card Variants

Cards can have multiple variants, which are grouped together in the UI:

### Variant Types

1. **Normal** - Default card (no variant indicated)
2. **Reverse Holo** - Indicated by "Reverse" in Variance column
3. **Poke Ball Pattern** - Indicated by "(Poke Ball Pattern)" in Name
4. **Master Ball Pattern** - Indicated by "(Master Ball Pattern)" in Name

### Grouping Logic

Cards are grouped by:
```javascript
const baseName = name
  .replace(/\s*\(Poke Ball Pattern\)\s*/gi, '')
  .replace(/\s*\(Master Ball Pattern\)\s*/gi, '')
  .trim();

const key = `${baseName}|${cardNumber}`;
```

**Example:**
- "Pikachu" + "25" → Groups all Pikachu #25 variants
- "Pikachu (Poke Ball Pattern)" + "25" → Same group
- "Pikachu (Master Ball Pattern)" + "25" → Same group

### Quantity Tracking

Each variant tracks its own quantity:
```javascript
cardMap[key] = {
  normalQty: 0,
  reverseHoloQty: 0,
  pokeBallQty: 0,
  masterBallQty: 0
};
```

## Series Structure

### Major Series

1. **Wizards of the Coast** (1999-2003)
2. **Ex Series** (2003-2007)
3. **Diamond and Pearl** (2007-2009)
4. **Platinum** (2009-2010)
5. **HeartGold SoulSilver** (2010-2011)
6. **Call of Legends** (2011)
7. **Black and White** (2011-2013)
8. **Mega Evolution** (Japanese sets)
9. **XY** (2014-2016)
10. **Sun and Moon** (2017-2019)
11. **Sword and Shield** (2020-2022)
12. **Scarlet and Violet** (2023-present)
13. **Miscellaneous** (Promos, special sets)

### Series Metadata

Each series has:
- **Name**: Display name (e.g., "Scarlet and Violet")
- **Slug**: URL-friendly identifier (e.g., "scarlet-violet")
- **Logo**: PNG image in `images/` directory
- **Sets**: Collection of related sets

## Set Structure

### Set Information

Each set contains:
- **Name**: Display name (e.g., "Obsidian Flames")
- **Slug**: URL-friendly identifier (e.g., "obsidian-flames")
- **Series**: Parent series name
- **Logo**: PNG image in `images/` directory
- **Cards**: Array of card objects

### Special Cases

#### Trainer Gallery Sets
- Stored with parent set name in CSV
- Image files in parent set folder
- Example: "Astral Radiance Trainer Gallery" → images in `astral-radiance/`

#### HGSS Promos
- CSV name: "HGSS Promos"
- Image folder: `heartgold-soulsilver-promos/`
- Special mapping in code

#### Shiny Vault
- Separate folder from Shining Fates
- Sequential numbering (1, 2, 3, etc.)
- Special handling for card numbers

#### Celebrations: Classic Collection
- Separate folder from main Celebrations
- Cards 26+ split into own collection

## Card Object Structure

### In Build Scripts

```javascript
{
  name: "Pikachu",
  set: "Scarlet & Violet Base Set",
  cardNum: "25",
  rarity: "Common",
  series: "Scarlet and Violet",
  normalQty: 1,
  reverseHoloQty: 0,
  pokeBallQty: 0,
  masterBallQty: 0,
  cleanCardNum: 25, // Numeric version for sorting
  variants: ["Normal"] // Array of available variants
}
```

### In Generated HTML

```html
<div class="card" 
     data-name="Pikachu"
     data-set="Scarlet & Violet Base Set"
     data-number="25"
     data-rarity="Common"
     data-normal="1"
     data-reverse="0"
     data-pokeball="0"
     data-masterball="0"
     data-variants="Normal">
  <!-- Card content -->
</div>
```

## Image Path Structure

### Card Images

```
images/cards/{series-slug}/{set-slug}/{card-number}.jpg
```

**Examples:**
```
images/cards/scarlet-violet/obsidian-flames/125.jpg
images/cards/wizards-of-the-coast/base-set-shadowless/10.jpg
images/cards/sword-shield/shiny-vault/1.jpg
```

### Series Logos

```
images/{series-slug}.png
```

**Examples:**
```
images/scarlet-violet.png
images/wizards-of-the-coast.png
```

### Set Logos

```
images/{set-slug}.png
```

**Examples:**
```
images/obsidian-flames.png
images/base-set-shadowless.png
```

## Name Normalization

### Series Name Normalization
Removes "and" from series names for image paths:

```javascript
function normalizeSeriesName(name) {
  return name
    .toLowerCase()
    .replace(/\band\b/g, '')  // Remove "and"
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

**Examples:**
- "Scarlet and Violet" → "scarlet-violet"
- "Black and White" → "black-white"
- "Sun and Moon" → "sun-moon"

### Set Name Normalization
Keeps "and" but converts "&" to "and":

```javascript
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '')  // Also removes "and"
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

**Examples:**
- "Scarlet & Violet Base Set" → "scarlet-violet-base-set"
- "XY - Fates Collide" → "xy-fates-collide"

## Data Validation

### Required Fields
- Name (must not be empty)
- Set (must not be empty)
- Card Number (must not be empty)
- Series (must not be empty)

### Data Cleaning
- Trim whitespace from all fields
- Handle empty Variance field (default to "")
- Convert Quantity to integer (default to 1)
- Remove HTML-unsafe characters

## Data Statistics

- **Total Cards**: ~6,000 entries
- **Unique Cards**: ~4,500 (after variant grouping)
- **Series**: 13
- **Sets**: ~100
- **Card Number Formats**: Numeric, alphanumeric (e.g., "SV01", "TG12")
- **Rarity Types**: 10+ different rarity classifications

