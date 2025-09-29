const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Load template
const template = fs.readFileSync('set_template.html', 'utf8');

// Load CSV
const csv = fs.readFileSync('pokemon-cards.csv', 'utf8');
const records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
});

// Group cards by Set
const sets = {};

records.forEach(card => {
  const set = card.Set;
  if (!sets[set]) sets[set] = { series: card.Series, cards: [] };
  sets[set].cards.push(card);
});

// Ensure output directory exists
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Generate HTML for each set
Object.entries(sets).forEach(([setName, { series }]) => {
  const safeSetName = setName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const fileName = `shop_${safeSetName}.html`;
  const filePath = path.join(outputDir, fileName);

  // Replace placeholders in template
  const html = template
    .replace(/{{SET_NAME}}/g, setName)
    .replace(/{{SERIES_NAME}}/g, series);

  fs.writeFileSync(filePath, html);
  console.log(`✅ Generated: ${fileName}`);
});
