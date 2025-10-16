const fs = require('fs');
const path = require('path');

// Read the CSV to get the card numbers in order
const csvPath = path.join(__dirname, '..', 'pokemon-cards.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Get Scarlet & Violet Promo cards in the order they appear in CSV
const promoCards = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = line.split(',');
  const set = values[1]?.trim();
  const cardNumber = values[2]?.trim();
  
  if (set === 'Scarlet & Violet Promo' && cardNumber) {
    promoCards.push(cardNumber);
  }
}

console.log(`Found ${promoCards.length} Scarlet & Violet Promo cards`);
console.log('Card numbers:', promoCards.slice(0, 10).join(', '), '...');

// Path to the images
const imagesDir = path.join(__dirname, '..', 'images', 'cards', 'scarlet-violet', 'scarlet-violet-promo');

if (!fs.existsSync(imagesDir)) {
  console.error('Images directory not found:', imagesDir);
  process.exit(1);
}

// Get all sequential image files
const imageFiles = fs.readdirSync(imagesDir)
  .filter(f => f.match(/^\d+\.jpg$/))
  .sort((a, b) => parseInt(a) - parseInt(b));

console.log(`Found ${imageFiles.length} image files`);

// Create a temp directory for backup
const tempDir = path.join(imagesDir, '_temp_rename');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// First, move all files to temp with their new names
for (let i = 0; i < Math.min(imageFiles.length, promoCards.length); i++) {
  const oldFile = imageFiles[i];
  const newNumber = promoCards[i];
  const newFile = `${newNumber}.jpg`;
  
  const oldPath = path.join(imagesDir, oldFile);
  const tempPath = path.join(tempDir, newFile);
  
  console.log(`Renaming: ${oldFile} → ${newFile}`);
  fs.copyFileSync(oldPath, tempPath);
}

// Then move them back from temp to main directory
const tempFiles = fs.readdirSync(tempDir);
for (const file of tempFiles) {
  const tempPath = path.join(tempDir, file);
  const finalPath = path.join(imagesDir, file);
  fs.renameSync(tempPath, finalPath);
}

// Delete old sequential files
for (const file of imageFiles) {
  const filePath = path.join(imagesDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Remove temp directory
fs.rmdirSync(tempDir);

console.log('✅ Done! Images renamed to match card numbers');

