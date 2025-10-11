const fs = require('fs');
const path = require('path');

const csvFile = 'pokemon-cards.csv';  // Adjust path if needed
const templateFile = 'series_index_template.html'; // Your template

// Helper: normalize names for folder/file names
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '') // Remove "and" from folder names
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Simple CSV parser (no commas inside fields)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// Generate HTML links for sets in a series
function generateSetLinks(sets) {
  return sets.map(setName => {
    const folderName = normalizeName(setName);

    // Image path relative to series/<seriesName>/index.html
    // From series/<seriesName>/index.html to images is ../../images/
    const imgPath = `../../images/${folderName}.png`;

    return `
      <a href="${folderName}/index.html" class="set-card">
        <img src="${imgPath}" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

// Read template
const seriesIndexTemplate = fs.readFileSync(templateFile, 'utf8');

// Read CSV data and process
fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const cards = parseCSV(data);

  // Map series to sets (excluding "Base Set" series)
  const seriesMap = {};

  cards.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!seriesName || seriesName.toLowerCase() === 'base set') {
      return; // skip empty or base set
    }

    if (!seriesMap[seriesName]) {
      seriesMap[seriesName] = new Set();
    }
    seriesMap[seriesName].add(setName);
  });

  // Generate index.html per series
  Object.entries(seriesMap).forEach(([seriesName, setsSet]) => {
    const sets = Array.from(setsSet).sort();
    const normalizedSeriesName = normalizeName(seriesName);
    const seriesFolder = path.join('series', normalizedSeriesName);

    // Make folder if doesn't exist
    if (!fs.existsSync(seriesFolder)) {
      fs.mkdirSync(seriesFolder, { recursive: true });
    }

    const setLinksHTML = generateSetLinks(sets);

    // CSS path relative to series/<seriesName>/index.html
    // From series/<seriesName>/index.html to geeksguild.css is ../../geeksguild.css
    const cssRelativePath = '../../geeksguild.css';

    // Replace placeholders in template
    const htmlContent = seriesIndexTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', setLinksHTML)
      .replace('{{cssPath}}', cssRelativePath);

    // Write to series/<seriesName>/index.html
    const outputPath = path.join(seriesFolder, 'index.html');
    fs.writeFileSync(outputPath, htmlContent);

    console.log(`Created ${outputPath}`);
  });
});
