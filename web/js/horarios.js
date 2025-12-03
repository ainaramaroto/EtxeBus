const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

const statusEl = document.getElementById('schedule-status');
const gridEl = document.getElementById('schedule-grid');

function formatSlot(slot) {
  if (!slot) return '—';
  if (slot.start === '—') return '—';
  if (slot.end) return `${slot.start} → ${slot.end}`;
  return slot.start;
}

function buildTable(columns = []) {
  if (!columns.length) return null;
  const table = document.createElement('table');
  table.className = 'schedule-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((column) => {
    const th = document.createElement('th');
    th.textContent = column.label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const maxRows = Math.max(...columns.map((c) => c.items.length));
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex += 1) {
    const tr = document.createElement('tr');
    columns.forEach((column) => {
      const td = document.createElement('td');
      const slot = column.items[rowIndex];
      if (slot) {
        const text = formatSlot(slot);
        if (slot.highlight) {
          const strong = document.createElement('strong');
          strong.textContent = text;
          td.appendChild(strong);
        } else {
          td.textContent = text;
        }
        if (slot.note) {
          const small = document.createElement('small');
          small.textContent = slot.note;
          td.appendChild(document.createElement('br'));
          td.appendChild(small);
        }
      } else {
        td.textContent = '—';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

function createBlock(block) {
  const section = document.createElement('div');
  section.className = 'schedule-section';

  if (block.title) {
    const heading = document.createElement('h4');
    heading.textContent = block.title;
    section.appendChild(heading);
  }

  if (block.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'block-subtitle';
    subtitle.textContent = block.subtitle;
    section.appendChild(subtitle);
  }

  const table = buildTable(block.columns || []);
  if (table) section.appendChild(table);

  if (block.note) {
    const note = document.createElement('p');
    note.className = 'notes';
    note.textContent = block.note;
    section.appendChild(note);
  }

  return section;
}

function createCard(card) {
  const normalizedLine = (card.line_code || '').replace(/\W+/g, '').toLowerCase();
  const article = document.createElement('article');
  article.className = `schedule-card${normalizedLine ? ` linea${normalizedLine}` : ''}`;
  if (card.line_color) {
    article.style.setProperty('--line-color', card.line_color);
  }

  const badge = document.createElement('div');
  badge.className = 'badge';
  badge.textContent = card.line_badge || card.line_code;
  article.appendChild(badge);

  const heading = document.createElement('h3');
  heading.textContent = card.service_name;
  article.appendChild(heading);

  if (card.description) {
    const description = document.createElement('p');
    description.className = 'subtitle';
    description.textContent = card.description;
    article.appendChild(description);
  }

  (card.blocks || []).forEach((block) => {
    article.appendChild(createBlock(block));
  });

  return article;
}

function showStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle('error', Boolean(isError));
  statusEl.classList.toggle('is-hidden', !message);
}

function renderCards(cards) {
  if (!gridEl) return;
  gridEl.innerHTML = '';

  if (!cards.length) {
    showStatus('No hay horarios publicados por ahora.');
    return;
  }

  showStatus('', false);

  cards
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .forEach((card) => {
      gridEl.appendChild(createCard(card));
    });
}

async function loadHorarios() {
  showStatus('Cargando horarios...');
  try {
    const response = await fetch(`${API_BASE_URL}/horarios/publicados`);
    if (!response.ok) {
      throw new Error(`Error ${response.status} al cargar horarios`);
    }
    const payload = await response.json();
    renderCards(payload.data || []);
  } catch (error) {
    console.warn('No se pudieron cargar los horarios:', error);
    showStatus('No se pudieron cargar los horarios. Intenta de nuevo mas tarde.', true);
  }
}

document.addEventListener('DOMContentLoaded', loadHorarios);
