const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'pokemon-cards.csv');
let csvContent = fs.readFileSync(csvPath, 'utf-8');

// Split into lines
const lines = csvContent.split('\n');
const header = lines[0];
const dataLines = lines.slice(1);

// Sets to move to Japanese Cards series
const japaneseSets = [
  'Scarlet & Violet Promo JP',
  'Pokemon 151',
  'Glory of Team Rocket',
  'Mega Brave',
  'Ruler of the Black Flame',
  'Raging Surf',
  'Incandescent Arcana',
  'Dream League',
  'Neo Discovery',
  'Paradise Dragona'
];

// Process each line
const updatedLines = dataLines.map(line => {
  if (!line.trim()) return line;
  
  const columns = line.split(',');
  const setName = columns[1]?.trim();
  
  // Check if this set should be moved to Japanese Cards
  if (japaneseSets.includes(setName)) {
    // Column 8 is the Series
    columns[8] = 'Japanese Cards';
    return columns.join(',');
  }
  
  return line;
});

// Write the updated CSV
const updatedCSV = [header, ...updatedLines].join('\n');
fs.writeFileSync(csvPath, updatedCSV, 'utf-8');

console.log('✅ Updated CSV - moved Japanese sets to "Japanese Cards" series');
console.log('Sets moved:', japaneseSets.join(', '));

