const CSV_FILE = 'birthdays.csv';

const monthNames = [
  '','Janvāris','Februāris','Marts','Aprīlis','Maijs','Jūnijs',
  'Jūlijs','Augusts','Septembris','Oktobris','Novembris','Decembris'
];

const params      = new URLSearchParams(window.location.search);
const targetMonth = params.get('month');
const targetDay   = params.get('day');

const statusEl  = document.getElementById('statusMsg');
const titleEl   = document.getElementById('pageTitle');
const gridEl    = document.getElementById('grid');

if (!targetMonth || !targetDay) {
  statusEl.className   = 'kaut kas nav pareizi';
  statusEl.textContent = 'Nav datums ievadīts.';
} else {
  titleEl.textContent = `${monthNames[parseInt(targetMonth)]} ${targetDay}. — slavenības ar šo dzimšanas dienu`;
  loadAndRender();
}

function parseCSVLine(line) {
  const cols = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (c === ',' && !inQ) {
      cols.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  cols.push(cur);
  return cols;
}

async function loadAndRender() {
  try {
    const response = await fetch(CSV_FILE);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text  = await response.text();
    const lines = text.trim().split('\n');

    // Detect column positions from header row
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    const idx = {
      lastname:   headers.indexOf('lastname'),
      firstname:  headers.indexOf('firstname'),
      birthMonth: headers.indexOf('birthMonth'),
      birthDay:   headers.indexOf('birthDay'),
      birthDate:  headers.indexOf('birthDate'),
    };

    const matches = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols  = parseCSVLine(lines[i]);
      const month = cols[idx.birthMonth];
      const day   = cols[idx.birthDay];
      if (month !== targetMonth || day !== targetDay) continue;
      const dateStr = cols[idx.birthDate] || '';
      matches.push({
        lastname:  cols[idx.lastname]  || '',
        firstname: cols[idx.firstname] || '',
        year:      dateStr.length >= 4 ? dateStr.substring(0, 4) : '',
      });
    }

    if (matches.length === 0) {
      statusEl.textContent = 'Nav atrasta neviena slavenība ar šo dzimšanas datumu.';
      return;
    }

    statusEl.textContent =
      `Atrast${matches.length === 1 ? 'a' : 'as'} ${matches.length} ` +
      `slavenīb${matches.length === 1 ? 'a' : 'as'}:`;

    renderCards(matches);

  } catch (err) {
    statusEl.className   = 'nav';
    statusEl.textContent =
      `datubaze neiet "${CSV_FILE}". ` +
      `pārbaudi, ka fails atrodas tajā pašā mapē kā HTML faili. ` +
      `(${err.message})`;
  }
}

// ── Helpers ───────────────────────────────────────────────
function fullName(first, last) {
  return (!first || first === 'NA') ? last : `${first} ${last}`;
}

function initials(first, last) {
  const f = first && first !== 'NA' ? first[0] : '';
  return (f + (last ? last[0] : '')).toUpperCase() || '?';
}

// ── Wikipedia image fetch ─────────────────────────────────
async function fetchWikiImage(name) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(name)}&prop=pageimages` +
      `&format=json&pithumbsize=300&origin=*`;
    const res  = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    return page.thumbnail ? page.thumbnail.source : null;
  } catch {
    return null;
  }
}

// ── Render ────────────────────────────────────────────────
function renderCards(matches) {
  gridEl.innerHTML = '';

  matches.forEach(c => {
    const name  = fullName(c.firstname, c.lastname);
    const meta  = [c.year ].filter(Boolean).join(' · ');
    const inits = initials(c.firstname, c.lastname);
    const key   = name.replace(/\s/g, '_');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="photo-wrap" id="pw-${key}">
        <div class="avatar-fallback">${inits}</div>
      </div>
      <div class="card-body">
        <div class="name">${name}</div>
        <div class="meta">${meta}</div>
      </div>`;
    gridEl.appendChild(card);

    // Swap in Wikipedia photo when it arrives
    const photoWrap = card.querySelector('.photo-wrap');
    fetchWikiImage(name).then(src => {
      if (!src) return;
      const img = document.createElement('img');
      img.alt    = name;
      img.src    = src;
      img.onerror = () => img.remove();
      photoWrap.innerHTML = '';
      photoWrap.appendChild(img);
    });
  });
}
