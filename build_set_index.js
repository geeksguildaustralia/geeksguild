const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';

const normalizeName = (name) => name.toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_+|_+$/g, '');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1);
  return dataRows.map(line => line.split(',').map(cell => cell.trim()));
}

function generateSetLinks(sets, seriesName) {
  return sets.map(setName => {
    const normalizedSet = normalizeName(setName);
    return `
      <a href="${normalizedSet}/index.html" class="set-card">
        <img src="../../images/${normalizedSet}.png" alt="${setName}" onerror="this.onerror=null;this.src='../../images/default_card.png'" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

function generateCardList(cardsInSet, seriesName, setName) {
  const normalizedSeries = normalizeName(seriesName);
  const normalizedSet = normalizeName(setName);

  return cardsInSet.map(row => {
    const cardName = row[0];
    const normalizedCard = normalizeName(cardName);
    const imgPath = `../../../images/cards/${normalizedSeries}/${normalizedSet}/${normalizedCard}.png`;

    return `
      <div class="card">
        <h3>${cardName}</h3>
        <img src="${imgPath}" alt="${cardName}" onerror="this.onerror=null;this.src='../../../images/default_card.png'" />
      </div>
    `;
  }).join('\n');
}

const seriesTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setTemplate = fs.readFileSync(setTemplateFile, 'utf8');

fs.readFile(csvFile, 'utf8', (err, text) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const rows = parseCSV(text);
  const seriesMap = {};

  rows.forEach(row => {
    const cardName = row[0];
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
    const seriesFolder = path.join('series', normalizedSeries);

    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    const setNames = Object.keys(setsObj).sort();
    const setLinksHTML = generateSetLinks(setNames, seriesName);

    const seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', '../../geeksguild.css');

    fs.writeFileSync(path.join(seriesFolder, 'index.html'), seriesHTML);
    console.log(`✅ Wrote series page: ${path.join(seriesFolder, 'index.html')}`);

    setNames.forEach(setName => {
      const normalizedSet = normalizeName(setName);
      const setFolder = path.join(seriesFolder, normalizedSet);

      if (!fs.existsSync(setFolder)) {
        fs.mkdirSync(setFolder, { recursive: true });
      }

      const cardsInSet = setsObj[setName];
      const cardHTML = generateCardList(cardsInSet, seriesName, setName);

      const setHTML = setTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace('{{cardList}}', cardHTML)
        .replace('{{cssPath}}', '../../../geeksguild.css');

      fs.writeFileSync(path.join(setFolder, 'index.html'), setHTML);
      console.log(`✅ Wrote set page: ${path.join(setFolder, 'index.html')}`);
    });
  });
});
