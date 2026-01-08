mapboxgl.accessToken = 'pk.eyJ1IjoiaW5pZ29maWF0IiwiYSI6ImNtZ3psb3JhMTBnc2gybHI0dzZpOWpqYnYifQ.wAcZcyjV9eSJYxHNsn7vfg';

const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

const FALLBACK_LINES = {
  'l1-metro': {
    name: 'Metro',
    badge: 'Linea 1',
    subtitle: 'Metro → Santa Marina',
    color: '#0074D9',
    info: 'Conecta el metro con el barrio alto. Ideal en horas punta de la manana.',
    stops: [
      'L1 Metro Etxebarri',
      'L1 Metacal Kalea',
      'L1 Doneztebe Eliza',
      'L1 San Antonio Hiribidea',
      'L1 Kukullaga Ikastetxea',
      'L1 Kiroldegia',
      'L1 Galicia Kalea',
      'L1 Galicia Kalea 2',
      'L1 Santa Marina'
    ]
  },
  'l1-santamarina': {
    name: 'Santa Marina',
    badge: 'Linea 1',
    subtitle: 'Santa Marina → Metro',
    color: '#FFC107',
    info: 'Recorre el casco urbano y baja hacia el metro pasando por los centros escolares.',
    stops: [
      'L1 Santa Marina',
      'L1 IES Etxebarri BHI',
      'L1 Goiko San Antonio Hiribidea',
      'L1 Kukullaga Ikastetxea',
      'L1 Beheko San Antonio Hiribidea',
      'L1 Doneztebe Eliza',
      'L1 Metacal Kalea',
      'L1 Metro Etxebarri'
    ]
  },
  'l2-luze': {
    name: 'Luze',
    badge: 'Linea 2',
    subtitle: 'Poligono + Boquete',
    color: '#1B8F3A',
    info: 'Servicio que enlaza el poligono, los centros educativos y la zona del Boquete sin trasbordos.',
    stops: [
      'L2 Metro Etxebarri',
      'L2 Fuenlabrada Kalea',
      'L2 Errota/Molino',
      'L2 Zuberoa Kalea',
      'L2 Lezama Legizamon',
      'L2 Tomas Meabe',
      'L2 Zubialdea (El Boquete)',
      'L2 Zubialdea (El Boquete)',
      'L2 Tomas Meabe',
      'L2 Lezama Legizamon',
      'L2 Fuenlabrada Kalea',
      'L2 Metro Etxebarri'
    ]
  },
  'l2-labur': {
    name: 'Labur',
    badge: 'Linea 2',
    subtitle: 'Boquete directo',
    color: '#C6FF00',
    info: 'Version rapida para subir y bajar al Boquete. Enlaza con Metro y lineas comarcales.',
    stops: [
      'L2 Metro Etxebarri',
      'L2 Fuenlabrada Kalea',
      'L2 Lezama Legizamon',
      'L2 Tomas Meabe',
      'L2 Zubialdea (El Boquete)',
      'L2 Zubialdea (El Boquete)',
      'L2 Tomas Meabe',
      'L2 Lezama Legizamon',
      'L2 Fuenlabrada Kalea',
      'L2 Metro Etxebarri'
    ]
  }
};

const LINE_DEFAULT_KEY = 'l1-metro';
const LINES_DATA = {};
const lineStopPromises = new Map();
let lineButtonsContainer;
let lineButtons = [];
let detailSection;
let pillEl;
let nameEl;
let descEl;
let infoEl;
let typeEl;
let stopsEl;
let pendingLineKey = LINE_DEFAULT_KEY;
let pendingColor = '#0074D9';

const METRO_COORD = [-2.8967772404717302, 43.24397173609036];
const VUELTA_METRO_LOOP = [
  [-2.896769, 43.244994],
  [-2.896929, 43.244753],
  [-2.897663, 43.244142],
  [-2.897483, 43.244004]
];

const L1_METRO_ROUTE = [
  [-2.8967772404717302, 43.24397173609036],
  [-2.8937088759947267, 43.24492992719602],
  [-2.891122115319937, 43.24598755268646],
  [-2.8872862407224327, 43.24702874476444],
  [-2.8861488323489226, 43.24901769897248],
  [-2.8841071166975185, 43.25066808714677],
  [-2.883330180290336, 43.252660853827855],
  [-2.882623819357687, 43.25345316885862],
  [-2.883024510937969, 43.255890099999405]
];

const L1_SANTA_ROUTE = [
  [-2.883024510937969, 43.255890099999405],
  [-2.884890897506966, 43.25343406150203],
  [-2.8839558722117618, 43.25103331923095],
  [-2.886034033873555, 43.248992351853026],
  [-2.8874842700078407, 43.24717715469667],
  [-2.8912215474404075, 43.246038806411484],
  [-2.893827387294854, 43.24495873405763],
  ...VUELTA_METRO_LOOP,
  METRO_COORD
];

const FUENLABRADA_ENTRADA = [-2.894916, 43.246515];
const LINEA2_ROTONDA = [-2.895042288566618, 43.24848058651014];
const LINEA2_BOKETE_RETORNO = [-2.9046724606433934, 43.24462875070237];

const LINEA2_POLIGONO_COORDS = [
  [-2.8937310550466755, 43.247315355022344],
  [-2.8945549868126155, 43.24877093455157],
  [-2.89462322472418, 43.250428229805784]
];

const LINEA2_BOKETE_PARADAS = [
  [-2.896714203551309, 43.247736109456135],
  [-2.9001729580517575, 43.24544512460776],
  [-2.904239398789997, 43.24439361613609],
  [-2.9037884717608153, 43.24396966288082],
  [-2.9000632950565217, 43.245410025230086],
  [-2.896459984789626, 43.24780509523457],
  [-2.8943843007617427, 43.246974801859636]
];

const LINEA2_BOKETE_SEGMENT = [
  ...LINEA2_BOKETE_PARADAS.slice(0, 3),
  LINEA2_BOKETE_RETORNO,
  ...LINEA2_BOKETE_PARADAS.slice(3)
];

const LINE_WAYPOINTS = {
  'l1-metro': L1_METRO_ROUTE,
  'l1-santamarina': L1_SANTA_ROUTE,
  'l2-labur': [
    METRO_COORD,
    FUENLABRADA_ENTRADA,
    LINEA2_ROTONDA,
    ...LINEA2_BOKETE_SEGMENT,
    METRO_COORD
  ],
  'l2-luze': [
    METRO_COORD,
    FUENLABRADA_ENTRADA,
    ...LINEA2_POLIGONO_COORDS,
    LINEA2_ROTONDA,
    ...LINEA2_BOKETE_SEGMENT,
    METRO_COORD
  ]
};

const MINI_MAP_BASE_STYLE = 'mapbox://styles/mapbox/streets-v12';
const MINI_MAP_MUTED_OVERRIDES = [
  { ids: ['background'], property: 'background-color', value: '#f8fbff' },
  { ids: ['land', 'landcover'], property: 'fill-color', value: '#f0f6ef' },
  { ids: ['water', 'water-shadow'], property: 'fill-color', value: '#dfeefe' },
  {
    ids: [
      'road-primary',
      'road-secondary-tertiary',
      'road-street',
      'road-minor',
      'road-major',
      'road-major-link',
      'road-trunk',
      'bridge-primary',
      'bridge-secondary-tertiary',
      'bridge-major',
      'bridge-street'
    ],
    property: 'line-color',
    value: '#dfe6f6'
  },
  { ids: ['building'], property: 'fill-color', value: '#eef2fa' }
];

function setMiniMapPaint(instance, layerId, property, value) {
  if (!instance || !layerId) return;
  if (!instance.getLayer(layerId)) return;
  try {
    instance.setPaintProperty(layerId, property, value);
  } catch (error) {
    console.warn(`No se pudo ajustar ${property} en ${layerId}: ${error.message}`);
  }
}

function applyMiniMapStyle(instance) {
  if (!instance) return;
  MINI_MAP_MUTED_OVERRIDES.forEach((override) => {
    override.ids.forEach((layer) => setMiniMapPaint(instance, layer, override.property, override.value));
  });
}

const routeCache = {};
const PRECOMPUTED_ROUTE_ALIASES = {
  'l1-metro': 'ruta-ida',
  'l1-santamarina': 'ruta-vuelta',
  'l2-luze': 'linea2-bokete-largo',
  'l2-labur': 'linea2-bokete-corto'
};
const PRECOMPUTED_ROUTES = window.ETXEBUS_PRECOMPUTED_ROUTES || {};
let miniMap;
let miniMapReady = false;
const METRO_POINT = { coord: METRO_COORD, label: 'Metro', anchorTop: true };
const SANTA_POINT = { coord: [-2.883024510937969, 43.255890099999405], label: 'Santa Marina' };
const POLIGONO_POINT = { coord: [-2.89462322472418, 43.250428229805784], label: 'Poligono' };
const BOKETE_POINT = { coord: [-2.9039, 43.2441], label: 'Boquete' };
const ROTONDA_POINT = { coord: LINEA2_ROTONDA, label: '', anchorTop: false };
const LINE_MARKERS = {
  'l1-metro': [METRO_POINT, SANTA_POINT],
  'l1-santamarina': [SANTA_POINT, METRO_POINT],
  'l2-labur': [METRO_POINT, BOKETE_POINT],
  'l2-luze': [METRO_POINT, POLIGONO_POINT, BOKETE_POINT]
};

document.addEventListener('DOMContentLoaded', () => {
  lineButtonsContainer = document.querySelector('.line-buttons');
  detailSection = document.getElementById('line-detail');
  pillEl = document.getElementById('line-pill');
  nameEl = document.getElementById('line-name');
  descEl = document.getElementById('line-description');
  infoEl = document.getElementById('line-info');
  typeEl = document.getElementById('line-type');
  stopsEl = document.getElementById('line-stops');

  bootstrapLineInterface();
  initMiniMap();
  window.addEventListener('resize', () => {
    if (miniMap) {
      miniMap.resize();
    }
  });
});

async function bootstrapLineInterface() {
  setSidebarMessage('Cargando lineas...');
  try {
    const apiLines = await fetchLinesFromApi();
    ingestLines(apiLines);
  } catch (error) {
    console.warn('No se pudieron cargar las lineas desde el API, usando datos locales:', error);
    useFallbackLines();
  }
  renderSidebarButtons();
  const initialKey = selectInitialLineKey();
  if (initialKey) {
    renderLine(initialKey);
  }
  Object.keys(LINES_DATA).forEach((slug) => {
    ensureStopsForLine(slug).catch((err) => console.warn(`No se pudieron cargar las paradas de ${slug}:`, err));
  });
}

function setSidebarMessage(message) {
  if (!lineButtonsContainer) return;
  lineButtonsContainer.innerHTML = '';
  const placeholder = document.createElement('p');
  placeholder.className = 'line-loading';
  placeholder.textContent = message;
  lineButtonsContainer.appendChild(placeholder);
}

async function fetchLinesFromApi() {
  const response = await fetch(`${API_BASE_URL}/lineas`);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al solicitar lineas`);
  }
  const payload = await response.json();
  const lines = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  if (!lines.length) {
    throw new Error('La API no devolvio lineas');
  }
  return lines;
}

async function fetchStopsFromApi(lineId) {
  const response = await fetch(`${API_BASE_URL}/paradas?line_id=${lineId}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al solicitar paradas`);
  }
  const payload = await response.json();
  const stops = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return stops;
}

function clearStoredLines() {
  Object.keys(LINES_DATA).forEach((key) => delete LINES_DATA[key]);
  lineStopPromises.clear();
}

function normalizeCoord(value) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStop(stop, index = 0) {
  if (!stop) {
    return { id: null, nombre: `Parada ${index + 1}`, orden: index + 1, coordX: null, coordY: null };
  }
  if (typeof stop === 'string') {
    return { id: null, nombre: stop, orden: index + 1, coordX: null, coordY: null };
  }
  const nombre = stop.nombre || stop.label || `Parada ${index + 1}`;
  const coordX = normalizeCoord(stop.coordX ?? stop.coord?.[0]);
  const coordY = normalizeCoord(stop.coordY ?? stop.coord?.[1]);
  return {
    id: stop.idParada ?? stop.id ?? null,
    nombre,
    orden: stop.orden ?? index + 1,
    coordX,
    coordY,
  };
}

function ingestLines(lines) {
  clearStoredLines();
  lines
    .slice()
    .sort((a, b) => {
      const ordenA = a.orden ?? 0;
      const ordenB = b.orden ?? 0;
      if (ordenA !== ordenB) return ordenA - ordenB;
      return (a.idLinea ?? 0) - (b.idLinea ?? 0);
    })
    .forEach((linea, index) => {
      const slug = linea.slug || linea.identifier || linea.nomLinea?.toLowerCase().replace(/\s+/g, '-');
      if (!slug) return;
      const normalized = {
        lineId: linea.idLinea ?? null,
        slug,
        name: linea.nomLinea || linea.name || `Linea ${index + 1}`,
        badge: linea.badge || linea.line_badge || linea.nomLinea || linea.name || `Linea ${index + 1}`,
        subtitle: linea.subtitle || linea.service_name || '',
        info: linea.info || linea.description || '',
        color: linea.color || linea.line_color || '#0b2447',
        orden: linea.orden ?? index,
        stops: [],
        stopDetails: [],
      };
      if (Array.isArray(linea.stops) && linea.stops.length) {
        const normalizedStops = linea.stops.map((stop, idx) => normalizeStop(stop, idx));
        normalized.stopDetails = normalizedStops;
        normalized.stops = normalizedStops.map((stop) => stop.nombre);
      }
      LINES_DATA[slug] = normalized;
    });
  pendingColor = LINES_DATA[pendingLineKey]?.color || pendingColor;
}

function useFallbackLines() {
  clearStoredLines();
  Object.entries(FALLBACK_LINES).forEach(([slug, data], index) => {
    const stopDetails = (data.stops || []).map((stop, idx) => normalizeStop(stop, idx));
    LINES_DATA[slug] = {
      lineId: data.idLinea ?? null,
      slug,
      name: data.name,
      badge: data.badge || data.name,
      subtitle: data.subtitle || '',
      info: data.info || '',
      color: data.color || '#0b2447',
      orden: data.orden ?? index,
      stops: data.stops.slice(),
      stopDetails,
    };
  });
  pendingColor = LINES_DATA[pendingLineKey]?.color || pendingColor;
}

function selectInitialLineKey() {
  if (LINES_DATA[LINE_DEFAULT_KEY]) return LINE_DEFAULT_KEY;
  const ordered = Object.values(LINES_DATA).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return ordered.length ? ordered[0].slug : null;
}

function renderSidebarButtons() {
  if (!lineButtonsContainer) return;
  const ordered = Object.values(LINES_DATA).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  if (!ordered.length) {
    setSidebarMessage('No hay lineas disponibles.');
    return;
  }
  lineButtonsContainer.innerHTML = '';
  lineButtons = ordered.map((linea) => {
    const btn = document.createElement('button');
    btn.className = 'line-btn';
    btn.dataset.line = linea.slug;
    const chip = document.createElement('span');
    chip.className = 'line-chip';
    chip.textContent = linea.badge || linea.name;
    const wrapper = document.createElement('div');
    wrapper.className = 'line-btn-text';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'line-name';
    nameSpan.textContent = linea.name;
    const subtitle = document.createElement('small');
    subtitle.textContent = linea.subtitle || 'Servicio municipal';
    wrapper.appendChild(nameSpan);
    wrapper.appendChild(subtitle);
    btn.appendChild(chip);
    btn.appendChild(wrapper);
    if (linea.color) {
      btn.style.setProperty('--accent', linea.color);
    }
    btn.addEventListener('click', () => renderLine(linea.slug));
    lineButtonsContainer.appendChild(btn);
    return btn;
  });
}

function setActiveLineButton(slug) {
  lineButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.line === slug));
}

function renderLine(key) {
  const line = LINES_DATA[key];
  if (!line || !detailSection) return;

  const accent = line.color || '#0b2447';
  detailSection.style.setProperty('--line-color', accent);
  if (pillEl) {
    pillEl.textContent = line.badge || line.name;
    pillEl.style.background = accent;
    pillEl.style.color = '#fff';
  }
  if (nameEl) nameEl.textContent = line.name;
  const subtitleText = line.subtitle || 'Servicio municipal';
  if (descEl) descEl.textContent = subtitleText;
  if (typeEl) typeEl.textContent = subtitleText;
  if (infoEl) {
    infoEl.textContent =
      line.info ||
      'Selecciona una linea para consultar su recorrido completo, color oficial y paradas destacadas.';
  }

  renderStopsList(line);
  setActiveLineButton(key);
  pendingLineKey = key;
  pendingColor = accent;
  updateMiniMap(key, accent);
  if (!line.stopDetails?.length && line.lineId) {
    ensureStopsForLine(key).catch((err) => console.warn(`No se pudieron actualizar las paradas de ${key}:`, err));
  }
}

function renderStopsList(line) {
  if (!stopsEl) return;
  stopsEl.innerHTML = '';
  const stops = line.stopDetails && line.stopDetails.length ? line.stopDetails : line.stops;
  if (!stops || !stops.length) {
    const li = document.createElement('li');
    li.className = 'loading';
    li.textContent = 'Cargando paradas...';
    stopsEl.appendChild(li);
    return;
  }
  stops.forEach((stop) => {
    const li = document.createElement('li');
    const label = typeof stop === 'string' ? stop : stop.nombre;
    li.textContent = (label || '').replace(/^L\d\s/, '');
    stopsEl.appendChild(li);
  });
}

async function ensureStopsForLine(slug) {
  const line = LINES_DATA[slug];
  if (!line) return [];
  if (line.stopDetails?.length || !line.lineId) {
    return line.stopDetails || [];
  }
  if (!lineStopPromises.has(slug)) {
    lineStopPromises.set(
      slug,
      (async () => {
        const stops = await fetchStopsFromApi(line.lineId);
        const normalizedStops = stops.map((stop, idx) => normalizeStop(stop, idx));
        line.stopDetails = normalizedStops;
        line.stops = normalizedStops.map((stop) => stop.nombre);
        return normalizedStops;
      })(),
    );
  }
  const result = await lineStopPromises.get(slug);
  if (pendingLineKey === slug) {
    renderStopsList(line);
    updateStopMarkers(slug);
  }
  return result;
}

function initMiniMap() {
  const container = document.getElementById('mini-map');
  if (!container) return;
  miniMap = new mapboxgl.Map({
    container: 'mini-map',
    style: MINI_MAP_BASE_STYLE,
    center: [-2.8945, 43.2478],
    zoom: 14,
    attributionControl: false,
    interactive: false,
    logoPosition: 'bottom-right'
  });
  window.ETXEBUS_LINE_MINIMAP = miniMap;

  if (miniMap.isStyleLoaded()) {
    setupMiniMapLayers();
  } else {
    miniMap.on('load', setupMiniMapLayers);
    miniMap.on('styledata', setupMiniMapLayers);
  }
}

function setupMiniMapLayers() {
  if (!miniMap || miniMapReady) return;
  miniMapReady = true;
  applyMiniMapStyle(miniMap);

  if (!miniMap.getSource('line-preview')) {
    miniMap.addSource('line-preview', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }
  if (!miniMap.getLayer('line-preview')) {
    miniMap.addLayer({
      id: 'line-preview',
      type: 'line',
      source: 'line-preview',
      paint: {
        'line-color': pendingColor,
        'line-width': 5,
        'line-opacity': 0.9
      }
    });
  }
  if (!miniMap.getSource('line-stops')) {
    miniMap.addSource('line-stops', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }
  if (!miniMap.getLayer('line-stops-circles')) {
    miniMap.addLayer({
      id: 'line-stops-circles',
      type: 'circle',
      source: 'line-stops',
      paint: {
        'circle-radius': 5,
        'circle-color': '#e53935',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1
      }
    });
  }
  if (!miniMap.getLayer('line-stops-labels')) {
    miniMap.addLayer({
      id: 'line-stops-labels',
      type: 'symbol',
      source: 'line-stops',
      filter: ['==', ['get', 'label'], true],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#0b2447',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });
  }

  updateMiniMap(pendingLineKey, pendingColor);
}

async function updateMiniMap(key, color) {
  if (!miniMapReady) return;
  if (miniMap) miniMap.resize();
  const geometry = await getRouteGeometry(key);
  if (!geometry) return;

  const source = miniMap.getSource('line-preview');
  if (!source) return;
  source.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry }] });
  miniMap.setPaintProperty('line-preview', 'line-color', color);

  const bounds = geometry.coordinates.reduce(
    (b, coord) => b.extend(coord),
    new mapboxgl.LngLatBounds(geometry.coordinates[0], geometry.coordinates[0])
  );
  miniMap.fitBounds(bounds, { padding: 40, duration: 600 });
  updateStopMarkers(key);
}

async function getRouteGeometry(key) {
  if (routeCache[key]) return routeCache[key];
  const alias = PRECOMPUTED_ROUTE_ALIASES[key];
  const precomputed = alias ? PRECOMPUTED_ROUTES[alias] : null;
  if (Array.isArray(precomputed) && precomputed.length > 1) {
    const geometry = { type: 'LineString', coordinates: precomputed };
    routeCache[key] = geometry;
    return geometry;
  }
  const coords = LINE_WAYPOINTS[key];
  if (!coords || coords.length < 2) return null;
  const geometry = await buildRouteFromWaypoints(coords);
  routeCache[key] = geometry;
  return geometry;
}

function buildFeaturesFromLine(line) {
  if (!line || !Array.isArray(line.stopDetails)) return [];
  return line.stopDetails
    .map((stop) => {
      const lng = typeof stop.coordX === 'number' ? stop.coordX : null;
      const lat = typeof stop.coordY === 'number' ? stop.coordY : null;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { name: stop.nombre || '', label: true },
      };
    })
    .filter(Boolean);
}

function updateStopMarkers(key) {
  const source = miniMap?.getSource('line-stops');
  if (!source) return;
  const line = LINES_DATA[key];
  let features = buildFeaturesFromLine(line);
  if (!features.length) {
    const markers = LINE_MARKERS[key] || [];
    features = markers.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: m.coord },
      properties: { name: m.label || '', label: Boolean(m.label) },
    }));
  }
  source.setData({ type: 'FeatureCollection', features });
}

async function fetchRouteSegment(coords) {
  const coordStr = coords.map((c) => `${c[0]},${c[1]}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
    `?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${mapboxgl.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.routes?.length) throw new Error('No se pudo obtener la ruta del mapa');
  return data.routes[0].geometry;
}

async function buildRouteFromWaypoints(waypoints, chunkSize = 25) {
  if (waypoints.length <= chunkSize) return fetchRouteSegment(waypoints);
  const merged = [];
  let first = true;
  for (let i = 0; i < waypoints.length - 1; i += (chunkSize - 1)) {
    const slice = waypoints.slice(i, Math.min(i + chunkSize, waypoints.length));
    const seg = await fetchRouteSegment(slice);
    const coords = seg.coordinates;
    if (first) { merged.push(...coords); first = false; }
    else {
      if (
        merged[merged.length - 1][0] === coords[0][0] &&
        merged[merged.length - 1][1] === coords[0][1]
      ) merged.push(...coords.slice(1));
      else merged.push(...coords);
    }
  }
  return { type: 'LineString', coordinates: merged };
}
