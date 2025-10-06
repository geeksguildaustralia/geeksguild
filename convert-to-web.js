import fs from 'fs';
import path from 'path';
import { ImagePool } from '@squoosh/lib';

const INPUT_DIR = path.resolve('geeksguild/images/cards');
const OUTPUT_DIR = path.resolve('output/webp_images');

async function convertImage(inputFilePath, outputFilePath) {
  const imagePool = new ImagePool();

  try {
    const image = imagePool.ingestImage(inputFilePath);
    await image.decoded;
    await image.encode({ webp: { quality: 75 } });
    const webpImage = await image.encodedWith.webp;
    await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.promises.writeFile(outputFilePath, webpImage.binary);
    console.log(`Converted: ${inputFilePath} -> ${outputFilePath}`);
  } catch (err) {
    console.error(`Error converting ${inputFilePath}:`, err);
  } finally {
    await imagePool.close();
  }
}

async function walkDir(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkDir(fullPath);
    } else if (entry.isFile()) {
      if (/\.(jpe?g)$/i.test(entry.name)) {
        // Construct output path preserving folder structure, but with .webp extension
        const relativePath = path.relative(INPUT_DIR, fullPath);
        const outputFilePath = path.join(OUTPUT_DIR, relativePath).replace(/\.(jpe?g)$/i, '.webp');
        await convertImage(fullPath, outputFilePath);
      }
    }
  }
}

(async () => {
  try {
    await walkDir(INPUT_DIR);
    console.log('All images converted!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
