const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';
const seriesRootFolder = 'series';
const seriesIndexTemplate = fs.readFileSync('series_index_template.html', 'utf8');

// Normalize names for folders/filenames (same as before)
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Parse CSV, simple comma split, no commas in fields assumed
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// Generate set links HTML for a given set of set names
function generateSetLinks(sets, imagePathPrefix) {
  return sets.map(setName => {
    const folderName = normalizeName(setName);
    return `
      <a href="${folderName}/index.html" class="set-card">
        <img src="${imagePathPrefix}/${folderName}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Generate series links HTML for root series index page
function generateSeriesLinks(seriesNames, imagePathPrefix) {
  return seriesNames.map(seriesName => {
    const folderName = normalizeName(seriesName);
    return `
      <a href="${folderName}/index.html" class="series-card">
        <img src="${imagePathPrefix}/${folderName}.png" alt="${seriesName}" />
        <span>${seriesName}</span>
      </a>
    `;
  }).join('\n');
}

fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const cards = parseCSV(data);

  // Map of seriesName => Set of sets in that series
  const seriesMap = {};

  // Also keep a set of all unique series names for root index page
  const allSeriesSet = new Set();

  cards.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!seriesName) return;

    allSeriesSet.add(seriesName);

    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = new Set();
    }

    seriesMap[seriesName].add(setName);
  });

  // Convert to arrays for iteration
  const allSeries = Array.from(allSeriesSet).sort();

  // === Generate root series index page ===
  const seriesRootPath = path.join(seriesRootFolder);
  if (!fs.existsSync(seriesRootPath)) {
    fs.mkdirSync(seriesRootPath, { recursive: true });
  }

  // For root series/index.html:
  // CSS path is: ../geeksguild.css (back 1 level)
  // Images path is: ../images
  const rootCssPath = '../geeksguild.css';
  const rootImagesPath = '../images';

  const seriesLinksHTML = generateSeriesLinks(allSeries, rootImagesPath);

  const rootIndexHTML = seriesIndexTemplate
    .replace(/{{seriesName}}/g, 'All Series')
    .replace('{{setLinks}}', seriesLinksHTML)
    .replace('{{cssPath}}', rootCssPath);

  fs.writeFileSync(path.join(seriesRootPath, 'index.html'), rootIndexHTML);
  console.log(`Created ${path.join(seriesRootPath, 'index.html')}`);

  // === Generate each series folder index.html ===
  Object.entries(seriesMap).forEach(([seriesName, setsSet]) => {
    const sets = Array.from(setsSet).sort();
    const normalizedSeriesName = normalizeName(seriesName);
    const seriesFolder = path.join(seriesRootFolder, normalizedSeriesName);

    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    // For nested series pages (e.g., series/xy/index.html):
    // CSS path: ../../geeksguild.css (back 2 levels)
    // Images path: ../../images
    const cssPath = '../../geeksguild.css';
    const imagesPath = '../../images';

    const setLinksHTML = generateSetLinks(sets, imagesPath);

    const htmlContent = seriesIndexTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', cssPath);

    const outputPath = path.join(seriesFolder, 'index.html');
    fs.writeFileSync(outputPath, htmlContent);

    console.log(`Created ${outputPath}`);
  });
});
