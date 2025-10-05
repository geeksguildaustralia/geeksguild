const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';

// Normalize names to safe folder/file names
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Simple CSV parser (no handling of quoted commas, etc.)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1);
  return dataRows.map(line => line.split(',').map(cell => cell.trim()));
}

// Generate HTML for set links (to go into a series page)
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

// Generate HTML for cards inside a set page, with fallback image
function generateCardList(cardsInSet) {
  const defaultImg = '../../../images/default_card.png'; // fallback image path

  return cardsInSet.map(row => {
    const cardName = row[0];
    const setName = row[1];
    const seriesName = row[8];
    const normalizedSet = normalizeName(setName);
    const normalizedCard = normalizeName(cardName);
    const imgPath = `../../../cards/${normalizeName(seriesName)}/${normalizedSet}/${normalizedCard}.png`;

    return `
      <div class="card">
        <h3>${cardName}</h3>
        <img src="${imgPath}" alt="${cardName}" onerror="this.onerror=null;this.src='${defaultImg}';" />
      </div>
    `;
  }).join('\n');
}

// Read templates
const seriesTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setTemplate = fs.readFileSync(setTemplateFile, 'utf8');

// Read CSV and build data structure
fs.readFile(csvFile, 'utf8', (err, text) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const rows = parseCSV(text);

  // Build nested map: series → set → array of card rows
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

  console.log('Found series:', Object.keys(seriesMap));

  Object.entries(seriesMap).forEach(([seriesName, setsObj]) => {
    const normalizedSeries = normalizeName(seriesName);
    const seriesFolder = path.join('series', normalizedSeries);

    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    const setNames = Object.keys(setsObj).sort();
    console.log(`Series "${seriesName}" has sets:`, setNames);

    const setLinksHTML = generateSetLinks(setNames);
    const cssRel = '../../geeksguild.css';

    const seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', cssRel);

    fs.writeFileSync(path.join(seriesFolder, 'index.html'), seriesHTML);
    console.log(`Wrote series page: ${path.join(seriesFolder, 'index.html')}`);

    setNames.forEach(setName => {
      const normalizedSet = normalizeName(setName);
      const setFolder = path.join(seriesFolder, normalizedSet);

      if (!fs.existsSync(setFolder)) {
        fs.mkdirSync(setFolder, { recursive: true });
      }

      const cardsInSet = setsObj[setName];
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
});
