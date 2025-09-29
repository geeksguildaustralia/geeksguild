const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';  // adjust if needed
const seriesIndexTemplate = fs.readFileSync('series_index_template.html', 'utf8');

// Helper to normalize names to folder/filenames (like before)
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

fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const cards = parseCSV(data);

  // Group sets by series, excluding "Base Set"
  const seriesMap = {};

  cards.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!seriesName || seriesName.toLowerCase() === 'base set') {
      // Skip base set or empty series
      return;
    }

    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = new Set();
    }
    seriesMap[seriesName].add(setName);
  });

  // For each series, generate index.html with set links
  Object.entries(seriesMap).forEach(([seriesName, setsSet]) => {
    const sets = Array.from(setsSet).sort();
    const normalizedSeriesName = normalizeName(seriesName);
    const seriesFolder = path.join('series', normalizedSeriesName);

    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    const setLinksHTML = generateSetLinks(sets);

    // Calculate CSS relative path (series/[series]/index.html is 2 levels deep)
    // So ../../geeksguild.css
    const cssRelativePath = '../../geeksguild.css';

    // Replace {{cssPath}} in template with relative path
    const htmlContent = seriesIndexTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', cssRelativePath);

    const outputPath = path.join(seriesFolder, 'index.html');
    fs.writeFileSync(outputPath, htmlContent);

    console.log(`Created ${outputPath}`);
  });
});
