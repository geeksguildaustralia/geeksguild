let allCards = [];
let headers = [];

// Parse CSV into rows
function parseCSV(text) {
  const lines = text.trim().split('\n');
  headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
}

// Render cards for a selected set
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

// Create buttons for each unique set
function renderSetButtons() {
  const container = document.getElementById('setButtons');
  if (!container) return;

  const sets = new Set(allCards.map(row => row[1]));
  const sortedSets = Array.from(sets).sort();

  sortedSets.forEach(setName => {
    const btn = document.createElement('button');
    btn.textContent = setName;
    btn.className = 'set-button';
    btn.addEventListener('click', () => {
      renderCardsForSet(setName);
    });
    container.appendChild(btn);
  });
}

// Load CSV and initialize
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
    document.getElementById('tableContainer').innerHTML = `<p>Error loading CSV: ${error.message}</p>`;
  });
