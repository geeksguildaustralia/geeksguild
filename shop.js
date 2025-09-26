let allCards = [];
let headers = [];

// Parse the CSV text
function parseCSV(text) {
  const lines = text.trim().split('\n');
  headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
  return rows;
}

// Render cards as HTML elements
function renderCards(rows) {
  const container = document.getElementById('tableContainer');

  if (!rows.length) {
    container.innerHTML = "<p>No cards found.</p>";
    return;
  }

  let html = '<div class="card-grid">';
  rows.forEach(row => {
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
  container.innerHTML = html;
}

// Populate dropdown with set names
function populateSetDropdown() {
  const setFilter = document.getElementById('setFilter');
  const sets = new Set(allCards.map(row => row[1]));
  const sortedSets = Array.from(sets).sort();

  sortedSets.forEach(setName => {
    const opt = document.createElement('option');
    opt.value = setName;
    opt.textContent = setName;
    setFilter.appendChild(opt);
  });

  // If the page has a data-set attribute (e.g. newest set), auto-select it
  const initialSet = document.body.dataset.set;
  if (initialSet) {
    setFilter.value = initialSet;
  }
}

// Apply current filter selections
function applyFilters() {
  const selectedSet = document.getElementById('setFilter')?.value;
  const selectedVariant = document.getElementById('variantFilter')?.value.toLowerCase();

  const filtered = allCards.filter(row => {
    const cardSet = row[1];
    const variance = row[4].toLowerCase();

    if (selectedSet && selectedSet !== 'all' && cardSet !== selectedSet) return false;

    if (selectedVariant === 'holo') {
      return variance.includes('holo');
    }

    if (selectedVariant === 'non-holo') {
      return !variance.includes('holo');
    }

    return true;
  });

  renderCards(filtered);
}

// Load CSV and initialize
fetch('pokemon-cards.csv')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load CSV file.');
    return response.text();
  })
  .then(csvText => {
    allCards = parseCSV(csvText);
    populateSetDropdown();
    renderCards(allCards);

    // Attach event listeners to filters
    const setDropdown = document.getElementById('setFilter');
    const variantDropdown = document.getElementById('variantFilter');

    if (setDropdown) setDropdown.addEventListener('change', applyFilters);
    if (variantDropdown) variantDropdown.addEventListener('change', applyFilters);

    // Auto-apply filter on load if body has data-set attribute
    if (document.body.dataset.set) {
      applyFilters();
    }
  })
  .catch(error => {
    document.getElementById('tableContainer').innerText = 'Error loading CSV: ' + error.message;
  });
