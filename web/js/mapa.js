mapboxgl.accessToken = window.ETXEBUS_MAPBOX_TOKEN || '';

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
const CENTRO_ETXEBARRI = [-2.888064738494468, 43.24850496812509];
const API_BASE_URL = window.ETXEBUS_API_BASE || 'http://localhost:4000/api';

const MUTED_LAYER_OVERRIDES = [
  { ids: ['background'], property: 'background-color', value: '#fefeff' },
  { ids: ['land', 'landcover'], property: ['fill-color', 'background-color'], value: '#f6f9f3' },
  { ids: ['water', 'water-shadow'], property: 'fill-color', value: '#dbeefb' },
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
    value: '#eaf0fb'
  },
  { ids: ['building'], property: ['fill-extrusion-color', 'fill-color'], value: '#f8f9fd' }
];

function setPaintIfExists(instance, layerId, propertyNames, value) {
  if (!instance || !layerId) return;
  const layer = instance.getLayer(layerId);
  if (!layer) return;
  const properties = Array.isArray(propertyNames) ? propertyNames : [propertyNames];
  let lastError;
  for (const prop of properties) {
    try {
      instance.setPaintProperty(layerId, prop, value);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    console.warn(`No se pudo ajustar ${properties.join('/')} en ${layerId}: ${lastError.message}`);
  }
}

function applyMutedMapStyle(instance) {
  MUTED_LAYER_OVERRIDES.forEach((override) => {
    override.ids.forEach((layer) => setPaintIfExists(instance, layer, override.property, override.value));
  });
}

const d = (lng, lat) => [lng, lat];

function calculateBoundsFromCoords(coords = [], padding = 0) {
  if (!coords.length) return null;
  const bounds = coords.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLng: Math.max(acc.maxLng, lng),
      maxLat: Math.max(acc.maxLat, lat)
    }),
    {
      minLng: coords[0][0],
      minLat: coords[0][1],
      maxLng: coords[0][0],
      maxLat: coords[0][1]
    }
  );
  return [
    [bounds.minLng - padding, bounds.minLat - padding],
    [bounds.maxLng + padding, bounds.maxLat + padding]
  ];
}

function sanitizeStopName(value = '') {
  return String(value).replace(/^L\d\s*/i, '').trim();
}

function normalizeStopToken(value = '') {
  return sanitizeStopName(value).toLowerCase();
}

const PARADAS_LINEA1 = [
  { nombre: 'L1 Metro Etxebarri', coord: d(-2.8967772404717302, 43.24397173609036) },
  { nombre: 'L1 Metacal Kalea', coord: d(-2.8937088759947267, 43.24492992719602) },
  { nombre: 'L1 Doneztebe Eliza', coord: d(-2.891122115319937, 43.24598755268646) },
  { nombre: 'L1 San Antonio Hiribidea', coord: d(-2.8872862407224327, 43.24702874476444) },
  { nombre: 'L1 Kukullaga Ikastetxea', coord: d(-2.8861488323489226, 43.24901769897248) },
  { nombre: 'L1 Kiroldegia', coord: d(-2.8841071166975185, 43.25066808714677) },
  { nombre: 'L1 Galicia Kalea', coord: d(-2.883330180290336, 43.252660853827855) },
  { nombre: 'L1 Galicia Kalea 2', coord: d(-2.882623819357687, 43.25345316885862) },
  { nombre: 'L1 Santa Marina', coord: d(-2.883024510937969, 43.255890099999405) },
  { nombre: 'L1 IES Etxebarri BHI', coord: d(-2.884890897506966, 43.25343406150203) },
  { nombre: 'L1 Goiko San Antonio Hiribidea', coord: d(-2.8839558722117618, 43.25103331923095) },
  { nombre: 'L1 Beheko San Antonio Hiribidea', coord: d(-2.8874842700078407, 43.24717715469667) }
];

const PARADAS_LINEA2_POLIGONO = [
  { nombre: 'L2 Fuenlabrada Kalea', coord: d(-2.8937310550466755, 43.247315355022344) },
  { nombre: 'L2 Errota/Molino', coord: d(-2.8945549868126155, 43.24877093455157) },
  { nombre: 'L2 Zuberoa Kalea', coord: d(-2.89462322472418, 43.250428229805784) }
];

const PARADAS_LINEA2_BOKETE = [
  { nombre: 'L2 Lezama Legizamon', coord: d(-2.896714203551309, 43.247736109456135) },
  { nombre: 'L2 Tomas Meabe', coord: d(-2.9001729580517575, 43.24544512460776) },
  { nombre: 'L2 Zubialdea (El Boquete)', coord: d(-2.904239398789997, 43.24439361613609) },
  { nombre: 'L2 Zubialdea (El Boquete)', coord: d(-2.9037884717608153, 43.24396966288082) },
  { nombre: 'L2 Tomas Meabe', coord: d(-2.9000632950565217, 43.245410025230086) },
  { nombre: 'L2 Lezama Legizamon', coord: d(-2.896459984789626, 43.24780509523457) },
  { nombre: 'L2 Fuenlabrada Kalea', coord: d(-2.8943843007617427, 43.246974801859636) }
];

const METRO_COORD = d(-2.8967772404717302, 43.24397173609036);
const FUENLABRADA_ENTRADA = d(-2.894916, 43.246515);
const LINEA2_ROTONDA = d(-2.895042288566618, 43.24848058651014);
const LINEA2_BOKETE_RETORNO = d(-2.9046724606433934, 43.24462875070237);
const POLIGONO_GIRO = d(-2.8947321565083315, 43.25058287965117);

const L1_METRO_ROUTE = [
  d(-2.8967772404717302, 43.24397173609036),
  d(-2.8937088759947267, 43.24492992719602),
  d(-2.891122115319937, 43.24598755268646),
  d(-2.8872862407224327, 43.24702874476444),
  d(-2.8861488323489226, 43.24901769897248),
  d(-2.8841071166975185, 43.25066808714677),
  d(-2.883330180290336, 43.252660853827855),
  d(-2.882623819357687, 43.25345316885862),
  d(-2.883024510937969, 43.255890099999405)
];

const VUELTA_METRO_LOOP = [
  d(-2.896769, 43.244994),
  d(-2.896929, 43.244753),
  d(-2.897663, 43.244142),
  d(-2.897483, 43.244004)
];

const L1_SANTA_ROUTE = [
  d(-2.883024510937969, 43.255890099999405),
  d(-2.884890897506966, 43.25343406150203),
  d(-2.8839558722117618, 43.25103331923095),
  d(-2.886034033873555, 43.248992351853026),
  d(-2.8874842700078407, 43.24717715469667),
  d(-2.8912215474404075, 43.246038806411484),
  d(-2.893827387294854, 43.24495873405763),
  ...VUELTA_METRO_LOOP,
  METRO_COORD
];

const LINEA2_POLIGONO_WAYPOINTS = [...PARADAS_LINEA2_POLIGONO.map((p) => p.coord), POLIGONO_GIRO];

const LINEA2_POLIGONO_RUTA = [
  METRO_COORD,
  FUENLABRADA_ENTRADA,
  ...LINEA2_POLIGONO_WAYPOINTS,
  METRO_COORD
];

const LINEA2_BOKETE_SEGMENT = [
  ...PARADAS_LINEA2_BOKETE.slice(0, 3).map((p) => p.coord),
  LINEA2_BOKETE_RETORNO,
  ...PARADAS_LINEA2_BOKETE.slice(3).map((p) => p.coord)
];

const LINEA2_BOKETE_LARGO_RUTA = [
  METRO_COORD,
  FUENLABRADA_ENTRADA,
  ...LINEA2_POLIGONO_WAYPOINTS,
  LINEA2_ROTONDA,
  ...LINEA2_BOKETE_SEGMENT,
  METRO_COORD
];

const LINEA2_BOKETE_CORTO_RUTA = [
  METRO_COORD,
  FUENLABRADA_ENTRADA,
  LINEA2_ROTONDA,
  ...LINEA2_BOKETE_SEGMENT,
  METRO_COORD
];

const ROUTE_DEFINITIONS = [
  {
    id: 'ruta-ida',
    lineKey: 'l1-metro',
    waypoints: L1_METRO_ROUTE,
    color: '#0074D9',
    arrowLayer: 'flechas-l1-metro',
    arrowImage: 'flecha-azul'
  },
  {
    id: 'ruta-vuelta',
    lineKey: 'l1-santamarina',
    waypoints: L1_SANTA_ROUTE,
    color: '#FFC107',
    dash: [2, 2],
    arrowLayer: 'flechas-l1-santa',
    arrowImage: 'flecha-amarilla'
  },
  {
    id: 'linea2-poligono',
    lineKey: 'l2-luze',
    waypoints: LINEA2_POLIGONO_RUTA,
    color: '#1B8F3A',
    arrowLayer: 'flechas-l2-poligono',
    arrowImage: 'flecha-verde'
  },
  {
    id: 'linea2-bokete-largo',
    lineKey: 'l2-luze',
    waypoints: LINEA2_BOKETE_LARGO_RUTA,
    color: '#1B8F3A',
    arrowLayer: 'flechas-l2-luze',
    arrowImage: 'flecha-verde-claro'
  },
  {
    id: 'linea2-bokete-corto',
    lineKey: 'l2-labur',
    waypoints: LINEA2_BOKETE_CORTO_RUTA,
    color: '#C6FF00',
    dash: [3, 3],
    arrowLayer: 'flechas-l2-labur',
    arrowImage: 'flecha-naranja'
  }
];

const LINE_GROUPS = [
  {
    key: 'l1-metro',
    code: 'L1',
    name: 'Metro',
    subtitle: 'Metro -> Santa Marina',
    legendDescription: 'Metro -> Santa Marina',
    color: '#0074D9',
    routeIds: ['ruta-ida'],
    interval: 25,
    firstDeparture: 342,
    defaultStop: 'Metro Etxebarri'
  },
  {
    key: 'l1-santamarina',
    code: 'L1',
    name: 'Santa Marina',
    subtitle: 'Santa Marina -> Metro',
    legendDescription: 'Santa Marina -> Metro',
    color: '#FFC107',
    routeIds: ['ruta-vuelta'],
    interval: 27,
    firstDeparture: 356,
    defaultStop: 'Santa Marina'
  },
  {
    key: 'l2-labur',
    code: 'L2',
    name: 'Labur',
    subtitle: 'Boquete directo',
    legendDescription: 'Boquete',
    color: '#C6FF00',
    routeIds: ['linea2-bokete-corto'],
    interval: 30,
    firstDeparture: 372,
    defaultStop: 'Zubialdea (El Boquete)'
  },
  {
    key: 'l2-luze',
    code: 'L2',
    name: 'Luze',
    subtitle: 'Poligono + Boquete',
    legendDescription: 'Poligono + Boquete',
    color: '#1B8F3A',
    routeIds: ['linea2-poligono', 'linea2-bokete-largo'],
    interval: 32,
    firstDeparture: 389,
    defaultStop: 'Fuenlabrada Kalea'
  }
];

const STOPS_BY_LINE = {
  'l1-metro': [
    { name: 'Metro Etxebarri', coord: METRO_COORD },
    { name: 'Metacal Kalea', coord: d(-2.8937088759947267, 43.24492992719602) },
    { name: 'Doneztebe Eliza', coord: d(-2.891122115319937, 43.24598755268646) },
    { name: 'San Antonio Hiribidea', coord: d(-2.8872862407224327, 43.24702874476444) },
    { name: 'Kukullaga Ikastetxea', coord: d(-2.886034033873555, 43.248992351853026) },
    { name: 'Kiroldegia', coord: d(-2.8841071166975185, 43.25066808714677) },
    { name: 'Galicia Kalea', coord: d(-2.883330180290336, 43.252660853827855) },
    { name: 'Galicia Kalea 2', coord: d(-2.882623819357687, 43.25345316885862) },
    { name: 'Santa Marina', coord: d(-2.883024510937969, 43.255890099999405) }
  ],
  'l1-santamarina': [
    { name: 'Santa Marina', coord: d(-2.883024510937969, 43.255890099999405) },
    { name: 'IES Etxebarri BHI', coord: d(-2.884890897506966, 43.25343406150203) },
    { name: 'Goiko San Antonio Hiribidea', coord: d(-2.8839558722117618, 43.25103331923095) },
    { name: 'Kukullaga Ikastetxea', coord: d(-2.8861488323489226, 43.24901769897248) },
    { name: 'Beheko San Antonio Hiribidea', coord: d(-2.8874842700078407, 43.24717715469667) },
    { name: 'Doneztebe Eliza', coord: d(-2.8912215474404075, 43.246038806411484) },
    { name: 'Metacal Kalea', coord: d(-2.893827387294854, 43.24495873405763) },
    { name: 'Metro Etxebarri', coord: METRO_COORD }
  ],
  'l2-luze': [
    { name: 'Metro Etxebarri', coord: METRO_COORD },
    { name: 'Fuenlabrada Kalea', coord: d(-2.8937310550466755, 43.247315355022344) },
    { name: 'Errota/Molino', coord: d(-2.8945549868126155, 43.24877093455157) },
    { name: 'Zuberoa Kalea', coord: d(-2.89462322472418, 43.250428229805784) },
    { name: 'Lezama Legizamon', coord: d(-2.896714203551309, 43.247736109456135) },
    { name: 'Tomas Meabe', coord: d(-2.9001729580517575, 43.24544512460776) },
    { name: 'Zubialdea (El Boquete)', coord: d(-2.904239398789997, 43.24439361613609) }
  ],
  'l2-labur': [
    { name: 'Metro Etxebarri', coord: METRO_COORD },
    { name: 'Fuenlabrada Kalea', coord: d(-2.8943843007617427, 43.246974801859636) },
    { name: 'Lezama Legizamon', coord: d(-2.896459984789626, 43.24780509523457) },
    { name: 'Tomas Meabe', coord: d(-2.9000632950565217, 43.245410025230086) },
    { name: 'Zubialdea (El Boquete)', coord: d(-2.9037884717608153, 43.24396966288082) }
  ]
};

const SCHEDULE_STOP_SEQUENCE_BY_LINE = {
  'l1-metro': [
    'Metro Etxebarri',
    'Metacal Kalea',
    'Doneztebe Eliza',
    'San Antonio Hiribidea',
    'Kukullaga Ikastetxea',
    'Kiroldegia',
    'Galicia Kalea',
    'Galicia Kalea 2',
    'Santa Marina'
  ],
  'l1-santamarina': [
    'Santa Marina',
    'IES Etxebarri BHI',
    'Goiko San Antonio Hiribidea',
    'Kukullaga Ikastetxea',
    'Beheko San Antonio Hiribidea',
    'Doneztebe Eliza',
    'Metacal Kalea',
    'Metro Etxebarri'
  ],
  'l2-labur': [
    'Metro Etxebarri',
    'Fuenlabrada Kalea',
    'Lezama Legizamon',
    'Tomas Meabe',
    'Zubialdea (El Boquete)',
    'Zubialdea (El Boquete)',
    'Tomas Meabe',
    'Lezama Legizamon',
    'Fuenlabrada Kalea',
    'Metro Etxebarri'
  ],
  'l2-luze': [
    'Metro Etxebarri',
    'Fuenlabrada Kalea',
    'Errota/Molino',
    'Zuberoa Kalea',
    'Lezama Legizamon',
    'Tomas Meabe',
    'Zubialdea (El Boquete)',
    'Zubialdea (El Boquete)',
    'Tomas Meabe',
    'Lezama Legizamon',
    'Fuenlabrada Kalea',
    'Metro Etxebarri'
  ]
};

const LINE_TOTAL_TRAVEL_MINUTES = new Map([
  ['l1-metro', 10],
  ['l1-santamarina', 10],
  ['l2-labur', 5],
  ['l2-luze', 10]
]);

const NETWORK_COORDS = ROUTE_DEFINITIONS.flatMap((route) => route.waypoints);
const NETWORK_VIEW_BOUNDS = calculateBoundsFromCoords(NETWORK_COORDS, 0.001);
const NETWORK_LIMIT_BOUNDS = calculateBoundsFromCoords(NETWORK_COORDS, 0.0018);
const MAX_ALLOWED_ZOOM = 20;
const MIN_BASE_ZOOM = 12.4;
const PRECOMPUTED_ROUTES = window.ETXEBUS_PRECOMPUTED_ROUTES || {};
const VIEWPORT_LIMIT_BOUNDS = [
  [-2.9395, 43.226],
  [-2.84, 43.267]
];

const PRECOMPUTED_ROUTE_ALIASES = {
  'ruta-ida': 'ruta-ida',
  'ruta-vuelta': 'ruta-vuelta',
  'linea2-poligono': 'linea2-poligono',
  'linea2-bokete-largo': 'linea2-bokete-largo',
  'linea2-bokete-corto': 'linea2-bokete-corto'
};

const routeCache = {};
const hiddenLines = new Set();
const filterState = {
  lines: true,
  stops: true,
  routes: true
};
const scheduleDataByLine = new Map();
const lineIdByKey = new Map([
  ['l1-metro', 1],
  ['l1-santamarina', 2],
  ['l2-labur', 3],
  ['l2-luze', 4]
]);
let officialSchedulesLoaded = false;
let officialSchedulesPromise = null;

let mapReady = false;
let activeLineKey = 'l1-metro';
let pendingLineFocusFrame = null;

const ROUTE_BY_ID = new Map(ROUTE_DEFINITIONS.map((route) => [route.id, route]));
const LINE_BY_KEY = new Map(LINE_GROUPS.map((line) => [line.key, line]));

const map = new mapboxgl.Map({
  container: 'map',
  style: MAP_STYLE,
  center: CENTRO_ETXEBARRI,
  zoom: 14,
  minZoom: MIN_BASE_ZOOM,
  maxZoom: MAX_ALLOWED_ZOOM,
  dragRotate: false,
  pitchWithRotate: false,
  touchPitch: false
});

window.ETXEBUS_MAIN_MAP = map;

const scheduleMainMapResize = () => {
  window.requestAnimationFrame(() => {
    map.resize();
  });
};

window.addEventListener('resize', scheduleMainMapResize);
window.addEventListener('orientationchange', scheduleMainMapResize);

if ('ResizeObserver' in window) {
  const mapContainer = document.getElementById('map');
  if (mapContainer && mapContainer.parentElement) {
    const mainMapObserver = new ResizeObserver(() => {
      scheduleMainMapResize();
    });
    mainMapObserver.observe(mapContainer.parentElement);
  }
}

const ACTIVE_BOUNDS = VIEWPORT_LIMIT_BOUNDS || NETWORK_LIMIT_BOUNDS;
if (ACTIVE_BOUNDS) {
  map.setMaxBounds(ACTIVE_BOUNDS);
}

configureMapInteractions(map);

map.on('load', async () => {
  applyMutedMapStyle(map);
  lockInitialView(map);
  loadOfficialSchedules().catch((error) => {
    console.warn('No se pudieron cargar los horarios oficiales para el mapa:', error);
  });

  await drawNetworkLines();
  await addArrowLayers();

  addStopsSourceAndLayers();
  bindInteractiveLayers();

  applyVisibilityState();
  setActiveLine('l1-metro', { fit: false, emit: false });

  mapReady = true;
  emitUiEvent('etxebus:map-ready', { lines: getLinesMeta() });
});

function emitUiEvent(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function lockInitialView(instance) {
  if (!NETWORK_VIEW_BOUNDS || !instance) return;
  instance.fitBounds(NETWORK_VIEW_BOUNDS, {
    padding: { top: 36, bottom: 36, left: 36, right: 36 },
    maxZoom: 15.2,
    duration: 0
  });
  const fittedZoom = instance.getZoom();
  instance.setMinZoom(fittedZoom);
  instance.setMaxZoom(Math.min(fittedZoom + 6, MAX_ALLOWED_ZOOM));
}

function addStaticLine(route, coordinates) {
  map.addSource(route.id, {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates } }
  });

  map.addLayer({
    id: route.id,
    type: 'line',
    source: route.id,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': route.color,
      'line-width': 4,
      ...(route.dash ? { 'line-dasharray': route.dash } : {})
    }
  });
}

async function drawNetworkLines() {
  await Promise.all(
    ROUTE_DEFINITIONS.map(async (route) => {
      const coordinates = await getRouteCoordinates(route);
      if (!coordinates || coordinates.length < 2) return;
      addStaticLine(route, coordinates);
    })
  );
}

async function getRouteCoordinates(route) {
  const precomputedAlias = PRECOMPUTED_ROUTE_ALIASES[route.id];
  const precomputed = precomputedAlias ? PRECOMPUTED_ROUTES[precomputedAlias] : null;
  if (Array.isArray(precomputed) && precomputed.length > 1) {
    return precomputed;
  }
  try {
    const geometry = await getRouteGeometry(route.id, route.waypoints);
    if (geometry) return geometry.coordinates;
  } catch (error) {
    console.warn(`No se pudo obtener ruta "${route.id}" desde Directions:`, error);
  }
  return route.waypoints;
}

function configureMapInteractions(instance) {
  if (!instance) return;
  instance.scrollZoom.enable();
  instance.boxZoom.disable();
  instance.dragPan.enable();
  instance.dragRotate.disable();
  instance.keyboard.enable();
  instance.doubleClickZoom.enable();
  instance.touchZoomRotate.enable();
  instance.touchZoomRotate.disableRotation();
}

async function getRouteGeometry(key, waypoints) {
  if (routeCache[key]) return routeCache[key];
  if (!Array.isArray(waypoints) || waypoints.length < 2) return null;
  const geometry = await buildRouteFromWaypoints(waypoints);
  routeCache[key] = geometry;
  return geometry;
}

async function fetchRouteSegment(coords) {
  const coordStr = coords.map((c) => `${c[0]},${c[1]}`).join(';');
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
    '?alternatives=false&geometries=geojson&overview=full&steps=false' +
    `&access_token=${mapboxgl.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.routes?.length) {
    throw new Error(data.message || 'Sin resultados de ruta');
  }
  return data.routes[0].geometry;
}

async function buildRouteFromWaypoints(waypoints, chunkSize = 25) {
  if (waypoints.length <= chunkSize) return fetchRouteSegment(waypoints);
  const merged = [];
  let first = true;
  for (let i = 0; i < waypoints.length - 1; i += chunkSize - 1) {
    const slice = waypoints.slice(i, Math.min(i + chunkSize, waypoints.length));
    const segment = await fetchRouteSegment(slice);
    const coords = segment.coordinates;
    if (first) {
      merged.push(...coords);
      first = false;
    } else if (
      merged[merged.length - 1][0] === coords[0][0] &&
      merged[merged.length - 1][1] === coords[0][1]
    ) {
      merged.push(...coords.slice(1));
    } else {
      merged.push(...coords);
    }
  }
  return { type: 'LineString', coordinates: merged };
}

async function addArrowLayers() {
  try {
    await Promise.all([
      loadImagePromise(map, ARROW_BLUE_PNG, 'flecha-azul'),
      loadImagePromise(map, ARROW_YELLOW_PNG, 'flecha-amarilla'),
      loadImagePromise(map, ARROW_LIGHT_GREEN_PNG, 'flecha-verde-claro'),
      loadImagePromise(map, ARROW_GREEN_PNG, 'flecha-verde'),
      loadImagePromise(map, ARROW_ORANGE_PNG, 'flecha-naranja')
    ]);

    ROUTE_DEFINITIONS.forEach((route) => {
      if (!map.getSource(route.id) || !route.arrowLayer || !route.arrowImage) return;
      if (map.getLayer(route.arrowLayer)) return;
      map.addLayer({
        id: route.arrowLayer,
        type: 'symbol',
        source: route.id,
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 56,
          'icon-image': route.arrowImage,
          'icon-size': 0.78
        }
      });
    });
  } catch (error) {
    console.warn('No se pudieron cargar las flechas de direccion', error);
  }
}

function loadImagePromise(instance, image, name) {
  return new Promise((resolve, reject) => {
    instance.loadImage(image, (err, img) => {
      if (err) return reject(err);
      if (!instance.hasImage(name)) instance.addImage(name, img);
      resolve();
    });
  });
}

function getCoordKey(coord = []) {
  const [lng, lat] = Array.isArray(coord) ? coord : [null, null];
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return '';
  return `${lng.toFixed(6)}|${lat.toFixed(6)}`;
}

function buildStopFeatures() {
  const merged = new Map();

  Object.entries(STOPS_BY_LINE).forEach(([lineKey, stops]) => {
    stops.forEach((stop) => {
      const key = getCoordKey(stop.coord);
      if (!key) return;

      const existing = merged.get(key) || {
        name: sanitizeStopName(stop.name),
        coord: stop.coord,
        lineKeys: new Set(),
      };

      existing.lineKeys.add(lineKey);
      if (!existing.name && stop.name) {
        existing.name = sanitizeStopName(stop.name);
      }

      merged.set(key, existing);
    });
  });

  return Array.from(merged.entries()).map(([key, entry]) => ({
    type: 'Feature',
    properties: {
      nombre: entry.name || 'Parada',
      id: key,
      lineKeys: Array.from(entry.lineKeys).join('|'),
    },
    geometry: { type: 'Point', coordinates: entry.coord },
  }));
}

function addStopsSourceAndLayers() {
  const features = buildStopFeatures();

  map.addSource('paradas', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features
    },
    cluster: true,
    clusterRadius: 18,
    clusterMaxZoom: 17
  });

  map.addLayer({
    id: 'paradas-clusters',
    type: 'circle',
    source: 'paradas',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#185c9e',
      'circle-opacity': 0.9,
      'circle-radius': ['step', ['get', 'point_count'], 12, 5, 16, 10, 20],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  });

  map.addLayer({
    id: 'paradas-cluster-count',
    type: 'symbol',
    source: 'paradas',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-size': 11
    },
    paint: { 'text-color': '#ffffff' }
  });

  map.addLayer({
    id: 'paradas-puntos',
    type: 'circle',
    source: 'paradas',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 14, 5, 17, 7],
      'circle-color': '#e53935',
      'circle-opacity': 0.95,
      'circle-stroke-width': 1.4,
      'circle-stroke-color': '#ffffff'
    }
  });
}

function bindInteractiveLayers() {
  ROUTE_DEFINITIONS.forEach((route) => {
    map.on('click', route.id, (event) => {
      setActiveLine(route.lineKey, { fit: false, emit: false });
      const line = LINE_BY_KEY.get(route.lineKey);
      emitUiEvent('etxebus:map-line-click', {
        lineKey: route.lineKey,
        routeId: route.id,
        code: line?.code || '',
        name: line?.name || '',
        coordinates: event?.lngLat || null
      });
    });

    map.on('mouseenter', route.id, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', route.id, () => {
      map.getCanvas().style.cursor = '';
    });
  });

  map.on('click', 'paradas-clusters', (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;
    const clusterId = feature.properties?.cluster_id;
    const source = map.getSource('paradas');
    if (!source || clusterId === undefined) return;

    source.getClusterExpansionZoom(clusterId, (error, zoom) => {
      if (error) return;
      map.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500
      });
    });
  });

  map.on('click', 'paradas-puntos', (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const coordinates = feature.geometry.coordinates.slice();
    const nombre = feature.properties?.nombre || 'Parada';
    const stopLineKeys = parseFeatureLineKeys(feature);
    const lineKey = choosePreferredLineKey(stopLineKeys, nombre);

    if (lineKey) {
      setActiveLine(lineKey, { fit: false, emit: false });
    }

    emitUiEvent('etxebus:map-stop-click', {
      lineKey,
      stopLineKeys,
      stopName: sanitizeStopName(nombre),
      coordinates
    });
  });

  map.on('mouseenter', 'paradas-puntos', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'paradas-puntos', () => {
    map.getCanvas().style.cursor = '';
  });
}

function inferLineByStopName(stopName = '') {
  const normalized = normalizeStopToken(stopName);
  for (const [lineKey, stops] of Object.entries(STOPS_BY_LINE)) {
    const found = stops.some((stop) => normalizeStopToken(stop.name) === normalized);
    if (found) return lineKey;
  }
  return activeLineKey;
}

function parseFeatureLineKeys(feature) {
  const raw = feature?.properties?.lineKeys;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split('|')
    .map((value) => value.trim())
    .filter((value) => value && LINE_BY_KEY.has(value));
}

function lineHasStopAsTerminal(lineKey, normalizedStop = '') {
  if (!normalizedStop) return false;
  const stops = STOPS_BY_LINE[lineKey];
  if (!Array.isArray(stops) || !stops.length) return false;
  const first = normalizeStopToken(stops[0].name);
  const last = normalizeStopToken(stops[stops.length - 1].name);
  return first === normalizedStop || last === normalizedStop;
}

function choosePreferredLineKey(candidateLineKeys = [], stopName = '') {
  const uniqueLineKeys = Array.from(new Set(candidateLineKeys));

  if (!uniqueLineKeys.length) {
    return inferLineByStopName(stopName);
  }

  if (uniqueLineKeys.length === 1) {
    return uniqueLineKeys[0];
  }

  const normalizedStop = normalizeStopToken(stopName);

  if (activeLineKey && uniqueLineKeys.includes(activeLineKey)) {
    const activeLineCode = LINE_BY_KEY.get(activeLineKey)?.code;
    const alternativesWithSameCode = uniqueLineKeys.filter(
      (key) => key !== activeLineKey && LINE_BY_KEY.get(key)?.code === activeLineCode
    );

    if (
      normalizedStop &&
      alternativesWithSameCode.length &&
      lineHasStopAsTerminal(activeLineKey, normalizedStop)
    ) {
      const transferCandidate = alternativesWithSameCode.find((key) =>
        lineHasStopAsTerminal(key, normalizedStop)
      );
      if (transferCandidate) return transferCandidate;
    }

    return activeLineKey;
  }

  const visibleCandidate = uniqueLineKeys.find((key) => isLineVisible(key));
  if (visibleCandidate) return visibleCandidate;

  return uniqueLineKeys[0];
}

function setLayerVisibility(layerId, visible) {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}

function setLineOpacity(routeId, opacity) {
  if (!map.getLayer(routeId)) return;
  try {
    map.setPaintProperty(routeId, 'line-opacity', opacity);
  } catch (error) {
    // no-op
  }
}

function setLineWidth(routeId, width) {
  if (!map.getLayer(routeId)) return;
  try {
    map.setPaintProperty(routeId, 'line-width', width);
  } catch (error) {
    // no-op
  }
}

function applyVisibilityState() {
  ROUTE_DEFINITIONS.forEach((route) => {
    const lineVisible = filterState.lines && isLineVisible(route.lineKey);
    const isActive = route.lineKey === activeLineKey;

    setLayerVisibility(route.id, lineVisible);
    setLineOpacity(route.id, lineVisible ? (isActive ? 1 : 0.66) : 0);
    setLineWidth(route.id, isActive ? 6 : 4);

    if (route.arrowLayer) {
      setLayerVisibility(route.arrowLayer, lineVisible && filterState.routes);
    }
  });

  setLayerVisibility('paradas-clusters', filterState.stops);
  setLayerVisibility('paradas-cluster-count', filterState.stops);
  setLayerVisibility('paradas-puntos', filterState.stops);

  emitUiEvent('etxebus:map-state-change', {
    activeLineKey,
    filters: { ...filterState },
    hiddenLines: Array.from(hiddenLines)
  });
}

function isLineVisible(lineKey) {
  return !hiddenLines.has(lineKey);
}

function setLineVisible(lineKey, visible) {
  if (!LINE_BY_KEY.has(lineKey)) return false;
  if (visible) hiddenLines.delete(lineKey);
  else hiddenLines.add(lineKey);
  applyVisibilityState();
  return true;
}

function setAllLinesVisible(visible) {
  LINE_GROUPS.forEach((line) => {
    if (visible) hiddenLines.delete(line.key);
    else hiddenLines.add(line.key);
  });
  applyVisibilityState();
  return true;
}

function setFilterState(nextState = {}) {
  if (typeof nextState.lines === 'boolean') filterState.lines = nextState.lines;
  if (typeof nextState.stops === 'boolean') filterState.stops = nextState.stops;
  if (typeof nextState.routes === 'boolean') filterState.routes = nextState.routes;
  applyVisibilityState();
}

function getFilterState() {
  return { ...filterState };
}

function setActiveLine(lineKey, options = {}) {
  if (!LINE_BY_KEY.has(lineKey)) return null;
  activeLineKey = lineKey;
  applyVisibilityState();

  if (options.fit !== false) {
    queueLineFocus(lineKey);
  }

  const meta = getLineByKey(lineKey);
  if (options.emit !== false) {
    emitUiEvent('etxebus:map-line-change', { line: meta });
  }
  return meta;
}

function queueLineFocus(lineKey) {
  if (!map) return;
  map.stop();
  if (pendingLineFocusFrame !== null) {
    window.cancelAnimationFrame(pendingLineFocusFrame);
  }

  const applyFocus = () => {
    if (!LINE_BY_KEY.has(lineKey) || activeLineKey !== lineKey) return;
    fitLineBounds(lineKey);
  };

  pendingLineFocusFrame = window.requestAnimationFrame(() => {
    pendingLineFocusFrame = null;
    applyFocus();
  });
}

function fitLineBounds(lineKey) {
  const routes = ROUTE_DEFINITIONS.filter((route) => route.lineKey === lineKey);
  if (!routes.length) return;

  const coords = routes.flatMap((route) => route.waypoints || []);
  if (!coords.length) return;

  const bounds = calculateBoundsFromCoords(coords, 0.0009);
  if (!bounds) return;

  map.fitBounds(bounds, {
    padding: { top: 80, right: 80, bottom: 80, left: 80 },
    duration: 650,
    maxZoom: 16,
    linear: true,
    retainPadding: false
  });
}

function resetView() {
  lockInitialView(map);
  setActiveLine(activeLineKey, { fit: false, emit: false });
}

function zoomIn() {
  map.zoomIn({ duration: 220 });
}

function zoomOut() {
  map.zoomOut({ duration: 220 });
}

function getLinesMeta() {
  return LINE_GROUPS.map((line) => ({
    ...line,
    visible: isLineVisible(line.key)
  }));
}

function getLineByKey(lineKey) {
  const line = LINE_BY_KEY.get(lineKey);
  if (!line) return null;
  return {
    ...line,
    visible: isLineVisible(line.key)
  };
}

function getStopsByLine(lineKey) {
  return Array.isArray(STOPS_BY_LINE[lineKey]) ? STOPS_BY_LINE[lineKey].slice() : [];
}

function formatMinutesToHour(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseHourToMinutes(value = '') {
  const [rawH, rawM] = String(value).split(':');
  const hours = Number(rawH);
  const minutes = Number(rawM);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function getCurrentDayType(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'FESTIVO' : 'LECTIVO';
}

function getLineStopSequence(lineKey = '') {
  const explicitSequence = SCHEDULE_STOP_SEQUENCE_BY_LINE[lineKey];
  if (Array.isArray(explicitSequence) && explicitSequence.length) {
    return explicitSequence.map((name) => sanitizeStopName(name));
  }

  const stops = STOPS_BY_LINE[lineKey];
  if (!Array.isArray(stops)) return [];
  return stops.map((stop) => sanitizeStopName(stop.name));
}

function getStopIndexesInLine(lineKey, stopName = '') {
  const normalized = normalizeStopToken(stopName);
  if (!normalized) return [];
  const sequence = getLineStopSequence(lineKey);
  const indexes = [];
  sequence.forEach((name, index) => {
    if (normalizeStopToken(name) === normalized) {
      indexes.push(index);
    }
  });
  return indexes;
}

function getLineStepMinutes(lineKey = '') {
  const sequence = getLineStopSequence(lineKey);
  const steps = Math.max(sequence.length - 1, 1);
  const totalTravel = Number(LINE_TOTAL_TRAVEL_MINUTES.get(lineKey));
  if (Number.isFinite(totalTravel) && totalTravel > 0) {
    return totalTravel / steps;
  }

  const line = LINE_BY_KEY.get(lineKey);
  const intervalBasedFallback = Math.max(8, Number(line?.interval || 25));
  return Math.max(intervalBasedFallback / steps, 1);
}

function getStopOffsetsMinutes(lineKey, stopName = '') {
  const indexes = getStopIndexesInLine(lineKey, stopName);
  if (!indexes.length) return [0];
  const stepMinutes = getLineStepMinutes(lineKey);
  const offsets = indexes.map((index) => Math.max(0, Math.round(index * stepMinutes)));
  const deduped = Array.from(new Set(offsets));
  return deduped.sort((a, b) => a - b);
}

function getNextSlotsFromTimeline(timeline = [], currentMinutes = 0, count = 4, offset = 0) {
  if (!timeline.length || count <= 0) return [];
  const adjustedNow = currentMinutes - offset;
  const today = timeline.filter((minute) => minute >= adjustedNow).map((minute) => minute + offset);
  const tomorrow = timeline.map((minute) => minute + 1440 + offset);
  return [...today, ...tomorrow].slice(0, count);
}

function getFallbackSlotsForLine(lineKey, count = 4, date = new Date(), offset = 0) {
  const meta = LINE_BY_KEY.get(lineKey);
  if (!meta) return [];

  const currentMinutes = date.getHours() * 60 + date.getMinutes() - offset;
  let slot = Number(meta.firstDeparture || 360);
  const interval = Math.max(8, Number(meta.interval || 25));

  while (slot < currentMinutes) {
    slot += interval;
  }

  const upcoming = [];
  for (let i = 0; i < count; i += 1) {
    upcoming.push(slot + offset);
    slot += interval;
  }
  return upcoming;
}

function uniqueSortedMinutes(minutes = []) {
  return Array.from(new Set(minutes)).sort((a, b) => a - b);
}

function normalizeScheduleHours(hours = []) {
  const unique = new Set();
  (Array.isArray(hours) ? hours : []).forEach((value) => {
    const minutes = parseHourToMinutes(value);
    if (minutes !== null) unique.add(minutes);
  });
  return Array.from(unique).sort((a, b) => a - b);
}

function pickOfficialTimeline(lineKey, date = new Date()) {
  const byDay = scheduleDataByLine.get(lineKey);
  if (!byDay) return [];
  const preferred = getCurrentDayType(date);
  if (preferred === 'LECTIVO') {
    return byDay.LECTIVO?.length
      ? byDay.LECTIVO
      : byDay.NO_LECTIVO?.length
        ? byDay.NO_LECTIVO
        : byDay.FESTIVO || [];
  }
  return byDay.FESTIVO?.length
    ? byDay.FESTIVO
    : byDay.NO_LECTIVO?.length
      ? byDay.NO_LECTIVO
      : byDay.LECTIVO || [];
}

async function loadOfficialSchedules(force = false) {
  if (officialSchedulesLoaded && !force) return scheduleDataByLine;
  if (officialSchedulesPromise && !force) return officialSchedulesPromise;

  officialSchedulesPromise = (async () => {
    const [linesResult, schedulesResult] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/lineas`),
      fetch(`${API_BASE_URL}/horarios`),
    ]);

    if (linesResult.status === 'fulfilled' && linesResult.value?.ok) {
      const payload = await linesResult.value.json();
      const lines = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      lines.forEach((line) => {
        if (line?.slug && Number.isFinite(Number(line?.idLinea))) {
          lineIdByKey.set(String(line.slug), Number(line.idLinea));
        }
      });
    }

    const lineKeyById = new Map(Array.from(lineIdByKey.entries()).map(([key, id]) => [id, key]));
    scheduleDataByLine.clear();

    if (schedulesResult.status === 'fulfilled' && schedulesResult.value?.ok) {
      const payload = await schedulesResult.value.json();
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

      rows.forEach((row) => {
        const lineId = Number(row?.idLinea);
        const lineKey = lineKeyById.get(lineId);
        if (!lineKey || !LINE_BY_KEY.has(lineKey)) return;

        const dayKey = String(row?.tipoDia || '').toUpperCase();
        if (!dayKey) return;

        const minutes = normalizeScheduleHours(row?.horas || []);
        if (!minutes.length) return;

        const current = scheduleDataByLine.get(lineKey) || {};
        current[dayKey] = minutes;
        scheduleDataByLine.set(lineKey, current);
      });
    }

    officialSchedulesLoaded = true;
    return scheduleDataByLine;
  })();

  try {
    return await officialSchedulesPromise;
  } finally {
    officialSchedulesPromise = null;
  }
}

function getUpcomingTimes(lineKey, count = 4, date = new Date(), options = {}) {
  const stopName = options?.stopName || '';
  const offsets = getStopOffsetsMinutes(lineKey, stopName);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const officialTimeline = pickOfficialTimeline(lineKey, date);
  const perOffsetCount = Math.max(count + 2, 4);
  const slots = [];

  offsets.forEach((offset) => {
    if (officialTimeline.length) {
      slots.push(...getNextSlotsFromTimeline(officialTimeline, currentMinutes, perOffsetCount, offset));
      return;
    }
    slots.push(...getFallbackSlotsForLine(lineKey, perOffsetCount, date, offset));
  });

  const nextSlots = uniqueSortedMinutes(slots).slice(0, count);
  if (nextSlots.length) {
    return nextSlots.map((minute) => formatMinutesToHour(minute));
  }

  return [];
}

function lineStartsAtStop(lineKey, stopName = '') {
  const stops = STOPS_BY_LINE[lineKey];
  if (!Array.isArray(stops) || !stops.length) return false;
  return normalizeStopToken(stops[0].name) === normalizeStopToken(stopName);
}

function getUpcomingDeparturesForStop(stopName = '', stopLineKeys = [], count = 4, date = new Date()) {
  const requested = Array.isArray(stopLineKeys) ? stopLineKeys : [];
  const uniqueLineKeys = Array.from(new Set(requested.filter((key) => LINE_BY_KEY.has(key))));
  const startAtStopLineKeys = uniqueLineKeys.filter((lineKey) => lineStartsAtStop(lineKey, stopName));
  const targetLineKeys = startAtStopLineKeys.length
    ? startAtStopLineKeys
    : uniqueLineKeys.length
      ? uniqueLineKeys
      : stateActiveLineFallback(stopName);

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const perLineCount = Math.max(count + 2, 4);
  const entries = targetLineKeys
    .flatMap((lineKey) => {
      const line = LINE_BY_KEY.get(lineKey);
      if (!line) return [];

      const times = getUpcomingTimes(lineKey, perLineCount, date, { stopName });
      return times.map((time) => {
        const parsed = parseHourToMinutes(time);
        const normalized = parsed === null ? Number.MAX_SAFE_INTEGER : parsed;
        const absolute = normalized >= currentMinutes ? normalized : normalized + 1440;
        return {
          time,
          absolute,
          lineKey,
          color: line.color,
          code: line.code,
          name: line.name
        };
      });
    })
    .filter(Boolean);

  if (!entries.length) return [];
  entries.sort((a, b) => a.absolute - b.absolute);
  return entries.slice(0, count).map(({ time, lineKey, color, code, name }) => ({
    time,
    lineKey,
    color,
    code,
    name
  }));
}

function stateActiveLineFallback(stopName = '') {
  if (activeLineKey && LINE_BY_KEY.has(activeLineKey)) {
    return [activeLineKey];
  }
  const inferred = inferLineByStopName(stopName);
  return inferred ? [inferred] : [];
}

function normalizeSearch(value = '') {
  return String(value).toLowerCase().trim();
}

function searchLine(term = '') {
  const query = normalizeSearch(term);
  if (!query) return null;

  let match = LINE_GROUPS.find((line) => line.code.toLowerCase() === query || line.key === query);
  if (match) return { ...match };

  match = LINE_GROUPS.find((line) => line.name.toLowerCase().includes(query));
  if (match) return { ...match };

  return null;
}

function searchStop(term = '') {
  const query = normalizeSearch(term);
  if (!query) return null;

  for (const [lineKey, stops] of Object.entries(STOPS_BY_LINE)) {
    const stop = stops.find((item) => item.name.toLowerCase().includes(query));
    if (stop) {
      return {
        lineKey,
        name: stop.name,
        coord: stop.coord
      };
    }
  }

  return null;
}

function focusStopByName(term = '') {
  const stop = searchStop(term);
  if (!stop) return null;

  if (LINE_BY_KEY.has(stop.lineKey)) {
    setActiveLine(stop.lineKey, { fit: false, emit: false });
  }

  map.easeTo({
    center: stop.coord,
    zoom: Math.max(map.getZoom(), 15),
    duration: 520
  });

  new mapboxgl.Popup({ closeButton: false, offset: 12 })
    .setLngLat(stop.coord)
    .setHTML(`<strong>${stop.name}</strong>`)
    .addTo(map);

  emitUiEvent('etxebus:map-stop-click', {
    lineKey: stop.lineKey,
    stopLineKeys: [stop.lineKey],
    stopName: stop.name,
    coordinates: stop.coord
  });

  return stop;
}

function getActiveLineKey() {
  return activeLineKey;
}

window.ETXEBUS_MAP_UI = {
  isReady: () => mapReady,
  getMap: () => map,
  getLinesMeta,
  getLineByKey,
  getStopsByLine,
  getActiveLineKey,
  isLineVisible,
  setLineVisible,
  setAllLinesVisible,
  setFilterState,
  getFilterState,
  setActiveLine,
  focusLine: setActiveLine,
  searchLine,
  searchStop,
  focusStopByName,
  getUpcomingTimes,
  getUpcomingDeparturesForStop,
  resetView,
  zoomIn,
  zoomOut
};

const ARROW_BLUE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAaklEQVR4nO2TwRHAIAgEgWbSoGXQYKpJnpkxk1EP8JPbv67LoAghJJV2XqtHLCxblGpI1uOH1hR+XdzGtfhIQanBQlCqIeGEQLpHacaqD/FHWlvo75HbTlmsEPyLtlOWVzghyqFiown5HzdzcCpDMj3R+gAAAABJRU5ErkJggg==';
const ARROW_YELLOW_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAaklEQVR4nO2TOxLAIAhEXZocy7PnWKm0jZNkgnxs3NfDYxkohRASSTuPNlsjXtmsFB7Zo1m9kJLwq7EmrXmlVqlYhVYpPEKVoI5DIeLU/8BNmpoQLyuXlTJXQusvykpZWEKNKISMiyZkQzqB3zcrE+J1PgAAAABJRU5ErkJggg==';
const ARROW_LIGHT_GREEN_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAbklEQVR4nO2TwRGAMAgEA2XYh+VQneXYh23o18noSA7Ix9t/slmGtEYIyWQ71nP0jEZlo1KJyHps2aWk8O1iTy08UlSqqBCVSkToEVj3KMlY9S/sJi0ttIeR60xZqBD9izpTllboEaVQsdGE/JALcDc3B0XgVmwAAAAASUVORK5CYII=';
const ARROW_GREEN_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAbklEQVR4nO2TwRGAMAgEA23YiV1ZiV3ZCXXo18noSA7Ix9t/slmGtEYIyWTZ13P0jEZlo1KJyHpsO6Sk8O1iTy08UlSqqBCVSkToEVj3KMlY9S/sJi0ttIeR60xZqBD9izpTllboEaVQsdGE/JALvZMzn94WUoEAAAAASUVORK5CYII=';
const ARROW_ORANGE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAZ0lEQVR4nO2TQQ7AIAgEgWfx//gtvTamjbigl+7cYVgCIoSQSlqXvltjWdmuVDOyGdd1PyjhV+NIWnilqNRQISrVjDAi8GkorTj1Ff6QHk3oLyu3m7JUQvQX7aasLGFEVMKJiybkhwyz9iwjimj4ZwAAAABJRU5ErkJggg==';
