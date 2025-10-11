console.log('Current working directory:', process.cwd());

const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const CSV_FILE = 'pokemon-cards.csv';
const SERIES_TEMPLATE_FILE = 'series_index_template.html';
const SET_TEMPLATE_FILE = 'set_index_template.html';
const OUTPUT_DIR = 'series';
const CARD_IMG_BASE_PATH = '../../../images/cards';
const FALLBACK_IMG = '../../../images/default-card.jpg';
const CSS_PATH_SERIES = '../../geeksguild.css';
const CSS_PATH_SET = '../../../geeksguild.css';

// === UTILITY FUNCTIONS ===

function normalizeName(name) {
  if (!name) {
    console.warn('Warning: normalizeName called with empty or undefined name');
    return '';
  }
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\band\b/g, '') // Remove "and" from set names too
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSeriesNameForFilename(name) {
  if (!name) {
    console.warn('Warning: normalizeSeriesNameForFilename called with empty or undefined name');
    return '';
  }
  return name
    .toLowerCase()
    .replace(/\band\b/g, '')  // Remove "and" from series names only
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

function extractCardNumber(cardNumStr) {
  const match = cardNumStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function generateSetLinks(seriesName, setNames) {
  const seriesSlug = normalizeName(seriesName);
  if (!seriesSlug) {
    console.warn(`Warning: generateSetLinks got empty seriesSlug for seriesName "${seriesName}"`);
  }
  return setNames.map(setName => {
    const setSlug = normalizeName(setName);
    if (!setSlug) {
      console.warn(`Warning: generateSetLinks got empty setSlug for setName "${setName}"`);
    }
    return `
      <a href="${setSlug}/index.html" class="set-card">
        <img src="../../images/${seriesSlug}.png" alt="${setName}" />
        <span>${setName}</span>
      </a>
    `;
  }).join('\n');
}

function generateCardList(cards) {
  // Group cards by card number to aggregate normal and reverse holo quantities
  const cardMap = {};
  
  cards.forEach(row => {
    const [name, set, cardNum, rarity, variance, , , quantity, series] = row;
    const trimmedCardNum = cardNum.trim();
    // Extract numeric part from card number (e.g., "XY187" -> 187, "123" -> 123)
    const numericMatch = trimmedCardNum.match(/\d+/);
    const cleanCardNum = numericMatch ? parseInt(numericMatch[0], 10) : 0;
    const key = trimmedCardNum; // Use the full card number as key
    
    if (!cardMap[key]) {
      cardMap[key] = {
        name,
        set,
        cardNum: trimmedCardNum,
        rarity: rarity || 'N/A',
        series,
        normalQty: 0,
        reverseHoloQty: 0,
        cleanCardNum: isNaN(cleanCardNum) ? 0 : cleanCardNum
      };
    }
    
    const isReverseHolo = variance && variance.toLowerCase().includes('reverse');
    const qty = parseInt(quantity) || 0;
    
    if (isReverseHolo) {
      cardMap[key].reverseHoloQty += qty;
    } else {
      cardMap[key].normalQty += qty;
    }
  });

  // Convert back to array and sort
  const sortedCards = Object.values(cardMap).sort((a, b) => a.cleanCardNum - b.cleanCardNum);

  return sortedCards.map(card => {
    const seriesSlug = normalizeSeriesNameForFilename(card.series);
    let setSlug = normalizeName(card.set);

    // Special case: Radiant Collection and Trainer Gallery sets should use their parent set's folder
    if (card.set.includes('Radiant Collection')) {
      if (card.set.includes('Generations')) {
        setSlug = 'generations';
      } else if (card.set.includes('Legendary Treasures')) {
        setSlug = 'legendary-treasures';
      }
    } else if (card.set.includes('Trainer Gallery')) {
      // Extract parent set name (e.g., "Astral Radiance Trainer Gallery" -> "astral-radiance")
      const parentSet = card.set.replace(/\s*Trainer Gallery\s*/i, '').trim();
      setSlug = normalizeName(parentSet);
    }

    if (!seriesSlug) {
      console.warn(`Warning: generateCardList got empty seriesSlug for series "${card.series}"`);
    }
    if (!setSlug) {
      console.warn(`Warning: generateCardList got empty setSlug for set "${card.set}"`);
    }

    // Check if this is a sealed product
    let imgPath;
    const nameLower = card.name.toLowerCase();
    
    if (nameLower.includes('elite trainer box')) {
      // Map set names to sealed product filenames
      const setMapping = {
        'black-bolt': 'black-bolt',
        'white-flare': 'white-flare',
        'prismatic-evolutions': 'prismatic'
      };
      const sealedPrefix = setMapping[setSlug] || setSlug;
      imgPath = `../../../images/sealed/${sealedPrefix}-etb.jpg`;
    } else if (nameLower.includes('booster bundle')) {
      imgPath = `../../../images/sealed/prismatic-booster-bundle.webp`;
    } else if (nameLower.includes('surprise box')) {
      imgPath = `../../../images/sealed/prismatic-surprise-box.jpg`;
    } else if (nameLower.includes('blooming waters')) {
      imgPath = `../../../images/sealed/blooming-waters.jpg`;
    } else {
      // Regular card
      const fileName = `${card.cleanCardNum}.jpg`;
      imgPath = `${CARD_IMG_BASE_PATH}/${seriesSlug}/${setSlug}/${fileName}`;
    }

    return `
      <div class="card" 
           data-card-number="${card.cardNum}" 
           data-set="${card.set}" 
           data-rarity="${card.rarity}" 
           data-quantity="${card.normalQty}"
           data-reverse-holo="${card.reverseHoloQty}">
        <h3>${card.name}</h3>
        <img src="${imgPath}" alt="${card.name}" onerror="this.src='${FALLBACK_IMG}'" />
      </div>
    `;
  }).join('\n');
}

// === MAIN SCRIPT ===

const seriesTemplate = fs.readFileSync(SERIES_TEMPLATE_FILE, 'utf8');
const setTemplate = fs.readFileSync(SET_TEMPLATE_FILE, 'utf8');

fs.readFile(CSV_FILE, 'utf8', (err, csvText) => {
  if (err) {
    console.error('❌ Error reading CSV:', err);
    return;
  }

  const rows = parseCSV(csvText).filter(row => row.length >= 9);

  // Group cards by series → set
  const seriesMap = {};

  rows.forEach(row => {
    const setName = row[1];
    const seriesName = row[8];

    if (!seriesName || !setName) {
      console.warn('Skipping row due to missing series or set:', row);
      return;
    }

    if (!seriesMap[seriesName]) seriesMap[seriesName] = {};
    if (!seriesMap[seriesName][setName]) seriesMap[seriesName][setName] = [];

    seriesMap[seriesName][setName].push(row);
  });

  Object.entries(seriesMap).forEach(([seriesName, sets]) => {
    const seriesSlug = normalizeName(seriesName);
    if (!seriesSlug) {
      console.warn(`Skipping series with empty slug: "${seriesName}"`);
      return;
    }

    const seriesDir = path.join(OUTPUT_DIR, seriesSlug);
    if (!fs.existsSync(seriesDir)) fs.mkdirSync(seriesDir, { recursive: true });

    // Timestamp for footer
    const now = new Date().toISOString();

    // Create Series Index Page
    const setNames = Object.keys(sets).sort();
    let seriesHTML = seriesTemplate
      .replace(/{{seriesName}}/g, seriesName)
      .replace('{{setLinks}}', generateSetLinks(seriesName, setNames))
      .replace('{{cssPath}}', CSS_PATH_SERIES);

    // Append timestamp footer before closing </body>
    seriesHTML = seriesHTML.replace('</body>', `<footer>Generated at ${now}</footer></body>`);

    const seriesIndexPath = path.join(seriesDir, 'index.html');
    console.log('Writing series index to:', seriesIndexPath);

    // Preview what will be written
    console.log('--- Series HTML Preview ---');
    console.log(seriesHTML.slice(0, 500));
    console.log('--------------------------');

    fs.writeFileSync(seriesIndexPath, seriesHTML);
    console.log(`✅ Wrote series index: ${seriesIndexPath}`);

    // Verify the written file
    const writtenContent = fs.readFileSync(seriesIndexPath, 'utf8');
    console.log('--- Verified Written Content Preview ---');
    console.log(writtenContent.slice(0, 300));
    console.log('---------------------------------------');

    // Create Set Pages
    setNames.forEach(setName => {
      const setSlug = normalizeName(setName);
      if (!setSlug) {
        console.warn(`Skipping set with empty slug: "${setName}"`);
        return;
      }

      const setDir = path.join(seriesDir, setSlug);
      if (!fs.existsSync(setDir)) fs.mkdirSync(setDir, { recursive: true });

      const cards = sets[setName];
      let setHTML = setTemplate
        .replace(/{{seriesName}}/g, seriesName)
        .replace(/{{setName}}/g, setName)
        .replace('{{cardList}}', generateCardList(cards))
        .replace('{{cssPath}}', CSS_PATH_SET);

      // Append timestamp footer before closing </body>
      setHTML = setHTML.replace('</body>', `<footer>Generated at ${now}</footer></body>`);

      const setIndexPath = path.join(setDir, 'index.html');
      console.log('Writing set page to:', setIndexPath);

      // Preview before writing
      console.log('--- Set HTML Preview ---');
      console.log(setHTML.slice(0, 500));
      console.log('-----------------------');

      fs.writeFileSync(setIndexPath, setHTML);
      console.log(`✅ Wrote set page: ${setIndexPath}`);

      // Verify the written file
      const writtenSetContent = fs.readFileSync(setIndexPath, 'utf8');
      console.log('--- Verified Written Set Content Preview ---');
      console.log(writtenSetContent.slice(0, 300));
      console.log('--------------------------------------------');
    });
  });
});
