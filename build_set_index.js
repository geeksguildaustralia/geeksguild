const fs = require('fs');
const path = require('path');

// ==== File paths ====
const csvFile = 'pokemon-cards.csv';
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';
const outputDir = 'series';

// ==== Helpers ====

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1);
  return dataRows.map(line => line.split(',').map(cell => cell.trim()));
}

function generateSetLinks(seriesName, sets) {
  return sets.map(setName => {
    const normalizedSet = normalizeName(setName);
    const normalizedSeries = normalizeName(seriesName);
    return `
      <a href="${normalizedSet}/index.html" class="set-card">
        <img src="../../images/${normalizedSet}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

function generateCardList(cardsInSet) {
  return cardsInSet.map(row => {
    const [cardName, setName, , , , , , , seriesName, filenameOverride] = row;

    const normalizedSeries = normalizeName(seriesName);
    const normalizedSet = normalizeName(setName);

    const imageFilename = filenameOverride && filenameOverride.length > 0
      ? filenameOverride
      : normalizeName(cardName);

    const imgPath = `../../../images/cards/${normalizedSeries}/${normalizedSet}/${imageFilename}.jpeg`;

    return `
      <div class="card">
        <h3>${cardName}</h3>
        <img src="${imgPath}" alt="${cardName}" onerror="this.onerror=null;this.src='../../../images/default_card.png'" />
      </div>
    `;
  }).join('\n');
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ==== Load Templates ====
const seriesTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setTemplate = fs.readFileSync(setTemplateFile, 'utf8');

// ==== Load and Process CSV ====
fs.readFile(csvFile, 'utf8', (err, text) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const rows = parseCSV(text);

  // Build series → set → [cards]
  const seriesMap = {};

  rows.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];
    if (!setName || !seriesName) return;

    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = {};
    }
    if (!seriesMap[seriesName][setName]) {
      seriesMap[seriesName][setName] = [];
    }
    seriesMap[seriesName][setName].push(row);
  });

  Object.entries(seriesMap).forEach(([seriesName, setsObj]) => {
    const normalizedSeries = normalizeName(seriesName);
    const seriesFolder = path.join(outputDir, normalizedSeries);
    ensureDirExists(seriesFolder);

    // Generate series index page
    const setNames = Object.keys(setsObj).sort();
    const setLinksHTML = generateSetLinks(seriesName, setNames);

    const seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', '../../geeksguild.css');

    fs.writeFileSync(path.join(seriesFolder, 'index.html'), seriesHTML);
    console.log(`✅ Created: ${path.join(seriesFolder, 'index.html')}`);

    // Generate each set page
    setNames.forEach(setName => {
      const normalizedSet = normalizeName(setName);
      const setFolder = path.join(seriesFolder, normalizedSet);
      ensureDirExists(setFolder);

      const cardsInSet = setsObj[setName];
      const cardListHTML = generateCardList(cardsInSet);

      const setHTML = setTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace('{{cardList}}', cardListHTML)
        .replace('{{cssPath}}', '../../../geeksguild.css');

      fs.writeFileSync(path.join(setFolder, 'index.html'), setHTML);
      console.log(`📦 Created: ${path.join(setFolder, 'index.html')}`);
    });
  });
});
