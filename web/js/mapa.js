// map.js
mapboxgl.accessToken = 'pk.eyJ1IjoiaW5pZ29maWF0IiwiYSI6ImNtZ3psb3JhMTBnc2gybHI0dzZpOWpqYnYifQ.wAcZcyjV9eSJYxHNsn7vfg';

// Centro correcto (lng, lat)
const CENTRO_ETXEBARRI = [-2.888064738494468, 43.24850496812509];

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: CENTRO_ETXEBARRI,
  zoom: 14
});

// === Paradas (lng, lat) ===
const paradas = [
  { nombre: "Parada Metro Etxebarri", coord: [-2.8967772404717302, 43.24397173609036] },
  { nombre: "Parada Metacal Kalea", coord: [-2.8937088759947267, 43.24492992719602] },
  { nombre: "Parada Doneztebe Eliza", coord: [-2.891122115319937,  43.24598755268646] },
  { nombre: "Parada San Antonio Hiribidea", coord: [-2.8872862407224327, 43.24702874476444] },
  { nombre: "Parada Kukullaga Ikastetxea", coord: [-2.8861488323489226, 43.24901769897248] },
  { nombre: "Parada Kiroldegia", coord: [-2.8841071166975185, 43.25066808714677] },
  { nombre: "Parada Galicia Kalea", coord: [-2.883330180290336, 43.252660853827855] },
  { nombre: "Parada Galicia Kalea 2", coord: [-2.882623819357687, 43.25345316885862] },
  { nombre: "Parada Santa Marina", coord: [-2.883024510937969, 43.255890099999405] },
  { nombre: "Parada IES Etxebarri BHI", coord: [-2.884890897506966, 43.25343406150203] },
  { nombre: "Parada Goiko San Antonio Hiribidea", coord: [-2.8839558722117618, 43.25103331923095] },
  { nombre: "Parada Marivi Iturbe Kalea", coord: [-2.886034033873555, 43.248992351853026] },
  { nombre: "Parada Beheko San Antonio Hiribidea", coord: [-2.8874842700078407, 43.24717715469667] },
  { nombre: "Parada Doneztebe Eliza 2", coord: [-2.8912215474404075, 43.246038806411484] },
  { nombre: "Parada Metacal Kalea 2", coord: [-2.893827387294854, 43.24495873405763] }
];

// ===== Helpers Directions API =====
async function fetchRouteSegment(coords) {
  const coordStr = coords.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
              `?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${mapboxgl.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.routes?.length) throw new Error('No se pudo obtener la ruta');
  return data.routes[0].geometry; // LineString
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
      if (merged[merged.length - 1][0] === coords[0][0] &&
          merged[merged.length - 1][1] === coords[0][1]) merged.push(...coords.slice(1));
      else merged.push(...coords);
    }
  }
  return { type: 'LineString', coordinates: merged };
}

// Cargar flechas como iconos
function loadImagePromise(map, url, name, options = {}) {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (err, img) => {
      if (err) return reject(err);
      if (!map.hasImage(name)) map.addImage(name, img, options);
      resolve();
    });
  });
}
const ARROW_BLUE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <path d="M3 12h14l-4.5-4.5 1.4-1.4L21 12l-7.1 5.9-1.4-1.4L17 12H3z" fill="#0074D9"/>
  </svg>`);
const ARROW_YELLOW_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <path d="M3 12h14l-4.5-4.5 1.4-1.4L21 12l-7.1 5.9-1.4-1.4L17 12H3z" fill="#FFC107"/>
  </svg>`);

// Utilidades
function sliceWaypoints(aIdx, bIdx) {
  if (aIdx <= bIdx) return paradas.slice(aIdx, bIdx + 1).map(p => p.coord);
  return paradas.slice(bIdx, aIdx + 1).map(p => p.coord).reverse();
}
function coordByName(name) {
  const idx = paradas.findIndex(p => p.nombre.toLowerCase() === name.toLowerCase());
  return idx === -1 ? null : paradas[idx].coord;
}

map.on('load', async () => {
  map.setCenter(CENTRO_ETXEBARRI);
  map.setZoom(14);

  // ====== Rutas ida/vuelta ======
  map.addSource('ruta-ida',    { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
  map.addSource('ruta-vuelta', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });

  map.addLayer({
    id: 'linea-ida',
    type: 'line',
    source: 'ruta-ida',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#0074D9', 'line-width': 4 }
  });
  map.addLayer({
    id: 'linea-vuelta',
    type: 'line',
    source: 'ruta-vuelta',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#FFC107', 'line-width': 4, 'line-dasharray': [2, 2] }
  });

  // Cálculo de rutas
  const idxMetro = paradas.findIndex(p => p.nombre.toLowerCase().includes('metro etxebarri'));
  const idxSanta = paradas.findIndex(p => p.nombre.toLowerCase().includes('santa marina'));

  if (idxMetro !== -1 && idxSanta !== -1) {
    try {
      // IDA: Metro → Santa Marina (directo)
      const idaWaypoints = sliceWaypoints(idxMetro, idxSanta);
      const idaGeom = await buildRouteFromWaypoints(idaWaypoints);
      map.getSource('ruta-ida').setData({ type: 'Feature', geometry: idaGeom });

      // VUELTA: Santa Marina → IES → Goiko→ Metro
      const vueltaOrdenNombres = [
        "Parada Santa Marina",
        "Parada IES Etxebarri BHI",
        "Parada Goiko San Antonio Hiribidea",
        "Parada Marivi Iturbe Kalea",
        "Parada Beheko San Antonio Hiribidea",
        "Parada Doneztebe Eliza 2",
        "Parada Metacal Kalea 2",
        "Parada Metro Etxebarri"
      ];
      const vueltaWaypoints = vueltaOrdenNombres.map(coordByName).filter(Boolean);
      const vueltaGeom = await buildRouteFromWaypoints(vueltaWaypoints);
      map.getSource('ruta-vuelta').setData({ type: 'Feature', geometry: vueltaGeom });
    } catch (e) { console.error(e); }
  }

  // Flechas sobre las líneas
  try {
    await Promise.all([
      loadImagePromise(map, ARROW_BLUE_SVG,   'flecha-azul'),
      loadImagePromise(map, ARROW_YELLOW_SVG, 'flecha-amarilla')
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
  } catch (error) {
    console.warn('No se pudieron cargar las flechas de dirección', error);
  }

  // ====== PARADAS como capa GeoJSON para asegurar visibilidad ======
  const paradasGeoJSON = {
    type: 'FeatureCollection',
    features: paradas.map((p, idx) => ({
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

  // Agrupaciones de paradas cercanas
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
    paint: {
      'text-color': '#ffffff'
    }
  });

  // Puntos individuales (cuando se rompe el cluster)
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

  map.addLayer({
    id: 'paradas-iconos',
    type: 'symbol',
    source: 'paradas',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': 'bus-15',
      'icon-size': 0.5,
      'icon-offset': [0, -1],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    },
    paint: {}
  });

  console.log(`Paradas dibujadas: ${paradas.length}`);
  ['paradas-puntos', 'paradas-clusters'].forEach((layerId) => {
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
  });
  map.on('click', 'paradas-puntos', (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;
    new mapboxgl.Popup({ offset: 16 })
      .setLngLat(feature.geometry.coordinates)
      .setText(feature.properties.nombre)
      .addTo(map);
  });
  map.on('click', 'paradas-clusters', (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;
    const clusterId = feature.properties.cluster_id;
    const source = map.getSource('paradas');
    if (!source || !source.getClusterExpansionZoom) return;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      map.easeTo({
        center: feature.geometry.coordinates,
        zoom
      });
    });
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
});
