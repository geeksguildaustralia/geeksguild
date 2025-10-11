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
    .replace(/\band\b/g, '')
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
  const sortedCards = cards.slice().sort((a, b) => extractCardNumber(a[2]) - extractCardNumber(b[2]));

  return sortedCards.map(row => {
    const [name, set, cardNum, , , , , , series] = row;

    const seriesSlug = normalizeName(series);
    const setSlug = normalizeName(set);

    if (!seriesSlug) {
      console.warn(`Warning: generateCardList got empty seriesSlug for series "${series}"`);
    }
    if (!setSlug) {
      console.warn(`Warning: generateCardList got empty setSlug for set "${set}"`);
    }

    const cleanCardNum = parseInt(cardNum.trim().split(/[^\d]+/)[0], 10) || 0;

    const fileName = `${seriesSlug}-${setSlug}-${cleanCardNum}.jpg`;
    const imgPath = `${CARD_IMG_BASE_PATH}/${seriesSlug}/${setSlug}/${fileName}`;

    return `
      <div class="card">
        <h3>${name}</h3>
        <img src="${imgPath}" alt="${name}" onerror="this.src='${FALLBACK_IMG}'" />
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
