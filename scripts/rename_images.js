const fs = require('fs');
const path = require('path');

// Configuration
const IMAGES_DIR = path.join(__dirname, '..', 'images');
const DRY_RUN = process.argv.includes('--dry-run');

console.log('=== Image Renaming Script ===');
console.log(`Target directory: ${IMAGES_DIR}`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no actual changes)' : 'LIVE (will rename files)'}`);
console.log('');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Main logic
try {
  const allFiles = getAllFiles(IMAGES_DIR);
  let renameCount = 0;
  let skipCount = 0;

  console.log(`Found ${allFiles.length} total files in images directory\n`);

  allFiles.forEach(filePath => {
    const dir = path.dirname(filePath);
    const oldName = path.basename(filePath);
    
    // Only process files with underscores
    if (oldName.includes('_')) {
      const newName = oldName.replace(/_/g, '-');
      const newPath = path.join(dir, newName);
      
      // Check if target file already exists
      if (fs.existsSync(newPath)) {
        console.log(`⚠️  SKIP: ${oldName} → ${newName} (target already exists)`);
        skipCount++;
      } else {
        console.log(`${DRY_RUN ? '📋' : '✅'} ${oldName} → ${newName}`);
        
        if (!DRY_RUN) {
          fs.renameSync(filePath, newPath);
        }
        renameCount++;
      }
    }
  });

  console.log('\n=== Summary ===');
  console.log(`Files to rename: ${renameCount}`);
  console.log(`Files skipped: ${skipCount}`);
  
  if (DRY_RUN) {
    console.log('\n💡 This was a dry run. Run without --dry-run to actually rename files.');
  } else {
    console.log('\n✅ Rename operation completed!');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

