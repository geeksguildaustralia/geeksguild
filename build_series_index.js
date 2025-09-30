const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';  // adjust if needed
const seriesIndexTemplate = fs.readFileSync('series_index_template.html', 'utf8');

// Normalize names to safe folder/file names
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Simple CSV parser (assuming no commas inside fields)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// Generate set links HTML for a given series
function generateSetLinks(sets) {
  return sets.map(setName => {
    const folderName = normalizeName(setName);
    return `
      <a href="${folderName}/index.html" class="set-card">
        <img src="/images/${folderName}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Calculate root path (relative path back to site root) for a given folder
// e.g. series/<seriesFolder> is 2 levels deep => rootPath = '../../'
function getRootPath(folderPath) {
  // Calculate how deep this folder is relative to 'series' folder
  const relativePath = path.relative('series', folderPath);
  if (!relativePath || relativePath === '') return './'; // directly under series folder, so './'
  const depth = relativePath.split(path.sep).length;
  return '../'.repeat(depth + 1);  // +1 accounts for 'series' folder itself
}

fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const cards = parseCSV(data);

  // Group sets by series, exclude "Base Set"
  const seriesMap = {};

  cards.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!seriesName || seriesName.toLowerCase() === 'base set') {
      // skip base set or empty series
      return;
    }

    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = new Set();
    }
    seriesMap[seriesName].add(setName);
  });

  // For each series, generate series index page
  Object.entries(seriesMap).forEach(([seriesName, setsSet]) => {
    const sets = Array.from(setsSet).sort();
    const normalizedSeriesName = normalizeName(seriesName);
    const seriesFolder = path.join('series', normalizedSeriesName);

    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    const setLinksHTML = generateSetLinks(sets);
    const rootPath = getRootPath(seriesFolder);

    const htmlContent = seriesIndexTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace(/{{rootPath}}/g, rootPath);

    const outputPath = path.join(seriesFolder, 'index.html');
    fs.writeFileSync(outputPath, htmlContent);

    console.log(`Created ${outputPath} with rootPath=${rootPath}`);
  });
});
