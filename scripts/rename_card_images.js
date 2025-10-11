const fs = require('fs');
const path = require('path');

// Configuration
const cardsDir = path.join(__dirname, '..', 'images', 'cards');

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Process each series folder
fs.readdir(cardsDir, { withFileTypes: true }, (err, seriesDirs) => {
  if (err) {
    console.error('Error reading cards directory:', err);
    return;
  }

  seriesDirs.forEach(seriesDir => {
    if (!seriesDir.isDirectory() || seriesDir.name.startsWith('.')) return;

    const seriesPath = path.join(cardsDir, seriesDir.name);
    const seriesSlug = seriesDir.name; // Already normalized

    // Process each set folder within the series
    fs.readdir(seriesPath, { withFileTypes: true }, (err, setDirs) => {
      if (err) {
        console.error(`Error reading series directory ${seriesPath}:`, err);
        return;
      }

      setDirs.forEach(setDir => {
        if (!setDir.isDirectory() || setDir.name.startsWith('.')) return;

        const setPath = path.join(seriesPath, setDir.name);
        const setSlug = setDir.name; // Already normalized

        // Process each image file in the set
        fs.readdir(setPath, (err, files) => {
          if (err) {
            console.error(`Error reading set directory ${setPath}:`, err);
            return;
          }

          files.forEach(file => {
            if (!file.endsWith('.jpg') && !file.endsWith('.png')) return;

            // Extract card number from filename
            // Old format: series-series-123.jpg or series-set-123.jpg
            // New format: series-set-123.jpg
            const match = file.match(/(\d+)\.(jpg|png)$/);
            if (!match) return;

            const cardNumber = match[1];
            const extension = match[2];

            // Build expected filename
            const expectedFilename = `${seriesSlug}-${setSlug}-${cardNumber}.${extension}`;

            if (file !== expectedFilename) {
              const oldPath = path.join(setPath, file);
              const newPath = path.join(setPath, expectedFilename);

              // Check if the new file already exists
              if (fs.existsSync(newPath)) {
                console.log(`⚠️  Skipping: ${file} → ${expectedFilename} (target exists)`);
                return;
              }

              // Rename the file
              fs.rename(oldPath, newPath, (err) => {
                if (err) {
                  console.error(`❌ Error renaming ${file}:`, err);
                } else {
                  console.log(`✅ ${seriesSlug}/${setSlug}/${file} → ${expectedFilename}`);
                }
              });
            }
          });
        });
      });
    });
  });
});

console.log('🔄 Renaming card images to match expected format...');
console.log('📁 Target directory:', cardsDir);

