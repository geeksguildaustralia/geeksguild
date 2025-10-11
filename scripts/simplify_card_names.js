const fs = require('fs');
const path = require('path');

// Configuration
const cardsDir = path.join(__dirname, '..', 'images', 'cards');
const dryRun = process.argv.includes('--dry-run');

console.log('=== Card Image Simplification Script ===');
console.log('Target directory:', cardsDir);
console.log('Mode:', dryRun ? 'DRY RUN (no actual changes)' : 'LIVE (will rename files)');
console.log('');

let totalRenamed = 0;
let totalSkipped = 0;
let totalErrors = 0;

// Process each series folder
fs.readdir(cardsDir, { withFileTypes: true }, (err, seriesDirs) => {
  if (err) {
    console.error('❌ Error reading cards directory:', err);
    return;
  }

  seriesDirs.forEach(seriesDir => {
    if (!seriesDir.isDirectory() || seriesDir.name.startsWith('.')) return;

    const seriesPath = path.join(cardsDir, seriesDir.name);

    // Process each set folder within the series
    fs.readdir(seriesPath, { withFileTypes: true }, (err, setDirs) => {
      if (err) {
        console.error(`❌ Error reading series directory ${seriesPath}:`, err);
        return;
      }

      setDirs.forEach(setDir => {
        if (!setDir.isDirectory() || setDir.name.startsWith('.')) return;

        const setPath = path.join(seriesPath, setDir.name);

        // Process each image file in the set
        fs.readdir(setPath, (err, files) => {
          if (err) {
            console.error(`❌ Error reading set directory ${setPath}:`, err);
            return;
          }

          console.log(`\n📁 Processing: ${seriesDir.name}/${setDir.name}`);

          files.forEach(file => {
            if (!file.endsWith('.jpg') && !file.endsWith('.png')) return;

            // Extract card number from filename
            // Match any number followed by the extension
            const match = file.match(/(\d+)\.(jpg|png)$/);
            if (!match) {
              console.log(`  ⚠️  Skipping ${file} (no number found)`);
              totalSkipped++;
              return;
            }

            const cardNumber = match[1];
            const extension = match[2];

            // New simple filename: just the number
            const newFilename = `${cardNumber}.${extension}`;

            if (file === newFilename) {
              // Already in the correct format
              return;
            }

            const oldPath = path.join(setPath, file);
            const newPath = path.join(setPath, newFilename);

            // Check if the new file already exists
            if (fs.existsSync(newPath) && file !== newFilename) {
              console.log(`  ⚠️  Skipping ${file} → ${newFilename} (target exists)`);
              totalSkipped++;
              return;
            }

            if (!dryRun) {
              // Rename the file
              fs.rename(oldPath, newPath, (err) => {
                if (err) {
                  console.error(`  ❌ Error renaming ${file}:`, err.message);
                  totalErrors++;
                } else {
                  console.log(`  ✅ ${file} → ${newFilename}`);
                  totalRenamed++;
                }
              });
            } else {
              console.log(`  📋 ${file} → ${newFilename}`);
              totalRenamed++;
            }
          });
        });
      });
    });
  });
});

// Summary after a short delay to let async operations complete
setTimeout(() => {
  console.log('\n=== Summary ===');
  console.log(`Files renamed: ${totalRenamed}`);
  console.log(`Files skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
  
  if (dryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to actually rename files.');
  } else {
    console.log('\n✅ Rename operation completed!');
  }
}, 3000);

