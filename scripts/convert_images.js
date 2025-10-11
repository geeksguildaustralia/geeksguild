const fs = require('fs');
const path = require('path');
const { ImagePool } = require('@squoosh/lib');

async function convertImages() {
  const imagesDir = path.join(__dirname, '..', 'images');
  
  const filesToConvert = [
    { input: 'glory-of-team-rocket.webp', output: 'glory-of-team-rocket.png' },
    { input: 'paradise-dragona.avif', output: 'paradise-dragona.png' },
    { input: 'ruler-of-the-black-flame.webp', output: 'ruler-of-the-black-flame.png' }
  ];

  const imagePool = new ImagePool();

  for (const file of filesToConvert) {
    const inputPath = path.join(imagesDir, file.input);
    const outputPath = path.join(imagesDir, file.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${file.input} - file not found`);
      continue;
    }

    try {
      console.log(`🔄 Converting ${file.input} to ${file.output}...`);
      
      const imageBuffer = fs.readFileSync(inputPath);
      const image = imagePool.ingestImage(imageBuffer);

      await image.encode({
        oxipng: { level: 2 }
      });

      const { binary } = await image.encodedWith.oxipng;
      fs.writeFileSync(outputPath, binary);

      console.log(`✅ Converted ${file.input} → ${file.output}`);
    } catch (err) {
      console.error(`❌ Error converting ${file.input}:`, err.message);
    }
  }

  await imagePool.close();
  console.log('\n✅ Conversion complete!');
}

convertImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

