// mapa.js
mapboxgl.accessToken = 'pk.eyJ1IjoiaW5pZ29maWF0IiwiYSI6ImNtZ3psb3JhMTBnc2gybHI0dzZpOWpqYnYifQ.wAcZcyjV9eSJYxHNsn7vfg';

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
const CENTRO_ETXEBARRI = [-2.888064738494468, 43.24850496812509];

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
  { nombre: 'L1 Marivi Iturbe Kalea', coord: d(-2.886034033873555, 43.248992351853026) },
  { nombre: 'L1 Beheko San Antonio Hiribidea', coord: d(-2.8874842700078407, 43.24717715469667) },
  { nombre: 'L1 Doneztebe Eliza 2', coord: d(-2.8912215474404075, 43.246038806411484) },
  { nombre: 'L1 Metacal Kalea 2', coord: d(-2.893827387294854, 43.24495873405763) }
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
  { nombre: 'L2 Zubialdea (El Boquete) 2', coord: d(-2.9037884717608153, 43.24396966288082) },
  { nombre: 'L2 Tomas Meabe 2', coord: d(-2.9000632950565217, 43.245410025230086) },
  { nombre: 'L2 Lezama Legizamon 2', coord: d(-2.896459984789626, 43.24780509523457) },
  { nombre: 'L2 Fuenlabrada Kalea', coord: d(-2.8943843007617427, 43.246974801859636) }
];

const METRO_COORD = PARADAS_LINEA1[0].coord;
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
  { id: 'ruta-ida', waypoints: L1_METRO_ROUTE, color: '#0074D9' },
  { id: 'ruta-vuelta', waypoints: L1_SANTA_ROUTE, color: '#FFC107', dash: [2, 2] },
  { id: 'linea2-poligono', waypoints: LINEA2_POLIGONO_RUTA, color: '#2ECC40' },
  { id: 'linea2-bokete-largo', waypoints: LINEA2_BOKETE_LARGO_RUTA, color: '#1B8F3A' },
  { id: 'linea2-bokete-corto', waypoints: LINEA2_BOKETE_CORTO_RUTA, color: '#C6FF00', dash: [3, 3] }
];

const NETWORK_COORDS = [
  ...L1_METRO_ROUTE,
  ...L1_SANTA_ROUTE,
  ...LINEA2_POLIGONO_RUTA,
  ...LINEA2_BOKETE_LARGO_RUTA,
  ...LINEA2_BOKETE_CORTO_RUTA
];
const NETWORK_VIEW_BOUNDS = calculateBoundsFromCoords(NETWORK_COORDS, 0.001);
const NETWORK_LIMIT_BOUNDS = calculateBoundsFromCoords(NETWORK_COORDS, 0.0018);
const MAX_ALLOWED_ZOOM = 20;
const MIN_BASE_ZOOM = 12.4;
const routeCache = {};
const PRECOMPUTED_ROUTES = window.ETXEBUS_PRECOMPUTED_ROUTES || {};
const VIEWPORT_LIMIT_BOUNDS = [
  [-2.9395, 43.226],
  [-2.84, 43.267]
];

ROUTE_DEFINITIONS.forEach((route) => {
  if (Array.isArray(PRECOMPUTED_ROUTES[route.id])) {
    route.precomputed = PRECOMPUTED_ROUTES[route.id];
  }
});

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

const ACTIVE_BOUNDS = VIEWPORT_LIMIT_BOUNDS || NETWORK_LIMIT_BOUNDS;
if (ACTIVE_BOUNDS) {
  map.setMaxBounds(ACTIVE_BOUNDS);
}

configureMapInteractions(map);

map.on('load', async () => {
  applyMutedMapStyle(map);
  lockInitialView(map);

  await drawNetworkLines();
  await addArrowLayers();

  const paradasGeoJSON = {
    type: 'FeatureCollection',
    features: [...PARADAS_LINEA1, ...PARADAS_LINEA2_POLIGONO, ...PARADAS_LINEA2_BOKETE].map((p, idx) => ({
      type: 'Feature',
      properties: { nombre: p.nombre, id: idx },
      geometry: { type: 'Point', coordinates: p.coord }
    }))
  };

  map.addSource('paradas', {
    type: 'geojson',
    data: paradasGeoJSON,
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
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        12,
        5, 16,
        10, 20
      ],
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
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        11, 3,
        14, 5,
        17, 7
      ],
      'circle-color': '#e53935',
      'circle-opacity': 0.95,
      'circle-stroke-width': 1.4,
      'circle-stroke-color': '#ffffff'
    }
  });

  const zoomControl = new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false });
  map.addControl(zoomControl, 'top-right');

  map.on('click', 'paradas-puntos', (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;
    const coordinates = feature.geometry.coordinates.slice();
    const nombre = feature.properties?.nombre || 'Parada';
    new mapboxgl.Popup({ closeButton: false, offset: 12 })
      .setLngLat(coordinates)
      .setHTML(`<strong>${nombre}</strong>`)
      .addTo(map);
  });

  map.on('mouseenter', 'paradas-puntos', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'paradas-puntos', () => {
    map.getCanvas().style.cursor = '';
  });
});

function lockInitialView(instance) {
  if (!NETWORK_VIEW_BOUNDS || !instance) return;
  instance.fitBounds(NETWORK_VIEW_BOUNDS, {
    padding: { top: 32, bottom: 32, left: 32, right: 32 },
    maxZoom: 15.2,
    duration: 0
  });
  const fittedZoom = instance.getZoom();
  instance.setMinZoom(fittedZoom);
  instance.setMaxZoom(Math.min(fittedZoom + 6, MAX_ALLOWED_ZOOM));
}

function addStaticLine(id, coordinates, { color, dash } = {}) {
  map.addSource(id, {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates } }
  });
  map.addLayer({
    id,
    type: 'line',
    source: id,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': color || '#0074D9',
      'line-width': 4,
      ...(dash ? { 'line-dasharray': dash } : {})
    }
  });
}

async function drawNetworkLines() {
  await Promise.all(
    ROUTE_DEFINITIONS.map(async (route) => {
      const coordinates = await getRouteCoordinates(route);
      if (!coordinates || coordinates.length < 2) return;
      console.info(`[Mapa principal] Ruta ${route.id} usando ${coordinates.length} puntos`);
      addStaticLine(route.id, coordinates, { color: route.color, dash: route.dash });
    })
  );
}

async function getRouteCoordinates(route) {
  if (Array.isArray(route.precomputed) && route.precomputed.length > 1) {
    return route.precomputed;
  }
  try {
    const geometry = await getRouteGeometry(route.id, route.waypoints);
    if (geometry) return geometry.coordinates;
  } catch (error) {
    console.warn(`No se pudo obtener ruta "${route.id}" desde Directions:`, error);
  }
  console.warn(`[Mapa principal] Usando coordenadas originales para ${route.id}`);
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
    map.addLayer({
      id: 'flechas-ida',
      type: 'symbol',
      source: 'ruta-ida',
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 50, 'icon-image': 'flecha-azul', 'icon-size': 0.8 }
    });
    map.addLayer({
      id: 'flechas-vuelta',
      type: 'symbol',
      source: 'ruta-vuelta',
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 50, 'icon-image': 'flecha-amarilla', 'icon-size': 0.8 }
    });
    map.addLayer({
      id: 'flechas-linea2-poligono',
      type: 'symbol',
      source: 'linea2-poligono',
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 50, 'icon-image': 'flecha-verde', 'icon-size': 0.8 }
    });
    map.addLayer({
      id: 'flechas-linea2-bokete-largo',
      type: 'symbol',
      source: 'linea2-bokete-largo',
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 50, 'icon-image': 'flecha-verde-claro', 'icon-size': 0.8 }
    });
    map.addLayer({
      id: 'flechas-linea2-bokete-corto',
      type: 'symbol',
      source: 'linea2-bokete-corto',
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 50, 'icon-image': 'flecha-naranja', 'icon-size': 0.8 }
    });
  } catch (error) {
    console.warn('No se pudieron cargar las flechas de dirección', error);
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
