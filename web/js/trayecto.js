const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

const LINE_META = {
  1: { code: 'L1', label: 'Linea 1 - Metro -> Santa Marina' },
  2: { code: 'L1', label: 'Linea 1 - Santa Marina -> Metro' },
  3: { code: 'L2', label: 'Linea 2 - Labur' },
  4: { code: 'L2', label: 'Linea 2 - Luze' },
};

const LINE_DEFAULT_STOP = {
  1: 1,
  2: 10,
  3: 18,
  4: 28,
};

const STOP_CATALOG = [
  { id: 1, lineId: 1, name: 'L1 Metro Etxebarri', order: 1 },
  { id: 2, lineId: 1, name: 'L1 Metacal Kalea', order: 2 },
  { id: 3, lineId: 1, name: 'L1 Doneztebe Eliza', order: 3 },
  { id: 4, lineId: 1, name: 'L1 San Antonio Hiribidea', order: 4 },
  { id: 5, lineId: 1, name: 'L1 Kukullaga Ikastetxea', order: 5 },
  { id: 6, lineId: 1, name: 'L1 Kiroldegia', order: 6 },
  { id: 7, lineId: 1, name: 'L1 Galicia Kalea', order: 7 },
  { id: 8, lineId: 1, name: 'L1 Galicia Kalea 2', order: 8 },
  { id: 9, lineId: 1, name: 'L1 Santa Marina', order: 9 },
  { id: 10, lineId: 2, name: 'L1 Santa Marina', order: 1 },
  { id: 11, lineId: 2, name: 'L1 IES Etxebarri BHI', order: 2 },
  { id: 12, lineId: 2, name: 'L1 Goiko San Antonio Hiribidea', order: 3 },
  { id: 13, lineId: 2, name: 'L1 Kukullaga Ikastetxea', order: 4 },
  { id: 14, lineId: 2, name: 'L1 Beheko San Antonio Hiribidea', order: 5 },
  { id: 15, lineId: 2, name: 'L1 Doneztebe Eliza', order: 6 },
  { id: 16, lineId: 2, name: 'L1 Metacal Kalea', order: 7 },
  { id: 17, lineId: 2, name: 'L1 Metro Etxebarri', order: 8 },
  { id: 18, lineId: 3, name: 'L2 Metro Etxebarri', order: 1 },
  { id: 19, lineId: 3, name: 'L2 Fuenlabrada Kalea', order: 2 },
  { id: 20, lineId: 3, name: 'L2 Lezama Legizamon', order: 3 },
  { id: 21, lineId: 3, name: 'L2 Tomas Meabe', order: 4 },
  { id: 22, lineId: 3, name: 'L2 Zubialdea (El Boquete)', order: 5 },
  { id: 23, lineId: 3, name: 'L2 Zubialdea (El Boquete)', order: 6 },
  { id: 24, lineId: 3, name: 'L2 Tomas Meabe', order: 7 },
  { id: 25, lineId: 3, name: 'L2 Lezama Legizamon', order: 8 },
  { id: 26, lineId: 3, name: 'L2 Fuenlabrada Kalea', order: 9 },
  { id: 27, lineId: 3, name: 'L2 Metro Etxebarri', order: 10 },
  { id: 28, lineId: 4, name: 'L2 Metro Etxebarri', order: 1 },
  { id: 29, lineId: 4, name: 'L2 Fuenlabrada Kalea', order: 2 },
  { id: 30, lineId: 4, name: 'L2 Errota/Molino', order: 3 },
  { id: 31, lineId: 4, name: 'L2 Zuberoa Kalea', order: 4 },
  { id: 32, lineId: 4, name: 'L2 Lezama Legizamon', order: 5 },
  { id: 33, lineId: 4, name: 'L2 Tomas Meabe', order: 6 },
  { id: 34, lineId: 4, name: 'L2 Zubialdea (El Boquete)', order: 7 },
  { id: 35, lineId: 4, name: 'L2 Zubialdea (El Boquete)', order: 8 },
  { id: 36, lineId: 4, name: 'L2 Tomas Meabe', order: 9 },
  { id: 37, lineId: 4, name: 'L2 Lezama Legizamon', order: 10 },
  { id: 38, lineId: 4, name: 'L2 Fuenlabrada Kalea', order: 11 },
  { id: 39, lineId: 4, name: 'L2 Metro Etxebarri', order: 12 },
];

const STOP_MAP = new Map(STOP_CATALOG.map((stop) => [stop.id, stop]));
const scheduleMap = new Map();
const LINE_GROUP = { 1: 'L1', 2: 'L1', 3: 'L2', 4: 'L2' };
const LINE_TRAVEL_PROFILE = {
  1: { totalMinutes: 10 },
  2: { totalMinutes: 10 },
  3: { totalMinutes: 5 },
  4: { totalMinutes: 10 },
};
const DEPARTURE_LABELS = {
  1: 'Salida desde Metro Etxebarri',
  2: 'Salida desde Santa Marina',
  3: 'Salida desde Metro Etxebarri (Labur)',
  4: 'Salida desde Metro Etxebarri (Luze)',
};
const STOP_CHOICES = buildStopChoices();
const STOP_CHOICE_MAP = new Map(STOP_CHOICES.map((choice) => [choice.slug, choice]));
const LINE_STOP_SPAN = buildLineSpan();

const originInput = document.getElementById('origin-input');
const originOptions = document.getElementById('origin-options');
const destinationInput = document.getElementById('destination-input');
const destinationOptions = document.getElementById('destination-options');
const whenSelect = document.getElementById('when-select');
const timeWrapper = document.getElementById('time-wrapper');
const timeInput = document.getElementById('time-input');
const timePicker = document.getElementById('time-picker');
const hourDisplay = document.getElementById('hour-display');
const minuteDisplay = document.getElementById('minute-display');
const plannerForm = document.getElementById('planner-form');
const resultsPanel = document.getElementById('results-panel');
const swapButton = document.getElementById('swap-button');

document.addEventListener('DOMContentLoaded', initPlanner);

async function initPlanner() {
  populateStopOptions(originInput, originOptions);
  populateStopOptions(destinationInput, destinationOptions);
  timeInput.value = formatTimeInput(new Date());
  syncTimeDisplays();
  originInput.addEventListener('input', handleOriginInput);
  originInput.addEventListener('change', handleOriginInput);
  originInput.addEventListener('focus', handleComboFocus);
  originInput.addEventListener('blur', handleComboBlur);
  destinationInput.addEventListener('input', handleDestinationInput);
  destinationInput.addEventListener('change', handleDestinationInput);
  destinationInput.addEventListener('focus', handleComboFocus);
  destinationInput.addEventListener('blur', handleComboBlur);
  whenSelect.addEventListener('change', handleWhenChange);
  plannerForm.addEventListener('submit', handleFormSubmit);
  swapButton.addEventListener('click', swapStops);
  if (timePicker) {
    timePicker.addEventListener('click', handleTimePickerClick);
  }
  timeInput.addEventListener('input', syncTimeDisplays);
  updateDestinationOptions();
  updateOriginOptions();
  await loadSchedules();
}

function formatStopLabel(stop) {
  const meta = LINE_META[stop.lineId];
  const cleaned = stop.name.replace(/^L\d\s*/i, '').trim();
  return meta ? `${meta.code} ${cleaned}` : stop.name;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildStopChoices() {
  const map = new Map();
  STOP_CATALOG.forEach((stop) => {
    const group = LINE_GROUP[stop.lineId] || `L${stop.lineId}`;
    const key = `${group}-${stop.name}`;
    if (!map.has(key)) {
      map.set(key, {
        slug: slugify(key),
        label: formatStopLabel(stop),
        group,
        options: [],
      });
    }
    map.get(key).options.push(stop);
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function populateStopOptions(inputEl, datalistEl, allowedLines = null, excludeSlug = null) {
  datalistEl.innerHTML = '';
  STOP_CHOICES.forEach((choice) => {
    if (excludeSlug && choice.slug === excludeSlug) return;
    if (allowedLines && !choice.options.some((stop) => allowedLines.has(stop.lineId))) return;
    const option = document.createElement('option');
    option.value = choice.label;
    option.dataset.choiceSlug = choice.slug;
    datalistEl.appendChild(option);
  });
}

function handleOriginInput() {
  syncInputSelection(originInput, originOptions);
  updateDestinationOptions();
}

function handleDestinationInput() {
  syncInputSelection(destinationInput, destinationOptions);
  updateOriginOptions();
}

function handleComboFocus(event) {
  event.target.select();
}

function handleComboBlur(event) {
  const input = event.target;
  if (input.dataset.choiceSlug) {
    const choice = STOP_CHOICE_MAP.get(input.dataset.choiceSlug);
    input.value = choice ? choice.label : '';
  } else {
    input.value = '';
  }
}

function syncInputSelection(inputEl, datalistEl) {
  const value = inputEl.value.trim();
  if (!value) {
    delete inputEl.dataset.choiceSlug;
    return;
  }
  const match = Array.from(datalistEl.options).find(
    (option) => option.value.toLowerCase() === value.toLowerCase(),
  );
  if (match) {
    inputEl.value = match.value;
    inputEl.dataset.choiceSlug = match.dataset.choiceSlug;
  } else {
    delete inputEl.dataset.choiceSlug;
  }
}

function getSelectedChoice(inputEl) {
  const slug = inputEl.dataset.choiceSlug;
  if (!slug) return null;
  return STOP_CHOICE_MAP.get(slug) || null;
}

function updateDestinationOptions() {
  const originChoice = getSelectedChoice(originInput);
  const allowed = getAllowedLineSet(originChoice);
  populateStopOptions(destinationInput, destinationOptions, allowed, originChoice?.slug || null);
  ensureChoiceAvailability(destinationInput, destinationOptions);
}

function updateOriginOptions() {
  const destinationChoice = getSelectedChoice(destinationInput);
  const allowed = getAllowedLineSet(destinationChoice);
  populateStopOptions(originInput, originOptions, allowed, destinationChoice?.slug || null);
  ensureChoiceAvailability(originInput, originOptions);
}

function getAllowedLineSet(choice) {
  if (!choice) return null;
  const ids = new Set(choice.options.map((stop) => stop.lineId));
  return ids.size ? ids : null;
}

function ensureChoiceAvailability(inputEl, datalistEl) {
  const slug = inputEl.dataset.choiceSlug;
  if (!slug) return;
  const exists = Array.from(datalistEl.options).some((option) => option.dataset.choiceSlug === slug);
  if (!exists) {
    delete inputEl.dataset.choiceSlug;
    inputEl.value = '';
  }
}

async function loadSchedules(force = false) {
  if (!force && scheduleMap.size) return;
  showStatus('Cargando horarios actualizados...');
  try {
    const response = await fetch(`${API_BASE_URL}/horarios`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const payload = await response.json();
    const rows = payload.data || [];
    scheduleMap.clear();
    rows.forEach((row) => {
      const key = `${row.idParada}-${row.tipoDia}`;
      scheduleMap.set(key, row.horas || []);
    });
    showEmptyState();
  } catch (error) {
    console.warn('No se pudieron cargar los horarios:', error);
    showStatus('No se pudieron cargar los horarios oficiales.', true);
  }
}

function handleWhenChange() {
  const planning = whenSelect.value === 'plan';
  timeWrapper.hidden = !planning;
  timeInput.required = planning;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const originChoice = getSelectedChoice(originInput);
  const destinationChoice = getSelectedChoice(destinationInput);

  if (!originChoice || !destinationChoice) {
    showStatus('Selecciona parada de origen y destino.', true);
    return;
  }

  const trip = resolveTripStops(originChoice, destinationChoice);
  if (!trip) {
    showStatus('Las paradas seleccionadas pertenecen a lineas distintas.', true);
    return;
  }

  const baseTime = new Date();
  if (whenSelect.value === 'plan') {
    if (!timeInput.value) {
      showStatus('Selecciona la hora estimada del viaje.', true);
      return;
    }
    const [hour, minute] = timeInput.value.split(':').map(Number);
    baseTime.setHours(hour);
    baseTime.setMinutes(minute);
    baseTime.setSeconds(0);
    baseTime.setMilliseconds(0);
  }

  const schedule = pickSchedule(trip.origin.id, baseTime, trip.origin.lineId);
  if (!schedule) {
    showStatus('No hay horarios asociados a la parada seleccionada.', true);
    return;
  }

  const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
  const upcoming = getNextDepartures(schedule.horas, baseMinutes);
  if (!upcoming.length) {
    showStatus('No quedan salidas publicadas para la hora indicada.', true);
    return;
  }

  const nextDeparture = upcoming[0];
  const diffMinutes = Math.max(toMinutes(nextDeparture) - baseMinutes, 0);
  const travelMinutes = estimateTravelMinutes(trip.origin, trip.destination);
  renderResult({
    origin: trip.origin,
    destination: trip.destination,
    line: LINE_META[trip.origin.lineId],
    nextDeparture,
    diffMinutes,
    travelMinutes,
    upcoming: upcoming.slice(1),
    scheduleType: schedule.tipoDia,
    referenceTime: baseTime,
  });
}

function resolveTripStops(originChoice, destinationChoice) {
  let best = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  originChoice.options.forEach((originStop) => {
    destinationChoice.options.forEach((destStop) => {
      if (originStop.lineId === destStop.lineId && originStop.id !== destStop.id) {
        const diff = Math.abs((originStop.order || 0) - (destStop.order || 0));
        if (diff && diff < bestDiff) {
          best = { origin: originStop, destination: destStop };
          bestDiff = diff;
        }
      }
    });
  });
  return best;
}

function swapStops() {
  const originSlug = originInput.dataset.choiceSlug || '';
  const destinationSlug = destinationInput.dataset.choiceSlug || '';
  setInputChoice(originInput, originOptions, destinationSlug);
  setInputChoice(destinationInput, destinationOptions, originSlug);
  handleOriginInput();
  handleDestinationInput();
}

function setInputChoice(inputEl, datalistEl, slug) {
  if (!slug) {
    delete inputEl.dataset.choiceSlug;
    inputEl.value = '';
    return;
  }
  const choice = STOP_CHOICE_MAP.get(slug);
  if (!choice) {
    delete inputEl.dataset.choiceSlug;
    inputEl.value = '';
    return;
  }
  inputEl.value = choice.label;
  inputEl.dataset.choiceSlug = slug;
}

function pickSchedule(stopId, referenceDate, lineId) {
  const dayType = getDayType(referenceDate);
  const fallback =
    dayType === 'LECTIVO'
      ? ['LECTIVO', 'NO_LECTIVO', 'FESTIVO']
      : ['FESTIVO', 'LECTIVO', 'NO_LECTIVO'];

  for (const tipo of fallback) {
    const key = `${stopId}-${tipo}`;
    if (scheduleMap.has(key)) {
      return { tipoDia: tipo, horas: scheduleMap.get(key) };
    }
  }

  if (lineId && LINE_DEFAULT_STOP[lineId] && LINE_DEFAULT_STOP[lineId] !== stopId) {
    const defaultKey = LINE_DEFAULT_STOP[lineId];
    for (const tipo of fallback) {
      const key = `${defaultKey}-${tipo}`;
      if (scheduleMap.has(key)) {
        return { tipoDia: tipo, horas: scheduleMap.get(key) };
      }
    }
  }
  return null;
}

function getDayType(date) {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'FESTIVO' : 'LECTIVO';
}

function getNextDepartures(hours = [], baseMinutes, amount = 3) {
  const sorted = hours
    .map((timeStr) => toMinutes(timeStr))
    .filter((minutes) => !Number.isNaN(minutes))
    .sort((a, b) => a - b);
  const upcoming = sorted.filter((minutes) => minutes >= baseMinutes);
  return upcoming.slice(0, amount).map(formatMinutes);
}

function toMinutes(timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return Number.NaN;
  }
  return hour * 60 + minute;
}

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTimeInput(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function handleTimePickerClick(event) {
  const button = event.target.closest('.time-step');
  if (!button) return;
  const unit = button.dataset.unit;
  const step = Number(button.dataset.step) || 1;
  adjustTime(unit, step);
}

function adjustTime(unit, step) {
  if (!timeInput.value) {
    timeInput.value = '08:00';
  }
  let [hour, minute] = timeInput.value.split(':').map(Number);
  if (Number.isNaN(hour)) hour = 0;
  if (Number.isNaN(minute)) minute = 0;
  let totalMinutes = hour * 60 + minute;
  const delta = unit === 'hour' ? step * 60 : step;
  totalMinutes = (totalMinutes + delta + 1440) % 1440;
  hour = Math.floor(totalMinutes / 60);
  minute = totalMinutes % 60;
  timeInput.value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  syncTimeDisplays();
}

function syncTimeDisplays() {
  if (!hourDisplay || !minuteDisplay) return;
  if (!timeInput.value) {
    hourDisplay.textContent = '00';
    minuteDisplay.textContent = '00';
    return;
  }
  const [hour, minute] = timeInput.value.split(':').map(Number);
  hourDisplay.textContent = String(Number.isNaN(hour) ? 0 : hour).padStart(2, '0');
  minuteDisplay.textContent = String(Number.isNaN(minute) ? 0 : minute).padStart(2, '0');
}

function estimateTravelMinutes(origin, destination) {
  if (!origin || !destination || origin.lineId !== destination.lineId) {
    return 0;
  }
  const profile = LINE_TRAVEL_PROFILE[origin.lineId];
  const span = LINE_STOP_SPAN.get(origin.lineId);
  if (profile && span) {
    const totalSteps = Math.max(span.max - span.min, 1);
    const orderDiff = Math.abs((origin.order || span.min) - (destination.order || span.min));
    const ratio = orderDiff / totalSteps;
    const estimate = Math.round(profile.totalMinutes * ratio);
    return Math.max(1, estimate);
  }
  const difference = Math.abs((origin.order || 1) - (destination.order || 1));
  return Math.max(6, difference * 3);
}

function getDepartureLabel(lineId) {
  return DEPARTURE_LABELS[lineId] || 'Salida desde la parada seleccionada';
}

function renderResult({
  origin,
  destination,
  line,
  nextDeparture,
  diffMinutes,
  travelMinutes,
  upcoming,
  scheduleType,
  referenceTime,
}) {
  const countdownLabel = diffMinutes <= 0 ? 'Listo para salir' : `${diffMinutes} min`;
  const departureLabel = getDepartureLabel(origin.lineId);
  const upcomingList = upcoming.length
    ? `<div><p class="muted-label">Siguientes servicios</p><ul class="timeline">${upcoming
        .map((time) => `<li>${time}</li>`)
        .join('')}</ul></div>`
    : '<p class="muted-label">No hay mas salidas cercanas.</p>';
  const routeTimeline = buildRouteTimeline(origin, destination);

  resultsPanel.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <p>Origen</p>
          <strong>${origin.name}</strong>
        </div>
        <div>
          <p>Destino</p>
          <strong>${destination.name}</strong>
        </div>
        <div class="line-chip">
          <span>${line?.code || `L${origin.lineId}`}</span>
          <small>${scheduleType}</small>
        </div>
      </div>
      <div class="next-trip">
        <div class="countdown">
          <p>Siguiente salida</p>
          <h3>${nextDeparture}</h3>
          ${departureLabel ? `<p class="departure-label">${departureLabel}</p>` : ''}
          <small>${countdownLabel}</small>
        </div>
        ${upcomingList}
      </div>
      <div class="result-meta">
        <div>
          <p>Duracion estimada</p>
          <span>${travelMinutes} min</span>
        </div>
        <div>
          <p>Consulta realizada</p>
          <span>${formatMinutes(referenceTime.getHours() * 60 + referenceTime.getMinutes())}  ${
    whenSelect.value === 'now' ? 'Viajar ahora' : 'Hora planificada'
  }</span>
        </div>
      </div>
      ${routeTimeline}
    </div>
  `;
}

function showStatus(message, isError = false) {
  resultsPanel.innerHTML = `<div class="${isError ? 'error-message' : 'loading'}">${message}</div>`;
}

function showEmptyState() {
  resultsPanel.innerHTML = `
    <div class="empty-state">
      <h3>Configura tu viaje</h3>
      <p>Selecciona parada de origen y destino para ver los proximos servicios disponibles.</p>
    </div>
  `;
}

function buildRouteTimeline(origin, destination) {
  if (!origin || !destination || origin.lineId !== destination.lineId) {
    return '';
  }
  const sortedStops = STOP_CATALOG.filter((stop) => stop.lineId === origin.lineId).sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );
  const startOrder = Math.min(origin.order || 0, destination.order || 0);
  const endOrder = Math.max(origin.order || 0, destination.order || 0);
  let segment = sortedStops.filter((stop) => stop.order >= startOrder && stop.order <= endOrder);
  const forward = (destination.order || 0) >= (origin.order || 0);
  if (!forward) {
    segment = [...segment].reverse();
  }
  if (!segment.length) {
    return '';
  }
  const items = segment
    .map((stop) => {
      const classes = [];
      if (stop.id === origin.id) classes.push('is-origin');
      if (stop.id === destination.id) classes.push('is-destination');
      const classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';
      return `<li${classAttr}><span>${formatStopLabel(stop)}</span></li>`;
    })
    .join('');
  return `
    <div class="route-timeline">
      <p class="muted-label">Paradas del trayecto</p>
      <ul class="stop-timeline">${items}</ul>
    </div>
  `;
}

function buildLineSpan() {
  const span = new Map();
  STOP_CATALOG.forEach((stop) => {
    const info = span.get(stop.lineId) || { min: stop.order || 0, max: stop.order || 0, count: 0 };
    info.min = Math.min(info.min, stop.order || 0);
    info.max = Math.max(info.max, stop.order || 0);
    info.count += 1;
    span.set(stop.lineId, info);
  });
  return span;
}
