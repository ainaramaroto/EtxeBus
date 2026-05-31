const PRINCIPAL_API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';
const PANEL_STATE_STORAGE_KEY = 'etxebusPrincipalPanels';

let mapUi = null;

const state = {
  activeLineKey: null,
  panelsCollapsed: false
};

const dom = {};

function getCurrentSessionAuth() {
  const user = window.EtxebusSession?.getUser?.();
  const authHeader = window.EtxebusSession?.getAuthorizationHeader?.();
  if (!user || !authHeader) return null;

  const idUsuario = Number(user.idUsuario ?? user.id);
  if (!Number.isFinite(idUsuario)) return null;

  return {
    idUsuario,
    authHeader
  };
}

function clearInvalidSession() {
  if (!window.EtxebusSession) return;
  window.EtxebusSession.clearUser?.();
  window.EtxebusSession.setLoggedIn?.(false);
}

async function cargarUsuariosDestacados() {
  const auth = getCurrentSessionAuth();
  if (!auth) return;

  try {
    const respuesta = await fetch(`${PRINCIPAL_API_BASE_URL}/usuarios/${auth.idUsuario}`, {
      headers: {
        Authorization: auth.authHeader
      }
    });
    if (respuesta.status === 401) {
      clearInvalidSession();
      return;
    }
    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status} al solicitar usuario`);
    }
    await respuesta.json();
  } catch (error) {
    if (String(error?.message || '').includes('401')) {
      clearInvalidSession();
      return;
    }
    console.warn('No se pudo recuperar la informacion del usuario:', error.message);
  }
}

document.addEventListener('DOMContentLoaded', initPrincipalPanel);

function initPrincipalPanel() {
  dom.searchInput = document.getElementById('map-search');
  dom.lineList = document.getElementById('line-list');
  dom.legendList = document.getElementById('legend-list');
  dom.routeCard = document.getElementById('route-card');
  dom.routeChip = document.getElementById('route-chip');
  dom.routeTitle = document.getElementById('route-title');
  dom.routeLine = dom.routeCard?.querySelector('.route-card__line') || null;
  dom.routeStop = document.getElementById('route-stop');
  dom.routeTimes = document.getElementById('route-times');
  dom.routeClose = document.getElementById('route-card-close');
  dom.status = document.getElementById('ui-status');
  dom.mapStage = document.querySelector('.map-stage');
  dom.filterLines = document.getElementById('filter-lines');
  dom.filterStops = document.getElementById('filter-stops');
  dom.zoomIn = document.getElementById('zoom-in');
  dom.zoomOut = document.getElementById('zoom-out');
  dom.resetView = document.getElementById('reset-view');
  dom.togglePanels = document.getElementById('toggle-panels');

  bindSearchControls();
  bindFilterControls();
  bindMapToolControls();
  bindSideActionButtons();
  bindRouteCardControls();
  bindMapEvents();
  bindCollapsiblePanels();

  connectMapUi();
  cargarUsuariosDestacados();
}

function bindSearchControls() {
  if (!dom.searchInput) return;

  dom.searchInput.addEventListener('input', () => {
    renderLineList();
  });

  dom.searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    executeSearch(dom.searchInput.value);
  });
}

function bindFilterControls() {
  [dom.filterLines, dom.filterStops].forEach((input) => {
    if (!input) return;
    input.addEventListener('change', applyFilters);
  });
}

function bindMapToolControls() {
  if (dom.zoomIn) {
    dom.zoomIn.addEventListener('click', () => {
      mapUi?.zoomIn?.();
    });
  }

  if (dom.zoomOut) {
    dom.zoomOut.addEventListener('click', () => {
      mapUi?.zoomOut?.();
    });
  }

  if (dom.resetView) {
    dom.resetView.addEventListener('click', () => {
      mapUi?.resetView?.();
      if (state.activeLineKey) {
        selectLine(state.activeLineKey, { fit: false, announce: false, showCard: false });
      }
    });
  }

  if (dom.togglePanels && dom.mapStage) {
    dom.togglePanels.addEventListener('click', () => {
      state.panelsCollapsed = !state.panelsCollapsed;
      dom.mapStage.classList.toggle('is-focus-mode', state.panelsCollapsed);
      dom.togglePanels.classList.toggle('is-active', state.panelsCollapsed);
      announce(state.panelsCollapsed ? 'Paneles ocultos' : 'Paneles visibles');
    });
  }
}

function bindSideActionButtons() {
  const favoritesButton = document.querySelector('[data-side-action="favorites"]');
  const profileButton = document.querySelector('[data-side-action="profile"]');
  const infoButton = document.querySelector('[data-side-action="info"]');

  if (favoritesButton) {
    favoritesButton.addEventListener('click', () => {
      document.querySelector('[data-role="header-favorites"]')?.click();
    });
  }

  if (profileButton) {
    profileButton.addEventListener('click', () => {
      document.querySelector('[data-role="header-profile"]')?.click();
    });
  }

  if (infoButton) {
    infoButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      document.querySelector('.info-fab')?.click();
    });
  }
}

function bindRouteCardControls() {
  if (!dom.routeClose || !dom.routeCard) return;
  dom.routeClose.addEventListener('click', () => {
    dom.routeCard.setAttribute('hidden', '');
  });
}

function bindMapEvents() {
  window.addEventListener('etxebus:map-ready', () => {
    setupUiFromMap();
  });

  window.addEventListener('etxebus:map-line-click', (event) => {
    const lineKey = event.detail?.lineKey;
    if (!lineKey) return;
    selectLine(lineKey, { fit: false, announce: false, showCard: false });
  });

  window.addEventListener('etxebus:map-stop-click', (event) => {
    const lineKey = event.detail?.lineKey || state.activeLineKey;
    if (!lineKey) return;
    const line = mapUi?.getLineByKey?.(lineKey);
    if (!line) return;
    state.activeLineKey = lineKey;
    renderLineList();
    renderLegend();
    showLineCard(line, event.detail?.stopName || line.defaultStop, event.detail?.stopLineKeys || []);
  });

  window.addEventListener('etxebus:map-state-change', () => {
    syncFilterControls();
    renderLineList();
    renderLegend();
  });
}

function bindCollapsiblePanels() {
  const linesToggle = document.querySelector('[data-panel-toggle="lines"]');
  const legendToggle = document.querySelector('[data-panel-toggle="legend"]');

  const savedState = readPanelState();
  const linesExpanded = savedState.lines !== false;
  const legendExpanded = savedState.legend !== false;

  setPanelExpanded('lines', linesExpanded, false);
  setPanelExpanded('legend', legendExpanded, false);

  if (linesToggle) {
    linesToggle.addEventListener('click', () => {
      const next = linesToggle.getAttribute('aria-expanded') !== 'true';
      setPanelExpanded('lines', next, true);
    });
  }

  if (legendToggle) {
    legendToggle.addEventListener('click', () => {
      const next = legendToggle.getAttribute('aria-expanded') !== 'true';
      setPanelExpanded('legend', next, true);
    });
  }
}

function getPanelElements(panelName) {
  const toggle = document.querySelector(`[data-panel-toggle="${panelName}"]`);
  const bodyId = toggle?.getAttribute('aria-controls') || '';
  const body = bodyId ? document.getElementById(bodyId) : null;
  return { toggle, body };
}

function readPanelState() {
  try {
    const raw = window.localStorage.getItem(PANEL_STATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePanelState(nextState) {
  try {
    window.localStorage.setItem(PANEL_STATE_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // no-op
  }
}

function setPanelExpanded(panelName, expanded, persist) {
  const { toggle, body } = getPanelElements(panelName);
  if (!toggle || !body) return;

  const isExpanded = Boolean(expanded);
  toggle.setAttribute('aria-expanded', String(isExpanded));
  if (isExpanded) {
    body.removeAttribute('hidden');
  } else {
    body.setAttribute('hidden', '');
  }

  if (persist) {
    const current = readPanelState();
    current[panelName] = isExpanded;
    writePanelState(current);
  }
}

function connectMapUi() {
  if (window.ETXEBUS_MAP_UI?.isReady?.()) {
    mapUi = window.ETXEBUS_MAP_UI;
    setupUiFromMap();
    return;
  }

  let retries = 0;
  const maxRetries = 40;
  const interval = window.setInterval(() => {
    retries += 1;
    if (window.ETXEBUS_MAP_UI?.isReady?.()) {
      window.clearInterval(interval);
      mapUi = window.ETXEBUS_MAP_UI;
      setupUiFromMap();
      return;
    }
    if (retries >= maxRetries) {
      window.clearInterval(interval);
    }
  }, 150);
}

function setupUiFromMap() {
  mapUi = window.ETXEBUS_MAP_UI;
  if (!mapUi) return;

  syncFilterControls();
  renderLineList();
  renderLegend();

  const active = mapUi.getActiveLineKey?.();
  const fallback = mapUi.getLinesMeta?.()?.[0]?.key;
  const lineKey = active || fallback;

  if (lineKey) {
    selectLine(lineKey, { fit: false, announce: false, showCard: false });
  }
}

function normalizeText(value = '') {
  return String(value).toLowerCase().trim();
}

function lineMatchesQuery(line, query) {
  if (!query) return true;

  const inLine =
    line.code.toLowerCase().includes(query) ||
    line.name.toLowerCase().includes(query) ||
    line.key.toLowerCase().includes(query);
  if (inLine) return true;

  const stops = mapUi?.getStopsByLine?.(line.key) || [];
  return stops.some((stop) => stop.name.toLowerCase().includes(query));
}

function renderLineList() {
  if (!dom.lineList) return;
  const lines = mapUi?.getLinesMeta?.() || [];

  if (!lines.length) {
    dom.lineList.innerHTML = '<p class="line-empty">Sin lineas disponibles.</p>';
    return;
  }

  const query = normalizeText(dom.searchInput?.value || '');
  const filtered = lines.filter((line) => lineMatchesQuery(line, query));

  if (!filtered.length) {
    dom.lineList.innerHTML = '<p class="line-empty">Sin coincidencias.</p>';
    return;
  }

  dom.lineList.innerHTML = '';

  filtered.forEach((line) => {
    const row = document.createElement('article');
    row.className = 'line-row';
    if (line.key === state.activeLineKey) row.classList.add('is-active');
    if (!line.visible) row.classList.add('is-hidden');

    const mainButton = document.createElement('button');
    mainButton.type = 'button';
    mainButton.className = 'line-row__main';
    mainButton.innerHTML = `
      <span class="line-row__badge" style="background:${line.color}">${line.code}</span>
      <span class="line-row__text">
        <p class="line-row__name">${line.name}</p>
        <p class="line-row__meta">${line.subtitle || (Array.isArray(line.routeIds) && line.routeIds.length > 1 ? '2 recorridos' : '1 recorrido')}</p>
      </span>
    `;

    mainButton.addEventListener('click', () => {
      selectLine(line.key, { fit: true, announce: true, showCard: false });
    });

    const visibilityButton = document.createElement('button');
    visibilityButton.type = 'button';
    visibilityButton.className = 'line-row__toggle';
    visibilityButton.setAttribute('aria-label', line.visible ? 'Ocultar linea' : 'Mostrar linea');
    visibilityButton.innerHTML = line.visible
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"></path><circle cx="12" cy="12" r="2.5" fill="currentColor"></circle></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6c2.4 0 4.4.8 6 1.8" fill="none" stroke="currentColor" stroke-width="2"></path><path d="M22 12s-3.5 6-10 6c-2.4 0-4.4-.8-6-1.8" fill="none" stroke="currentColor" stroke-width="2"></path><path d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2"></path></svg>';

    visibilityButton.addEventListener('click', () => {
      toggleLineVisibility(line.key);
    });

    row.appendChild(mainButton);
    row.appendChild(visibilityButton);
    dom.lineList.appendChild(row);
  });
}

function renderLegend() {
  if (!dom.legendList) return;
  const lines = mapUi?.getLinesMeta?.() || [];

  if (!lines.length) {
    dom.legendList.innerHTML = '';
    return;
  }

  dom.legendList.innerHTML = '';

  lines.forEach((line) => {
    const item = document.createElement('li');
    item.style.opacity = line.visible ? '1' : '0.45';
    const legendText =
      line.legendDescription ||
      line.subtitle ||
      `${line.code} ${line.name}`;
    item.innerHTML = `
      <span class="legend-line" style="background:${line.color}"></span>
      <span>${legendText}</span>
    `;
    dom.legendList.appendChild(item);
  });
}

function selectLine(lineKey, options = {}) {
  if (!mapUi?.setActiveLine) return;

  const fit = options.fit !== false;
  const line = mapUi.setActiveLine(lineKey, { fit, emit: false }) || mapUi.getLineByKey(lineKey);
  if (!line) return;

  state.activeLineKey = line.key;
  renderLineList();
  renderLegend();

  if (options.showCard !== false) {
    showLineCard(line, line.defaultStop || 'Ayuntamiento');
  } else {
    hideLineCard();
  }

  if (options.announce !== false) {
    announce(`Linea ${line.code} seleccionada`);
  }
}

function showLineCard(line, stopName, stopLineKeys = []) {
  if (!line || !dom.routeCard) return;
  const normalizedStopName = String(stopName || '').trim().toLowerCase();
  const isMetroSharedStop = normalizedStopName === 'metro etxebarri';

  const coloredDepartures =
    mapUi?.getUpcomingDeparturesForStop?.(stopName, stopLineKeys, 4) || [];
  const fallbackTimes = mapUi?.getUpcomingTimes?.(line.key, 4, new Date(), { stopName }) || [];

  if (dom.routeLine) {
    dom.routeLine.style.display = isMetroSharedStop ? 'none' : '';
  }

  if (dom.routeChip && !isMetroSharedStop) {
    dom.routeChip.textContent = line.code;
    dom.routeChip.style.background = line.color;
  }

  if (dom.routeTitle && !isMetroSharedStop) {
    dom.routeTitle.textContent = line.name;
  }

  if (dom.routeStop) {
    dom.routeStop.textContent = `Parada: ${stopName || line.defaultStop || 'Ayuntamiento'}`;
  }

  if (dom.routeTimes) {
    if (coloredDepartures.length) {
      dom.routeTimes.innerHTML = coloredDepartures
        .map(
          (item) =>
            `<span class="route-time-pill route-time-pill--line" style="background:${item.color};border-color:${item.color};color:#ffffff"${isMetroSharedStop ? '' : ` title="${item.code} ${item.name}"`}>${item.time}</span>`,
        )
        .join('');
    } else {
      dom.routeTimes.innerHTML = fallbackTimes
        .map((time) => `<span class="route-time-pill">${time}</span>`)
        .join('');
    }
  }

  dom.routeCard.removeAttribute('hidden');
}

function hideLineCard() {
  if (!dom.routeCard) return;
  dom.routeCard.setAttribute('hidden', '');
}

function toggleLineVisibility(lineKey) {
  if (!mapUi?.isLineVisible || !mapUi?.setLineVisible) return;
  const nowVisible = mapUi.isLineVisible(lineKey);
  mapUi.setLineVisible(lineKey, !nowVisible);
  renderLineList();
  renderLegend();
}

function syncFilterControls() {
  const filters = mapUi?.getFilterState?.();
  const lines = mapUi?.getLinesMeta?.() || [];
  if (dom.filterLines) {
    dom.filterLines.checked = lines.length ? lines.every((line) => line.visible) : true;
  }
  if (dom.filterStops) dom.filterStops.checked = Boolean(filters?.stops);
}

function applyFilters(event) {
  if (!mapUi) return;

  const linesToggleChanged = !event || event.target === dom.filterLines;
  if (linesToggleChanged) {
    const showLines = Boolean(dom.filterLines?.checked);
    if (typeof mapUi.setAllLinesVisible === 'function') {
      mapUi.setAllLinesVisible(showLines);
    } else if (typeof mapUi.getLinesMeta === 'function' && typeof mapUi.setLineVisible === 'function') {
      const lines = mapUi.getLinesMeta() || [];
      lines.forEach((line) => mapUi.setLineVisible(line.key, showLines));
    }
  }

  if (typeof mapUi.setFilterState === 'function') {
    mapUi.setFilterState({
      stops: Boolean(dom.filterStops?.checked)
    });
  }

  syncFilterControls();
  renderLineList();
  renderLegend();
}

function executeSearch(rawQuery = '') {
  const query = normalizeText(rawQuery);
  if (!query || !mapUi) return;

  const lineMatch = mapUi.searchLine?.(query);
  if (lineMatch) {
    selectLine(lineMatch.key, { fit: true, announce: true, showCard: true });
    return;
  }

  const stopMatch = mapUi.focusStopByName?.(query);
  if (stopMatch) {
    const line = mapUi.getLineByKey?.(stopMatch.lineKey);
    if (line) {
      state.activeLineKey = line.key;
      renderLineList();
      renderLegend();
      showLineCard(line, stopMatch.name);
    }
    announce(`Parada ${stopMatch.name} localizada`);
    return;
  }

  announce('Sin resultados para la busqueda');
}

function announce(message) {
  if (!dom.status) return;
  dom.status.textContent = message;
}
