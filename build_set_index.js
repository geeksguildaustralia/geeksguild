const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';  // Adjust path if needed
const seriesTemplateFile = 'series_index_template.html';
const setTemplateFile = 'set_index_template.html';

// Helper to normalize folder/file names
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Simple CSV parser (no commas inside fields)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// Generate set links HTML (used in series index)
function generateSetLinks(sets) {
  return sets.map(setName => {
    const folderName = normalizeName(setName);
    const imgPath = `../../images/${folderName}.png`;
    return `
      <a href="${folderName}/index.html" class="set-card">
        <img src="${imgPath}" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Read templates
const seriesIndexTemplate = fs.readFileSync(seriesTemplateFile, 'utf8');
const setIndexTemplate = fs.readFileSync(setTemplateFile, 'utf8');

fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const cards = parseCSV(data);

  // Group sets by series, skipping "Base Set"
  const seriesMap = {};

  cards.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!seriesName || seriesName.toLowerCase() === 'base set') return;

    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = new Set();
    }
    seriesMap[seriesName].add(setName);
  });

  // Create series index pages and sets folders with set index pages
  Object.entries(seriesMap).forEach(([seriesName, setsSet]) => {
    const sets = Array.from(setsSet).sort();
    const normalizedSeriesName = normalizeName(seriesName);
    const seriesFolder = path.join('series', normalizedSeriesName);

    // Ensure series folder exists
    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    // Generate set links HTML for series index page
    const setLinksHTML = generateSetLinks(sets);

    // CSS path for series index: ../../geeksguild.css
    const cssPathForSeries = '../../geeksguild.css';

    // Create series index.html
    const seriesHtml = seriesIndexTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', cssPathForSeries);

    fs.writeFileSync(path.join(seriesFolder, 'index.html'), seriesHtml);
    console.log(`Created series index: ${path.join(seriesFolder, 'index.html')}`);

    // For each set, create folder and index.html
    sets.forEach(setName => {
      const normalizedSetName = normalizeName(setName);
      const setFolder = path.join(seriesFolder, normalizedSetName);

      if (!fs.existsSync(setFolder)) {
        fs.mkdirSync(setFolder, { recursive: true });
      }

      // CSS path for set index page:
      // from series/<series>/<set>/index.html to geeksguild.css is ../../../geeksguild.css
      const cssPathForSet = '../../../geeksguild.css';

      // Replace placeholders in set template
      const setHtml = setIndexTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace(/{{cssPath}}/g, cssPathForSet);

      fs.writeFileSync(path.join(setFolder, 'index.html'), setHtml);
      console.log(`Created set index: ${path.join(setFolder, 'index.html')}`);
    });
  });
});
