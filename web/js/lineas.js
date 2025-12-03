mapboxgl.accessToken = 'pk.eyJ1IjoiaW5pZ29maWF0IiwiYSI6ImNtZ3psb3JhMTBnc2gybHI0dzZpOWpqYnYifQ.wAcZcyjV9eSJYxHNsn7vfg';

const LINES_DATA = {
  'l1-metro': {
    name: 'Metro',
    badge: 'Linea 1',
    subtitle: 'Metro -> Santa Marina',
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
    subtitle: 'Santa Marina -> Metro',
    color: '#FFC107',
    info: 'Recorre el casco urbano y baja hacia el metro pasando por los centros escolares.',
    stops: [
      'L1 Santa Marina',
      'L1 IES Etxebarri BHI',
      'L1 Goiko San Antonio Hiribidea',
      'L1 Marivi Iturbe Kalea',
      'L1 Beheko San Antonio Hiribidea',
      'L1 Doneztebe Eliza 2',
      'L1 Metacal Kalea 2',
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
      'L2 Nerbioi',
      'L2 La Fabrica',
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
  [-2.8913247323607556, 43.251203598727216],
  [-2.893783993275475, 43.24925780608985]
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

const routeCache = {};
let miniMap;
let miniMapReady = false;
let pendingLineKey = 'l1-metro';
let pendingColor = LINES_DATA['l1-metro'].color;
const METRO_POINT = { coord: METRO_COORD, label: 'Metro', anchorTop: true };
const SANTA_POINT = { coord: [-2.883024510937969, 43.255890099999405], label: 'Santa Marina' };
const POLIGONO_POINT = { coord: [-2.8928, 43.2496], label: 'Poligono' };
const BOKETE_POINT = { coord: [-2.9039, 43.2441], label: 'Bokete' };
const ROTONDA_POINT = { coord: LINEA2_ROTONDA, label: '', anchorTop: false };
const LINE_MARKERS = {
  'l1-metro': [METRO_POINT, SANTA_POINT],
  'l1-santamarina': [SANTA_POINT, METRO_POINT],
  'l2-labur': [METRO_POINT, BOKETE_POINT],
  'l2-luze': [METRO_POINT, POLIGONO_POINT, BOKETE_POINT]
};

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.line-btn');
  const detail = document.getElementById('line-detail');
  const pill = document.getElementById('line-pill');
  const nameEl = document.getElementById('line-name');
  const descEl = document.getElementById('line-description');
  const infoEl = document.getElementById('line-info');
  const typeEl = document.getElementById('line-type');
  const stopsEl = document.getElementById('line-stops');

  buttons.forEach((btn) => {
    const data = LINES_DATA[btn.dataset.line];
    if (data) btn.style.setProperty('--accent', data.color);
  });

  function renderLine(key) {
    const line = LINES_DATA[key];
    if (!line) return;

    detail.style.setProperty('--line-color', line.color);
    pill.textContent = line.badge || line.name;
    pill.style.background = line.color;
    pill.style.color = '#fff';
    nameEl.textContent = line.name;
    descEl.textContent = line.subtitle;
    typeEl.textContent = line.subtitle;
    infoEl.textContent = line.info;

    stopsEl.innerHTML = '';
    line.stops.forEach((stop) => {
      const li = document.createElement('li');
      li.textContent = stop.replace(/^L\d\s/, '');
      stopsEl.appendChild(li);
    });

    buttons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.line === key));
    pendingLineKey = key;
    pendingColor = line.color;
    updateMiniMap(key, line.color);
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => renderLine(btn.dataset.line));
  });

  renderLine('l1-metro');
  initMiniMap();
});

function initMiniMap() {
  const container = document.getElementById('mini-map');
  if (!container) return;

  miniMap = new mapboxgl.Map({
    container: 'mini-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-2.8945, 43.2478],
    zoom: 14,
    attributionControl: false,
    interactive: false,
    logoPosition: 'bottom-right'
  });

  miniMap.on('load', () => {
    miniMapReady = true;
    miniMap.addSource('line-preview', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
    });
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
    miniMap.addSource('line-stops', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
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
    miniMap.addLayer({
      id: 'line-stops-labels',
      type: 'symbol',
      source: 'line-stops',
      filter: ['==', ['get', 'label'], true],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#0b2447',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });
    updateMiniMap(pendingLineKey, pendingColor);
  });
}

async function updateMiniMap(key, color) {
  if (!miniMapReady) return;
  const geometry = await getRouteGeometry(key);
  if (!geometry) return;

  const source = miniMap.getSource('line-preview');
  if (!source) return;
  source.setData({ type: 'Feature', geometry });
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
  const coords = LINE_WAYPOINTS[key];
  if (!coords || coords.length < 2) return null;
  const geometry = await buildRouteFromWaypoints(coords);
  routeCache[key] = geometry;
  return geometry;
}

function updateStopMarkers(key) {
  const source = miniMap.getSource('line-stops');
  if (!source) return;
  const markers = LINE_MARKERS[key] || [];
  const features = markers.map((m) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: m.coord },
    properties: { name: m.label || '', label: Boolean(m.label) }
  }));
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
