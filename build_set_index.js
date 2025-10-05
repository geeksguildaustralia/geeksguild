const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const CSV_FILE = 'pokemon-cards.csv';
const SERIES_TEMPLATE_FILE = 'series_index_template.html';
const SET_TEMPLATE_FILE = 'set_index_template.html';
const OUTPUT_DIR = 'series';
const CARD_IMG_BASE_PATH = '../../../images/cards';
const FALLBACK_IMG = '../../../images/default_card.jpg';
const CSS_PATH_SERIES = '../../geeksguild.css';
const CSS_PATH_SET = '../../../geeksguild.css';

// === UTILITY FUNCTIONS ===

// Normalize a name to be used safely in filenames/URLs
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Parse CSV into array of arrays
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

// Extract leading number from a card number like "009/086"
function extractCardNumber(cardNumStr) {
  const match = cardNumStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Generate HTML for set links in a series page
function generateSetLinks(seriesName, setNames) {
  return setNames.map(setName => {
    const setSlug = normalizeName(setName);
    const seriesSlug = normalizeName(seriesName);
    return `
      <a href="${setSlug}/index.html" class="set-card">
        <img src="../../images/${seriesSlug}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Generate HTML for cards in a set page
function generateCardList(cards) {
  const sortedCards = cards.slice().sort((a, b) => {
    return extractCardNumber(a[2]) - extractCardNumber(b[2]);
  });

  return sortedCards.map(row => {
    const [name, set, cardNum, rarity, variant, grade, condition, qty, series, filenameRaw] = row;
    const fileName = filenameRaw ? filenameRaw.trim() : normalizeName(name);
    const seriesSlug = normalizeName(series);
    const setSlug = normalizeName(set);
    const imgPath = `${CARD_IMG_BASE_PATH}/${seriesSlug}/${setSlug}/${fileName}.jpg`;

    return `
      <div class="card">
        <h3>${name}</h3>
        <img src="${imgPath}" alt="${name}" onerror="this.src='${FALLBACK_IMG}'" />
      </div>
    `;
  }).join('\n');
}

// === MAIN SCRIPT ===

const seriesTemplate = fs.readFileSync(SERIES_TEMPLATE_FILE, 'utf8');
const setTemplate = fs.readFileSync(SET_TEMPLATE_FILE, 'utf8');

fs.readFile(CSV_FILE, 'utf8', (err, csvText) => {
  if (err) {
    console.error('❌ Error reading CSV:', err);
    return;
  }

  const rows = parseCSV(csvText).filter(row => row.length >= 10);

  // Group cards by series → set
  const seriesMap = {};

  rows.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];
    if (!seriesName || !setName) return;

    if (!seriesMap[seriesName]) seriesMap[seriesName] = {};
    if (!seriesMap[seriesName][setName]) seriesMap[seriesName][setName] = [];

    seriesMap[seriesName][setName].push(row);
  });

  Object.entries(seriesMap).forEach(([seriesName, sets]) => {
    const seriesSlug = normalizeName(seriesName);
    const seriesDir = path.join(OUTPUT_DIR, seriesSlug);
    if (!fs.existsSync(seriesDir)) fs.mkdirSync(seriesDir, { recursive: true });

    // === Create Series Index Page ===
    const setNames = Object.keys(sets).sort();
    const seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', generateSetLinks(seriesName, setNames))
      .replace('{{cssPath}}', CSS_PATH_SERIES);

    fs.writeFileSync(path.join(seriesDir, 'index.html'), seriesHTML);
    console.log(`✅ Wrote series index: ${path.join(seriesDir, 'index.html')}`);

    // === Create Set Pages ===
    setNames.forEach(setName => {
      const setSlug = normalizeName(setName);
      const setDir = path.join(seriesDir, setSlug);
      if (!fs.existsSync(setDir)) fs.mkdirSync(setDir, { recursive: true });

      const cards = sets[setName];
      const setHTML = setTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace('{{cardList}}', generateCardList(cards))
        .replace('{{cssPath}}', CSS_PATH_SET);

      fs.writeFileSync(path.join(setDir, 'index.html'), setHTML);
      console.log(`✅ Wrote set page: ${path.join(setDir, 'index.html')}`);
    });
  });
});
