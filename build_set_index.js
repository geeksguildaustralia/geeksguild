const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';

// Normalize strings into safe filenames or folder names
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Parse CSV (basic, no quoted comma support)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
  return { headers, rows };
}

// Generate <a> elements for set thumbnails in a series
function generateSetLinks(sets, seriesName) {
  const normalizedSeries = normalizeName(seriesName);

  return sets.map(setName => {
    const normalizedSet = normalizeName(setName);
    const imgPath = `../../images/${normalizedSet}.png`; // Set icons

    return `
      <a href="${normalizedSet}/index.html" class="set-card">
        <img src="${imgPath}" alt="${setName}" onerror="this.onerror=null;this.src='../../images/default_card.png'" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Generate <div class="card"> blocks for a set page
function generateCardList(cards, seriesName, setName) {
  const normalizedSeries = normalizeName(seriesName);
  const normalizedSet = normalizeName(setName);

  return cards.map(row => {
    const cardName = row[0];
    const filename = row[9] || normalizeName(cardName); // Column 10 = filename
    const imgPath = `../../../images/cards/${normalizedSeries}/${normalizedSet}/${filename}.jpg`;

    return `
      <div class="card">
        <h3>${cardName}</h3>
        <img src="${imgPath}" alt="${cardName}" onerror="this.onerror=null;this.src='../../../images/default_card.png'" />
      </div>
    `;
  }).join('\n');
}

// Read templates
const seriesTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setTemplate = fs.readFileSync(setTemplateFile, 'utf8');

// Read and parse CSV
fs.readFile(csvFile, 'utf8', (err, csvText) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const { rows } = parseCSV(csvText);

  // Build nested map: series -> set -> [cards]
  const data = {};
  rows.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!setName || !seriesName) return;

    if (!data[seriesName]) data[seriesName] = {};
    if (!data[seriesName][setName]) data[seriesName][setName] = [];

    data[seriesName][setName].push(row);
  });

  // Generate pages
  Object.entries(data).forEach(([seriesName, sets]) => {
    const normalizedSeries = normalizeName(seriesName);
    const seriesFolder = path.join('series', normalizedSeries);

    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    const setNames = Object.keys(sets).sort();
    const setLinksHTML = generateSetLinks(setNames, seriesName);
    const cssPathSeries = '../../geeksguild.css';

    const seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', cssPathSeries);

    fs.writeFileSync(path.join(seriesFolder, 'index.html'), seriesHTML);
    console.log(`✅ Created series page: ${seriesFolder}/index.html`);

    // Generate set pages
    setNames.forEach(setName => {
      const normalizedSet = normalizeName(setName);
      const setFolder = path.join(seriesFolder, normalizedSet);

      if (!fs.existsSync(setFolder)) {
        fs.mkdirSync(setFolder, { recursive: true });
      }

      const cards = sets[setName];
      const cardListHTML = generateCardList(cards, seriesName, setName);
      const cssPathSet = '../../../geeksguild.css';

      const setHTML = setTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace('{{cardList}}', cardListHTML)
        .replace('{{cssPath}}', cssPathSet);

      fs.writeFileSync(path.join(setFolder, 'index.html'), setHTML);
      console.log(`   ↳ Created set page: ${setFolder}/index.html`);
    });
  });
});
