const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

const statusEl = document.getElementById('schedule-status');
const gridEl = document.getElementById('schedule-grid');

function formatSlot(slot) {
  if (!slot) return '—';
  if (slot.start === '—') return '—';
  if (slot.end) return `${slot.start} → ${slot.end}`;
  return slot.start;
}

function normalizeLabel(text = '') {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function classifyBlock(block = {}) {
  const descriptor = normalizeLabel(`${block.title || ''} ${block.subtitle || ''}`);
  if (/(festiv|fin\s*de\s*sem|finde|weekend)/.test(descriptor)) {
    return 'weekend';
  }
  if (/(labor|labur|lectiv)/.test(descriptor)) {
    return 'workdays';
  }
  return 'other';
}

function groupBlocks(blocks = []) {
  return blocks.reduce(
    (acc, block) => {
      const bucket = classifyBlock(block);
      acc[bucket].push(block);
      return acc;
    },
    { workdays: [], weekend: [], other: [] }
  );
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

  if (block.title || block.subtitle) {
    const header = document.createElement('div');
    header.className = 'section-header';

    if (block.title) {
      const heading = document.createElement('h4');
      heading.textContent = block.title;
      header.appendChild(heading);
    }

    if (block.subtitle) {
      const subtitle = document.createElement('span');
      subtitle.className = 'block-subtitle';
      subtitle.textContent = block.subtitle;
      header.appendChild(subtitle);
    }

    section.appendChild(header);
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
  const baseLabel = card.line_badge || card.line_code || '';
  badge.textContent = card.service_name ? `${baseLabel} - ${card.service_name}` : baseLabel;
  article.appendChild(badge);

  if (card.description) {
    const description = document.createElement('p');
    description.className = 'subtitle';
    description.textContent = card.description;
    article.appendChild(description);
  }

  const blocks = Array.isArray(card.blocks) ? card.blocks : [];
  const grouped = groupBlocks(blocks);
  if (grouped.other.length) {
    grouped.weekend.push(...grouped.other);
    grouped.other = [];
  }

  const toggleOptions = [
    { key: 'workdays', label: 'Laborales' },
    { key: 'weekend', label: 'Festivos' },
  ];

  const preferredOrder = ['workdays', 'weekend'];
  let activeKey = preferredOrder.find((key) => grouped[key].length) || toggleOptions[0].key;

  const toggle = document.createElement('div');
  toggle.className = 'schedule-toggle';
  const buttons = [];

  toggleOptions.forEach(({ key, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.key = key;
    if (key === activeKey) button.classList.add('is-active');
    button.addEventListener('click', () => {
      if (activeKey === key) return;
      activeKey = key;
      buttons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.key === activeKey);
      });
      renderActiveGroup();
    });
    buttons.push(button);
    toggle.appendChild(button);
  });

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'blocks-container';

  article.appendChild(toggle);
  article.appendChild(contentWrapper);

  function renderActiveGroup() {
    const list = grouped[activeKey] || [];
    contentWrapper.innerHTML = '';

    if (!list.length) {
      const empty = document.createElement('p');
      empty.className = 'notes';
      empty.textContent =
        activeKey === 'weekend'
          ? 'No hay horarios publicados para festivos o fines de semana.'
          : 'No hay horarios publicados para dias laborables.';
      contentWrapper.appendChild(empty);
      return;
    }

    list.forEach((block) => {
      contentWrapper.appendChild(createBlock(block));
    });
  }

  renderActiveGroup();

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
