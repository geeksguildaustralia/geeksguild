let allCards = [];
let headers = [];

// Get the base path dynamically (e.g. "/geeksguild")
const basePath = `/${window.location.pathname.split('/')[1]}`;

// 🔣 Normalize set name to image filename
function normalizeSetNameToFilename(setName) {
  return setName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')   // Replace non-alphanumeric characters with underscores
    .replace(/_+/g, '_')          // Collapse multiple underscores
    .replace(/^_+|_+$/g, '')      // Trim leading/trailing underscores
    + '.png';
}

// 🖼 Render buttons for each unique set
function renderSetButtons() {
  const container = document.getElementById('setButtons');
  if (!container) return;

  container.innerHTML = '';

  const sets = new Set(allCards.map(row => row[1]));
  const sortedSets = Array.from(sets).sort();

  sortedSets.forEach(setName => {
    const btn = document.createElement('button');
    btn.className = 'set-button';

    const img = document.createElement('img');
    img.className = 'set-img';
    img.alt = `${setName} icon`;

    const filename = normalizeSetNameToFilename(setName);
    img.src = `${basePath}/images/${filename}`;
    img.onerror = () => {
      console.warn(`Image not found: ${filename} → using default`);
      img.src = `${basePath}/images/default.png`;
    };

    const span = document.createElement('span');
    span.textContent = setName;

    btn.appendChild(img);
    btn.appendChild(span);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.set-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCardsForSet(setName);
    });

    container.appendChild(btn);
  });
}

// 🃏 Render cards for selected set
function renderCardsForSet(setName) {
  const filtered = allCards.filter(row => row[1] === setName);
  let html = '<div class="card-grid">';
  filtered.forEach(row => {
    html += `
      <div class="card">
        <h3>${row[0]}</h3>
        <p><strong>Set:</strong> ${row[1]}</p>
        <p><strong>Card #:</strong> ${row[2]}</p>
        <p><strong>Rarity:</strong> ${row[3]}</p>
        <p><strong>Variance:</strong> ${row[4]}</p>
        <p><strong>Grade:</strong> ${row[5]}</p>
        <p><strong>Condition:</strong> ${row[6]}</p>
        <p><strong>Quantity:</strong> ${row[7]}</p>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('tableContainer').innerHTML = html;
}

// 📋 Parse CSV text into rows
function parseCSV(text) {
  const lines = text.trim().split('\n');
  headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// 📦 Load CSV data and initialize the UI
fetch('pokemon-cards.csv')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load CSV file.');
    return response.text();
  })
  .then(csvText => {
    allCards = parseCSV(csvText);
    renderSetButtons();
    document.getElementById('tableContainer').innerHTML = '<p>Select a set above to view cards.</p>';
  })
  .catch(error => {
    console.error("CSV load error:", error);
    document.getElementById('tableContainer').innerHTML = `<p>Error loading data: ${error.message}</p>`;
  });
