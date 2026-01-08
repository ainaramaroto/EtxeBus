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
const LINE_DEPARTURE_LABELS = {
  1: 'Salida desde Metro Etxebarri',
  2: 'Salida desde Santa Marina',
  3: 'Salida desde Metro Etxebarri (Labur)',
  4: 'Salida desde Metro Etxebarri (Luze)',
};
const STOP_CHOICES = buildStopChoices();
const STOP_CHOICE_MAP = new Map(STOP_CHOICES.map((choice) => [choice.slug, choice]));
const STOP_ID_TO_SLUG = buildStopIdSlugMap(STOP_CHOICES);
const LINE_STOP_SPAN = buildLineSpan();
const LINE_STEP_MINUTES = buildLineStepMinutes(LINE_STOP_SPAN);
const GROUP_DEPARTURE_LABELS = {
  L1: {
    forward: 'Salida desde Metro Etxebarri',
    reverse: 'Salida desde Santa Marina',
  },
  L2: {
    forward: 'Salida desde Metro Etxebarri',
    reverse: 'Salida desde Santa Marina',
  },
};
const GROUP_CANONICAL_PATHS = {
  L1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  L2: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
};
const MERGE_STOP_SLUGS = new Set(['l1-l1-santa-marina']);
const GROUP_CANONICAL_INDEX = buildCanonicalIndexMap();
const SESSION_STORAGE_KEY = 'etxebusSession';
let favoriteTrips = [];
let isAuthenticated = isUserLoggedIn();

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
const favoriteButton = document.getElementById('favorite-button');
const favoritesPanel = document.getElementById('favorites-panel');
const favoritesListEl = document.getElementById('favorites-list');
const favoritesCloseButton = document.getElementById('favorites-close');
const headerFavoritesButton = document.getElementById('header-favorites-button');

document.addEventListener('DOMContentLoaded', initPlanner);

async function initPlanner() {
  setupAuthTracking();
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
  if (favoriteButton) {
    favoriteButton.addEventListener('click', handleFavoriteClick);
  }
  if (favoritesCloseButton) {
    favoritesCloseButton.addEventListener('click', () => toggleFavoritesPanel(false));
  }
  if (favoritesListEl) {
    favoritesListEl.addEventListener('click', handleFavoritesListClick);
  }
  if (headerFavoritesButton) {
    headerFavoritesButton.addEventListener('click', () => toggleFavoritesPanel());
  }
  updateDestinationOptions();
  updateOriginOptions();
  updateFavoriteControl();
  await refreshFavorites();
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

function setupAuthTracking() {
  if (window.EtxebusSession && typeof window.EtxebusSession.subscribe === 'function') {
    window.EtxebusSession.subscribe(({ loggedIn }) => {
      isAuthenticated = Boolean(loggedIn);
      if (!isAuthenticated) {
        favoriteTrips = [];
        renderFavoritePanel();
        if (favoritesPanel) {
          favoritesPanel.setAttribute('hidden', '');
        }
      }
      updateFavoriteControl();
      refreshFavorites();
    });
  } else {
    isAuthenticated = isUserLoggedIn();
  }
}

function handleOriginInput() {
  syncInputSelection(originInput);
  updateDestinationOptions();
  updateFavoriteControl();
}

function handleDestinationInput() {
  syncInputSelection(destinationInput);
  updateOriginOptions();
  updateFavoriteControl();
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

function syncInputSelection(inputEl) {
  const value = inputEl.value.trim();
  if (!value) {
    delete inputEl.dataset.choiceSlug;
    return;
  }
  const match = STOP_CHOICES.find((choice) => choice.label.toLowerCase() === value.toLowerCase());
  if (match) {
    inputEl.value = match.label;
    inputEl.dataset.choiceSlug = match.slug;
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

async function refreshFavorites() {
  if (!isAuthenticated) {
    favoriteTrips = [];
    renderFavoritePanel();
    updateFavoriteControl();
    return;
  }
  const credentials = getCurrentUserCredentials();
  if (!credentials || !credentials.usuario || !credentials.contrasenia) {
    favoriteTrips = [];
    renderFavoritePanel();
    updateFavoriteControl();
    return;
  }
  try {
    const params = new URLSearchParams({
      usuario: credentials.usuario,
      contrasenia: credentials.contrasenia,
    });
    const response = await fetch(`${API_BASE_URL}/favoritos?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    favoriteTrips = payload.data || [];
  } catch (error) {
    console.warn('No se pudieron cargar los favoritos:', error);
  }
  renderFavoritePanel();
  updateFavoriteControl();
}

function toggleFavoritesPanel(force) {
  if (!favoritesPanel) return;
  const shouldShow = typeof force === 'boolean' ? force : favoritesPanel.hasAttribute('hidden');
  if (!isAuthenticated) {
    favoritesPanel.setAttribute('hidden', '');
    showStatus('Inicia sesion para consultar tus favoritos.', true);
    return;
  }
  if (shouldShow) {
    favoritesPanel.removeAttribute('hidden');
    refreshFavorites();
  } else {
    favoritesPanel.setAttribute('hidden', '');
  }
}

async function handleFavoritesListClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const favoriteId = button.dataset.favoriteId;
  const originSlug = button.dataset.origin;
  const destinationSlug = button.dataset.destination;
  if (action === 'apply') {
    applyFavoriteToPlanner(originSlug, destinationSlug);
    toggleFavoritesPanel(false);
    executePlannerQuery('favorite');
    return;
  }
  if (action === 'remove') {
    const credentials = getCurrentUserCredentials();
    if (!credentials) return;
    try {
      await removeFavorite(favoriteId, credentials);
      await refreshFavorites();
    } catch (error) {
      console.warn('No se pudo eliminar el favorito', error);
      showStatus('No se pudo eliminar el favorito seleccionado.', true);
    }
  }
}

function applyFavoriteToPlanner(originSlug, destinationSlug) {
  if (!originSlug || !destinationSlug) return;
  setInputChoice(originInput, originOptions, originSlug);
  handleOriginInput();
  setInputChoice(destinationInput, destinationOptions, destinationSlug);
  handleDestinationInput();
}
async function handleFavoriteClick() {
  if (!favoriteButton || favoriteButton.disabled) return;
  const originChoice = getSelectedChoice(originInput);
  const destinationChoice = getSelectedChoice(destinationInput);
  const credentials = getCurrentUserCredentials();
  if (!originChoice || !destinationChoice || !credentials) {
    showStatus('Debes iniciar sesion para guardar favoritos.', true);
    return;
  }
  const existing = findFavoriteBySlugs(originChoice.slug, destinationChoice.slug);
  try {
    if (existing) {
      await removeFavorite(existing.idFavorito, credentials);
    } else {
      await saveFavorite({
        usuario: credentials.usuario,
        contrasenia: credentials.contrasenia,
        origin_slug: originChoice.slug,
        destination_slug: destinationChoice.slug,
        origin_label: originChoice.label,
        destination_label: destinationChoice.label,
      });
    }
    await refreshFavorites();
  } catch (error) {
    console.warn('No se pudo actualizar el favorito', error);
    showStatus('No se pudo actualizar el favorito seleccionado.', true);
  }
}

function updateFavoriteControl() {
  if (!favoriteButton) return;
  favoriteButton.hidden = !isAuthenticated;
  if (!isAuthenticated) {
    favoriteButton.classList.remove('is-active');
    favoriteButton.disabled = true;
    favoriteButton.setAttribute('aria-pressed', 'false');
    favoriteButton.title = 'Inicia sesion para guardar favoritos';
    return;
  }
  const originChoice = getSelectedChoice(originInput);
  const destinationChoice = getSelectedChoice(destinationInput);
  const credentials = getCurrentUserCredentials();
  const canUseFavorite = Boolean(isAuthenticated && originChoice && destinationChoice && credentials);
  favoriteButton.disabled = !canUseFavorite;
  const isActive = canUseFavorite
    ? Boolean(findFavoriteBySlugs(originChoice.slug, destinationChoice.slug))
    : false;
  favoriteButton.classList.toggle('is-active', isActive);
  favoriteButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  favoriteButton.title = isActive ? 'Eliminar de favoritos' : 'Guardar trayecto en favoritos';
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
  executePlannerQuery('form');
}

function executePlannerQuery(triggerSource = 'manual') {
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
  const scheduleStopId = schedule.stopId || trip.origin.id;

  const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
  const { upcoming: upcomingTimes, sortedMinutes } = getNextDepartures(schedule.horas, baseMinutes);
  if (!upcomingTimes.length) {
    if (sortedMinutes.length) {
      renderNoTripsMessage(sortedMinutes[0]);
    } else {
      showStatus('No quedan salidas publicadas para la hora indicada.', true);
    }
    return;
  }

  const nextDeparture = upcomingTimes[0];
  const diffMinutes = Math.max(toMinutes(nextDeparture) - baseMinutes, 0);
  const travelMinutes = estimateTravelMinutes(trip);
  const waitMinutes = diffMinutes + calculateDepartureOffset(trip, scheduleStopId);
  renderResult({
    origin: trip.origin,
    destination: trip.destination,
    line: LINE_META[trip.origin.lineId],
    nextDeparture,
    diffMinutes,
    travelMinutes,
    waitMinutes,
    upcoming: upcomingTimes.slice(1),
    scheduleType: schedule.tipoDia,
    referenceTime: baseTime,
    pathIds: trip.pathIds,
    direction: trip.direction,
    group: trip.group,
    scheduleStopId,
  });
}

function resolveTripStops(originChoice, destinationChoice) {
  if (!originChoice || !destinationChoice) {
    return null;
  }
  if (originChoice.group === destinationChoice.group) {
    const group = originChoice.group;
    const canonicalPath = GROUP_CANONICAL_PATHS[group];
    const indexMap = GROUP_CANONICAL_INDEX[group];
    if (canonicalPath && indexMap) {
      let best = null;
      originChoice.options.forEach((originStop) => {
        destinationChoice.options.forEach((destStop) => {
          if (originStop.id === destStop.id) return;
          const originIndex = indexMap.get(originStop.id);
          const destinationIndex = indexMap.get(destStop.id);
          if (originIndex == null || destinationIndex == null || originIndex === destinationIndex) {
            return;
          }
          const direction = originIndex <= destinationIndex ? 'forward' : 'reverse';
          const segment =
            direction === 'forward'
              ? canonicalPath.slice(originIndex, destinationIndex + 1)
              : canonicalPath.slice(destinationIndex, originIndex + 1).reverse();
          if (!segment.length) {
            return;
          }
          const candidate = {
            origin: originStop,
            destination: destStop,
            group,
            direction,
            pathIds: segment.slice(),
          };
          if (isBetterPathCandidate(candidate, best)) {
            best = candidate;
          }
        });
      });
      if (best) {
        return best;
      }
    }
  }

  return resolveByLineIntersection(originChoice, destinationChoice);
}

function resolveByLineIntersection(originChoice, destinationChoice) {
  let best = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  originChoice.options.forEach((originStop) => {
    destinationChoice.options.forEach((destStop) => {
      if (originStop.lineId === destStop.lineId && originStop.id !== destStop.id) {
        const diff = Math.abs((originStop.order || 0) - (destStop.order || 0));
        if (diff && diff < bestDiff) {
          const direction = (originStop.order || 0) <= (destStop.order || 0) ? 'forward' : 'reverse';
          const pathSegment = getLineSegmentStops(originStop, destStop);
          if (!pathSegment.length) {
            return;
          }
          best = {
            origin: originStop,
            destination: destStop,
            group: LINE_GROUP[originStop.lineId] || `L${originStop.lineId}`,
            direction,
            pathIds: pathSegment.map((stop) => stop.id),
          };
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
  updateFavoriteControl();
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

  const tryPick = (candidateId) => {
    if (!candidateId) return null;
    for (const tipo of fallback) {
      const key = `${candidateId}-${tipo}`;
      if (scheduleMap.has(key)) {
        return { tipoDia: tipo, horas: scheduleMap.get(key), stopId: candidateId };
      }
    }
    return null;
  };

  const directMatch = tryPick(stopId);
  if (directMatch) return directMatch;

  if (lineId && LINE_DEFAULT_STOP[lineId] && LINE_DEFAULT_STOP[lineId] !== stopId) {
    const fallbackMatch = tryPick(LINE_DEFAULT_STOP[lineId]);
    if (fallbackMatch) return fallbackMatch;
  }
  return null;
}

function getDayType(date) {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'FESTIVO' : 'LECTIVO';
}

function getNextDepartures(hours = [], baseMinutes, amount = 3) {
  const sortedMinutes = sortScheduleMinutes(hours);
  const upcoming = sortedMinutes.filter((minutes) => minutes >= baseMinutes);
  return {
    upcoming: upcoming.slice(0, amount).map(formatMinutes),
    sortedMinutes,
  };
}

function sortScheduleMinutes(hours = []) {
  return hours
    .map((timeStr) => toMinutes(timeStr))
    .filter((minutes) => !Number.isNaN(minutes))
    .sort((a, b) => a - b);
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

function estimateTravelMinutes(trip) {
  if (!trip) return 0;
  if (Array.isArray(trip.pathIds) && trip.pathIds.length >= 2) {
    let total = 0;
    for (let index = 1; index < trip.pathIds.length; index += 1) {
      const prevStop = STOP_MAP.get(trip.pathIds[index - 1]);
      const hopMinutes = prevStop ? LINE_STEP_MINUTES.get(prevStop.lineId) : null;
      total += hopMinutes || 2;
    }
    return Math.max(1, Math.round(total));
  }
  const { origin, destination } = trip;
  if (!origin || !destination) {
    return 0;
  }
  if (origin.lineId === destination.lineId) {
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
  return Math.max(3, trip.pathIds ? trip.pathIds.length : 0);
}

function getDepartureLabel(group, direction, lineId, scheduleStopId) {
  if (scheduleStopId) {
    const stop = STOP_MAP.get(scheduleStopId);
    if (stop) {
      const stopLabel = LINE_DEPARTURE_LABELS[stop.lineId];
      if (stopLabel) {
        return stopLabel;
      }
    }
  }
  if (group && direction) {
    const label = GROUP_DEPARTURE_LABELS[group]?.[direction];
    if (label) {
      return label;
    }
  }
  return LINE_DEPARTURE_LABELS[lineId] || 'Salida desde la parada seleccionada';
}

function renderResult({
  origin,
  destination,
  line,
  nextDeparture,
  diffMinutes,
  travelMinutes,
  waitMinutes,
  upcoming,
  scheduleType,
  referenceTime,
  pathIds,
  direction,
  group,
  scheduleStopId,
}) {
  const countdownLabel = diffMinutes <= 0 ? 'Listo para salir' : `${diffMinutes} min`;
  const departureLabel = getDepartureLabel(group, direction, origin.lineId, scheduleStopId);
  const waitDisplay = Number.isFinite(waitMinutes) ? `${waitMinutes} min` : '—';
  const upcomingList = upcoming.length
    ? `<div><p class="muted-label">Siguientes servicios</p><ul class="timeline">${upcoming
        .map((time) => `<li>${time}</li>`)
        .join('')}</ul></div>`
    : '<p class="muted-label">No hay mas salidas cercanas.</p>';
  const routeTimeline = buildRouteTimeline(pathIds, origin, destination);

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
          <p>Espera estimada</p>
          <span>${waitDisplay}</span>
        </div>
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

function renderNoTripsMessage(nextAvailableMinutes) {
  const nextLabel = Number.isFinite(nextAvailableMinutes) ? formatMinutes(nextAvailableMinutes) : null;
  const extra = nextLabel
    ? `<p class="next-available">Primera salida del siguiente turno: <strong>${nextLabel}</strong></p>`
    : '';
  resultsPanel.innerHTML = `
    <div class="error-message">
      <p>No quedan salidas publicadas para la hora indicada.</p>
      ${extra}
    </div>
  `;
}

function showEmptyState() {
  resultsPanel.innerHTML = `
    <div class="empty-state">
      <h3>Configura tu viaje</h3>
      <p>Selecciona parada de origen y destino para ver los proximos servicios disponibles.</p>
    </div>
  `;
}

function renderFavoritePanel() {
  if (!favoritesListEl) return;
  if (!isAuthenticated) {
    favoritesListEl.innerHTML = '<p class="favorites-empty">Inicia sesion para gestionar tus trayectos favoritos.</p>';
    return;
  }
  if (!favoriteTrips.length) {
    favoritesListEl.innerHTML = '<p class="favorites-empty">Aun no tienes trayectos guardados.</p>';
    return;
  }
  favoritesListEl.innerHTML = favoriteTrips
    .map(
      (fav) => `
        <article class="favorite-item">
          <div class="favorite-item__title">
            <span>${fav.origin_label}</span>
            <span>→</span>
            <span>${fav.destination_label}</span>
          </div>
          <div class="favorite-item__actions">
            <button type="button" data-action="apply" data-favorite-id="${fav.idFavorito}" data-origin="${fav.origin_slug}" data-destination="${fav.destination_slug}">Cargar</button>
            <button type="button" data-action="remove" data-favorite-id="${fav.idFavorito}">Eliminar</button>
          </div>
        </article>
      `,
    )
    .join('');
}

function findFavoriteBySlugs(originSlug, destinationSlug) {
  return favoriteTrips.find(
    (fav) => fav.origin_slug === originSlug && fav.destination_slug === destinationSlug,
  );
}

async function saveFavorite(payload) {
  const response = await fetch(`${API_BASE_URL}/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

async function removeFavorite(favoriteId, credentials) {
  if (!favoriteId) return;
  const params = new URLSearchParams({
    usuario: credentials.usuario,
    contrasenia: credentials.contrasenia,
  });
  const response = await fetch(`${API_BASE_URL}/favoritos/${favoriteId}?${params.toString()}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`HTTP ${response.status}`);
  }
}

function getCurrentUserCredentials() {
  if (window.EtxebusSession && typeof window.EtxebusSession.getUser === 'function') {
    const user = window.EtxebusSession.getUser();
    if (user) return user;
  }
  try {
    const raw = window.localStorage.getItem('etxebusUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('No se pudo leer el usuario almacenado', error);
    return null;
  }
}

function buildRouteTimeline(pathIds, origin, destination) {
  if (Array.isArray(pathIds) && pathIds.length) {
    const timelineStops = buildTimelineStopsFromPath(pathIds);
    const items = timelineStops
      .map(({ stop, label, ids }, index) => {
        const classes = [];
        if (origin && ids.includes(origin.id)) classes.push('is-origin');
        if (destination && ids.includes(destination.id)) classes.push('is-destination');
        const classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';
        const text = label || (stop ? formatStopLabel(stop) : `Parada ${index + 1}`);
        return `<li${classAttr}><span>${text}</span></li>`;
      })
      .join('');
    return `
      <div class="route-timeline">
        <p class="muted-label">Paradas del trayecto</p>
        <ul class="stop-timeline">${items}</ul>
      </div>
    `;
  }
  if (origin && destination && origin.lineId === destination.lineId) {
    return buildLineTimeline(origin, destination);
  }
  return '';
}

function buildLineTimeline(origin, destination) {
  const segment = getLineSegmentStops(origin, destination);
  if (!segment.length) return '';
  const timelineStops = buildTimelineStopsFromPath(segment.map((stop) => stop.id));
  const items = timelineStops
    .map(({ stop, label, ids }, index) => {
      const classes = [];
      if (origin && ids.includes(origin.id)) classes.push('is-origin');
      if (destination && ids.includes(destination.id)) classes.push('is-destination');
      const classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';
      const text = label || (stop ? formatStopLabel(stop) : `Parada ${index + 1}`);
      return `<li${classAttr}><span>${text}</span></li>`;
    })
    .join('');
  return `
    <div class="route-timeline">
      <p class="muted-label">Paradas del trayecto</p>
      <ul class="stop-timeline">${items}</ul>
    </div>
  `;
}

function getLineSegmentStops(origin, destination) {
  if (!origin || !destination || origin.lineId !== destination.lineId) {
    return [];
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
  return segment;
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

function buildStopIdSlugMap(choices) {
  const map = new Map();
  choices.forEach((choice) => {
    choice.options.forEach((stop) => {
      map.set(stop.id, choice.slug);
    });
  });
  return map;
}

function buildLineStepMinutes(spanMap) {
  const steps = new Map();
  spanMap.forEach((span, lineId) => {
    const profile = LINE_TRAVEL_PROFILE[lineId];
    if (!profile) return;
    const totalSteps = Math.max(span.max - span.min, 1);
    steps.set(lineId, profile.totalMinutes / totalSteps);
  });
  return steps;
}

function buildCanonicalIndexMap() {
  const result = {};
  Object.entries(GROUP_CANONICAL_PATHS).forEach(([group, stopIds]) => {
    const map = new Map();
    stopIds.forEach((stopId, index) => {
      map.set(stopId, index);
    });
    result[group] = map;
  });
  return result;
}

window.addEventListener('storage', (event) => {
  if (event.key === SESSION_STORAGE_KEY) {
    isAuthenticated = isUserLoggedIn();
    if (!isAuthenticated) {
      favoriteTrips = [];
      renderFavoritePanel();
      if (favoritesPanel) {
        favoritesPanel.setAttribute('hidden', '');
      }
    }
    updateFavoriteControl();
    refreshFavorites();
  }
});

function isBetterPathCandidate(candidate, current) {
  if (!candidate) return false;
  if (!current) return true;
  const candidateDirectionScore = candidate.direction === 'forward' ? 0 : 1;
  const currentDirectionScore = current.direction === 'forward' ? 0 : 1;
  if (candidateDirectionScore !== currentDirectionScore) {
    return candidateDirectionScore < currentDirectionScore;
  }
  if (candidate.pathIds.length !== current.pathIds.length) {
    return candidate.pathIds.length < current.pathIds.length;
  }
  const candidateOrder = candidate.origin?.order || 0;
  const currentOrder = current.origin?.order || 0;
  return candidateOrder < currentOrder;
}

function buildTimelineStopsFromPath(pathIds) {
  const timeline = [];
  pathIds.forEach((stopId, index) => {
    const stop = STOP_MAP.get(stopId);
    const label = stop ? formatStopLabel(stop) : `Parada ${index + 1}`;
    const slugKey = STOP_ID_TO_SLUG.get(stopId);
    const allowMerge = slugKey ? MERGE_STOP_SLUGS.has(slugKey) : false;
    const mergeKey = allowMerge ? slugKey : null;
    const lastEntry = timeline[timeline.length - 1];
    if (allowMerge && lastEntry && lastEntry.mergeKey === mergeKey) {
      if (stop) {
        lastEntry.ids.push(stopId);
        if (!lastEntry.stop) {
          lastEntry.stop = stop;
        }
      }
      return;
    }
    timeline.push({
      stop: stop || null,
      label,
      mergeKey,
      ids: stop ? [stopId] : [],
    });
  });
  return timeline;
}

function calculateDepartureOffset(trip, scheduleStopId) {
  if (!trip || !scheduleStopId || !trip.group || !trip.direction || !trip.origin) {
    return 0;
  }
  if (scheduleStopId === trip.origin.id) {
    return 0;
  }
  const segment = getCanonicalSegment(trip.group, scheduleStopId, trip.origin.id, trip.direction);
  if (!segment || segment.length < 2) {
    return 0;
  }
  let totalMinutes = 0;
  for (let index = 1; index < segment.length; index += 1) {
    const prevStop = STOP_MAP.get(segment[index - 1]);
    totalMinutes += LINE_STEP_MINUTES.get(prevStop?.lineId) || 2;
  }
  return Math.round(totalMinutes);
}

function getCanonicalSegment(group, startId, endId, direction) {
  const ids = GROUP_CANONICAL_PATHS[group];
  if (!ids) return null;
  const startIndex = ids.indexOf(startId);
  const endIndex = ids.indexOf(endId);
  if (startIndex === -1 || endIndex === -1) {
    return null;
  }
  if (direction === 'forward') {
    if (startIndex > endIndex) return null;
    return ids.slice(startIndex, endIndex + 1);
  }
  if (direction === 'reverse') {
    if (startIndex < endIndex) return null;
    const slice = ids.slice(endIndex, startIndex + 1);
    return slice.reverse();
  }
  return null;
}

function isUserLoggedIn() {
  if (window.EtxebusSession && typeof window.EtxebusSession.isLoggedIn === 'function') {
    return window.EtxebusSession.isLoggedIn();
  }
  return window.localStorage.getItem(SESSION_STORAGE_KEY) === 'authenticated';
}
