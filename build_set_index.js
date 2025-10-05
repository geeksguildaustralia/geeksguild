const fs = require('fs');
const path = require('path');

// Config
const csvFile = 'pokemon-cards.csv';
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';

const cardImageBasePath = '../../../images/cards';  // relative to set pages
const setImageBasePath = '../../images';           // relative to series pages
const defaultCardImage = '../../../images/default_card.png'; // fallback

// Normalize names for folders and filenames
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Simple CSV parser
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1);
  return dataRows.map(line => line.split(',').map(cell => cell.trim()));
}

// Generate set links for series page
function generateSetLinks(seriesName, sets) {
  const normalizedSeries = normalizeName(seriesName);
  return sets.map(setName => {
    const normalizedSet = normalizeName(setName);
    const imagePath = `${setImageBasePath}/${normalizedSeries}.png`;
    return `
      <a href="${normalizedSet}/index.html" class="set-card">
        <img src="${imagePath}" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Generate card list for set page
function generateCardList(seriesName, setName, cardsInSet) {
  const normalizedSeries = normalizeName(seriesName);
  const normalizedSet = normalizeName(setName);

  return cardsInSet.map(row => {
    const cardName = row[0];
    const normalizedCard = normalizeName(cardName);
    const cardImg = `${cardImageBasePath}/${normalizedSeries}/${normalizedSet}/${normalizedCard}.png`;

    return `
      <div class="card">
        <h3>${cardName}</h3>
        <img src="${cardImg}" alt="${cardName}" class="card-thumb"
          onerror="this.onerror=null;this.src='${defaultCardImage}'" />
      </div>
    `;
  }).join('\n');
}

// Load templates
const seriesTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setTemplate = fs.readFileSync(setTemplateFile, 'utf8');

// Main execution
fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Error reading CSV:', err);
    return;
  }

  const rows = parseCSV(data);
  const seriesMap = {};

  // Organize data into: series → set → cards
  rows.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];
    if (!setName || !seriesName) return;

    if (!seriesMap[seriesName]) seriesMap[seriesName] = {};
    if (!seriesMap[seriesName][setName]) seriesMap[seriesName][setName] = [];

    seriesMap[seriesName][setName].push(row);
  });

  // Build pages
  Object.entries(seriesMap).forEach(([seriesName, sets]) => {
    const normalizedSeries = normalizeName(seriesName);
    const seriesDir = path.join('series', normalizedSeries);
    if (!fs.existsSync(seriesDir)) fs.mkdirSync(seriesDir, { recursive: true });

    const setNames = Object.keys(sets).sort();
    const setLinksHTML = generateSetLinks(seriesName, setNames);

    const seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', '../../geeksguild.css');

    fs.writeFileSync(path.join(seriesDir, 'index.html'), seriesHTML);
    console.log(`✅ Wrote series page: ${seriesDir}/index.html`);

    // Set pages
    setNames.forEach(setName => {
      const normalizedSet = normalizeName(setName);
      const setDir = path.join(seriesDir, normalizedSet);
      if (!fs.existsSync(setDir)) fs.mkdirSync(setDir, { recursive: true });

      const cardHTML = generateCardList(seriesName, setName, sets[setName]);

      const setHTML = setTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace('{{cardList}}', cardHTML)
        .replace('{{cssPath}}', '../../../geeksguild.css');

      fs.writeFileSync(path.join(setDir, 'index.html'), setHTML);
      console.log(`  ↳ Wrote set page: ${setDir}/index.html`);
    });
  });

  console.log('\n🎉 All pages generated successfully.');
});
