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

  // ✅ Filter cards if a series is selected
  const cardsToUse = currentSeries
    ? allCards.filter(row => row[8] === currentSeries) // Assuming column 8 = Series
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

  // Optionally, auto-select the first set
  if (uniqueSets.length > 0) {
    renderCardsForSet(uniqueSets[0]);
    container.firstChild.classList.add('active');
  }
}

// 🃏 Render all cards from a selected set
function renderCardsForSet(setName) {
  const filteredCards = allCards.filter(row => row[1] === setName);
  const grid = document.createElement('div');
  grid.className = 'card-grid';

  filteredCards.forEach(row => {
    const [name, set, cardNum, rarity, variant, grade, condition, qty] = row;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${name}</h3>
      <p><strong>Set:</strong> ${set}</p>
      <p><strong>Card #:</strong> ${cardNum}</p>
      <p><strong>Rarity:</strong> ${rarity}</p>
      <p><strong>Variance:</strong> ${variant}</p>
      <p><strong>Grade:</strong> ${grade}</p>
      <p><strong>Condition:</strong> ${condition}</p>
      <p><strong>Quantity:</strong> ${qty}</p>
    `;

    grid.appendChild(card);
  });

  const container = document.getElementById('tableContainer');
  container.innerHTML = '';
  container.appendChild(grid);
}

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
