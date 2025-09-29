let allCards = [];
let headers = [];

// 🔍 Detect current series from <body data-series="XY">
const currentSeries = document.body.dataset.series || null;

// 🔗 Get base path for images
const basePath = `/${window.location.pathname.split('/')[1]}`;

// 🧹 Normalize set name to a consistent filename
function normalizeSetNameToFilename(setName) {
  return setName
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') + '.png';
}

// 🖼 Render buttons for each set in the current series
function renderSetButtons() {
  const container = document.getElementById('setButtons');
  if (!container) return;

  container.innerHTML = '';

  // ✅ Filter cards if a series is selected (assuming column 8 = Series)
  const cardsToUse = currentSeries
    ? allCards.filter(row => row[8] === currentSeries)
    : allCards;

  const uniqueSets = Array.from(new Set(cardsToUse.map(row => row[1]))).sort();

  uniqueSets.forEach(setName => {
    const btn = document.createElement('button');
    btn.className = 'set-button';

    const img = document.createElement('img');
    img.className = 'set-img';
    img.alt = `${setName} icon`;
    img.src = `${basePath}/images/${normalizeSetNameToFilename(setName)}`;
    img.onerror = () => {
      img.src = `${basePath}/images/default.png`;
    };

    const label = document.createElement('span');
    label.textContent = setName;

    btn.appendChild(img);
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.set-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCardsForSet(setName);
    });

    container.appendChild(btn);
  });

  // Auto-select first set if available
  if (uniqueSets.length > 0) {
    renderCardsForSet(uniqueSets[0]);
    container.firstChild.classList.add('active');
  }
}

// 🃏 Render cards for a selected set — show title + thumbnail, click opens lightbox
function renderCardsForSet(setName) {
  const filteredCards = allCards.filter(row => row[1] === setName);
  const grid = document.createElement('div');
  grid.className = 'card-grid';

  filteredCards.forEach(row => {
    const [name, set, cardNum, rarity, variant, grade, condition, qty] = row;

    // Build image path: /cards/series/set/card.png
    const seriesFolder = currentSeries ? currentSeries.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'unknown_series';
    const setFolder = set.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cardFile = normalizeSetNameToFilename(name);
    const imgSrc = `/cards/${seriesFolder}/${setFolder}/${cardFile}`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${name}</h3>
      <img src="${imgSrc}" alt="${name}" class="card-thumb" style="cursor:pointer; max-width:200px; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
    `;

    // Lightbox open on click
    card.querySelector('img').addEventListener('click', () => {
      openLightbox({ name, set, cardNum, rarity, variant, grade, condition, qty, imgSrc });
    });

    grid.appendChild(card);
  });

  const container = document.getElementById('tableContainer');
  container.innerHTML = '';
  container.appendChild(grid);
}

// Lightbox open function
function openLightbox(card) {
  const lightbox = document.getElementById('cardLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxDetails = document.getElementById('lightboxDetails');

  lightboxImg.src = card.imgSrc;
  lightboxImg.alt = card.name;

  lightboxDetails.innerHTML = `
    <h2>${card.name}</h2>
    <p><strong>Set:</strong> ${card.set}</p>
    <p><strong>Card #:</strong> ${card.cardNum}</p>
    <p><strong>Rarity:</strong> ${card.rarity}</p>
    <p><strong>Variance:</strong> ${card.variant}</p>
    <p><strong>Grade:</strong> ${card.grade}</p>
    <p><strong>Condition:</strong> ${card.condition}</p>
    <p><strong>Quantity:</strong> ${card.qty}</p>
  `;

  lightbox.style.display = 'flex';
}

// Close lightbox events
document.getElementById('lightboxClose').addEventListener('click', () => {
  document.getElementById('cardLightbox').style.display = 'none';
});

document.getElementById('cardLightbox').addEventListener('click', e => {
  if (e.target.id === 'cardLightbox') {
    document.getElementById('cardLightbox').style.display = 'none';
  }
});

// 📋 Parse CSV text into a data array
function parseCSV(text) {
  const lines = text.trim().split('\n');
  headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// 🚀 Load CSV data and initialize UI
fetch('pokemon-cards.csv')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load CSV file.');
    return response.text();
  })
  .then(csvText => {
    allCards = parseCSV(csvText);
    renderSetButtons();
    if (!currentSeries) {
      document.getElementById('tableContainer').innerHTML = '<p>Select a set above to view cards.</p>';
    }
  })
  .catch(error => {
    console.error('CSV load error:', error);
    document.getElementById('tableContainer').innerHTML = `<p>Error loading data: ${error.message}</p>`;
  });
