const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvFile = 'pokemon-cards.csv';
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function generateSetLinks(sets) {
  return sets.map(setName => {
    const folderName = normalizeName(setName);
    return `
      <a href="${folderName}/index.html" class="set-card">
        <img src="../../images/${folderName}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

function generateCardList(cardsInSet) {
  return cardsInSet.map(row => {
    const cardName = row[0];
    const setName = row[1];
    const seriesName = row[8];
    const filename = row[9] ? row[9].trim() : '';

    const normalizedSeries = normalizeName(seriesName);
    const normalizedSet = normalizeName(setName);

    // Card image path (assume .jpg)
    let imgPath = `../../../images/cards/${normalizedSeries}/${normalizedSet}/${filename}.jpg`;

    // If filename missing or empty, fallback to default
    if (!filename) {
      imgPath = '../../../images/default_card.png';
    }

    return `
      <div class="card">
        <h3>${cardName}</h3>
        <img src="${imgPath}" alt="${cardName}" onerror="this.onerror=null;this.src='../../../images/default_card.png';" />
      </div>
    `;
  }).join('\n');
}

// Read templates
const seriesTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setTemplate = fs.readFileSync(setTemplateFile, 'utf8');

// Read and parse CSV
const csvText = fs.readFileSync(csvFile, 'utf8');

// Parse CSV with headers, auto skip empty lines
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Build data structure: series → set → cards
const seriesMap = {};

records.forEach(row => {
  const setName = row['Set'] || row['set'] || row[1]; // fallback if no headers
  const seriesName = row['Series'] || row['series'] || row[8];
  if (!setName || !seriesName) return;

  if (!seriesMap[seriesName]) seriesMap[seriesName] = {};
  if (!seriesMap[seriesName][setName]) seriesMap[seriesName][setName] = [];
  seriesMap[seriesName][setName].push(Object.values(row));
});

// Generate pages
Object.entries(seriesMap).forEach(([seriesName, setsObj]) => {
  const normalizedSeries = normalizeName(seriesName);
  const seriesFolder = path.join('series', normalizedSeries);

  if (!fs.existsSync(seriesFolder)) {
    fs.mkdirSync(seriesFolder, { recursive: true });
  }

  const setNames = Object.keys(setsObj).sort();

  const setLinksHTML = generateSetLinks(setNames);
  const cssRel = '../../geeksguild.css';

  const seriesHTML = seriesTemplate
    .replace(/{{seriesName}}/g, seriesName)
    .replace('{{setLinks}}', setLinksHTML)
    .replace('{{cssPath}}', cssRel);

  fs.writeFileSync(path.join(seriesFolder, 'index.html'), seriesHTML);
  console.log(`Wrote series page: ${path.join(seriesFolder, 'index.html')}`);

  // Write sets
  setNames.forEach(setName => {
    const normalizedSet = normalizeName(setName);
    const setFolder = path.join(seriesFolder, normalizedSet);

    if (!fs.existsSync(setFolder)) {
      fs.mkdirSync(setFolder, { recursive: true });
    }

    const cardsInSet = setsObj[setName];

    // Generate card list HTML
    const cardHTML = generateCardList(cardsInSet);

    const cssRelSet = '../../../geeksguild.css';

    const setHTML = setTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace(/{{setName}}/g, setName)
      .replace('{{cardList}}', cardHTML)
      .replace('{{cssPath}}', cssRelSet);

    fs.writeFileSync(path.join(setFolder, 'index.html'), setHTML);
    console.log(`Wrote set page: ${path.join(setFolder, 'index.html')}`);
  });
});
