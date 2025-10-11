const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read and parse CSV
const csvContent = fs.readFileSync('pokemon-cards.csv', 'utf-8');
const records = parse(csvContent, { columns: true, skip_empty_lines: true });

// Normalization functions (copied from build scripts)
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSeriesNameForFilename(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Group cards by series and set
const seriesSets = {};
records.forEach(row => {
  const series = row.Series || row['Series'];
  const set = row.Set || row['Set'];
  
  if (!series || !set) return;
  
  if (!seriesSets[series]) {
    seriesSets[series] = new Set();
  }
  seriesSets[series].add(set);
});

// Check which folders are missing
const missingFolders = [];
const existingButEmpty = [];

Object.keys(seriesSets).sort().forEach(series => {
  const seriesSlug = normalizeSeriesNameForFilename(series);
  const seriesPath = path.join('images/cards', seriesSlug);
  
  if (!fs.existsSync(seriesPath)) {
    console.log(`❌ Missing series folder: ${seriesPath} (${series})`);
    return;
  }
  
  seriesSets[series].forEach(set => {
    let setSlug = normalizeName(set);
    
    // Handle special cases
    if (set.includes('Radiant Collection')) {
      if (set.includes('Generations')) {
        setSlug = 'generations';
      } else if (set.includes('Legendary Treasures')) {
        setSlug = 'legendary-treasures';
      }
    }
    
    const setPath = path.join(seriesPath, setSlug);
    
    if (!fs.existsSync(setPath)) {
      missingFolders.push({
        series,
        set,
        expectedPath: `${seriesSlug}/${setSlug}`
      });
    } else {
      // Check if folder has any .jpg files
      const files = fs.readdirSync(setPath);
      const jpgFiles = files.filter(f => f.endsWith('.jpg'));
      if (jpgFiles.length === 0) {
        existingButEmpty.push({
          series,
          set,
          path: `${seriesSlug}/${setSlug}`
        });
      }
    }
  });
});

console.log('\n=== MISSING CARD IMAGE FOLDERS ===');
if (missingFolders.length === 0) {
  console.log('✅ All folders exist!');
} else {
  missingFolders.forEach(item => {
    console.log(`❌ ${item.series} > ${item.set}`);
    console.log(`   Expected: images/cards/${item.expectedPath}`);
  });
}

console.log('\n=== EMPTY CARD IMAGE FOLDERS ===');
if (existingButEmpty.length === 0) {
  console.log('✅ All folders have images!');
} else {
  existingButEmpty.forEach(item => {
    console.log(`⚠️  ${item.series} > ${item.set}`);
    console.log(`   Path: images/cards/${item.path}`);
  });
}

console.log(`\n📊 Total: ${missingFolders.length} missing, ${existingButEmpty.length} empty`);

