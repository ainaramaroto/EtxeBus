// map.js
mapboxgl.accessToken = 'pk.eyJ1IjoiaW5pZ29maWF0IiwiYSI6ImNtZ3psb3JhMTBnc2gybHI0dzZpOWpqYnYifQ.wAcZcyjV9eSJYxHNsn7vfg';

// Centro correcto (lng, lat)
const CENTRO_ETXEBARRI = [-2.888064738494468, 43.24850496812509];

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: CENTRO_ETXEBARRI,
  zoom: 14
});

// === Paradas (lng, lat) ===
const paradasLinea1 = [
  { nombre: "L1 Metro Etxebarri", coord: [-2.8967772404717302, 43.24397173609036] },
  { nombre: "L1 Metacal Kalea", coord: [-2.8937088759947267, 43.24492992719602] },
  { nombre: "L1 Doneztebe Eliza", coord: [-2.891122115319937,  43.24598755268646] },
  { nombre: "L1 San Antonio Hiribidea", coord: [-2.8872862407224327, 43.24702874476444] },
  { nombre: "L1 Kukullaga Ikastetxea", coord: [-2.8861488323489226, 43.24901769897248] },
  { nombre: "L1 Kiroldegia", coord: [-2.8841071166975185, 43.25066808714677] },
  { nombre: "L1 Galicia Kalea", coord: [-2.883330180290336, 43.252660853827855] },
  { nombre: "L1 Galicia Kalea Goikoa", coord: [-2.882623819357687, 43.25345316885862] },
  { nombre: "L1 Santa Marina", coord: [-2.883024510937969, 43.255890099999405] },
  { nombre: "L1 IES Etxebarri BHI", coord: [-2.884890897506966, 43.25343406150203] },
  { nombre: "L1 Goiko San Antonio Hiribidea", coord: [-2.8839558722117618, 43.25103331923095] },
  { nombre: "L1 Marivi Iturbe Kalea", coord: [-2.886034033873555, 43.248992351853026] },
  { nombre: "L1 Beheko San Antonio Hiribidea", coord: [-2.8874842700078407, 43.24717715469667] },
  { nombre: "L1 Doneztebe Eliza", coord: [-2.8912215474404075, 43.246038806411484] },
  { nombre: "L1 Metacal Kalea", coord: [-2.893827387294854, 43.24495873405763] }
];

const LINEA2_POLIGONO_PARADAS = [
  { nombre: "L2 Fuenlabrada Kalea", coord: [-2.8937310550466755, 43.247315355022344] },
  { nombre: "L2 Errota/Molino", coord: [-2.8945549868126155, 43.24877093455157] },
  { nombre: "L2 Nerbioi", coord: [-2.8913247323607556, 43.251203598727216] },
  { nombre: "L2 La Fabrica", coord: [-2.893783993275475, 43.24925780608985] }
];
const FUENLABRADA_ENTRADA = [-2.894916, 43.246515];
const LINEA2_BOKETE_PARADAS = [
  { nombre: "L2 Lezama Legizamon", coord: [-2.896714203551309, 43.247736109456135] },
  { nombre: "L2 Tomás Meabe", coord: [-2.9001729580517575, 43.24544512460776] },
  { nombre: "L2 Zubialdea (El Boquete)", coord: [-2.904239398789997, 43.24439361613609] },
  { nombre: "L2 Zubialdea (El Boquete)", coord: [-2.9037884717608153, 43.24396966288082] },
  { nombre: "L2 Tomás Meabe", coord: [-2.9000632950565217, 43.245410025230086] },
  { nombre: "L2 Lezama Legizamon", coord: [-2.896459984789626, 43.24780509523457] },
  { nombre: "L2 Fuenlabrada Kalea", coord: [-2.8943843007617427, 43.246974801859636] }
];

const paradas = [...paradasLinea1, ...LINEA2_POLIGONO_PARADAS, ...LINEA2_BOKETE_PARADAS];

const METRO_COORD = paradasLinea1[0].coord;
const LINEA2_ROTONDA = [-2.895042288566618, 43.24848058651014];
const LINEA2_BOKETE_RETORNO = [-2.9046724606433934, 43.24462875070237];
const LINEA2_POLIGONO_COORDS = LINEA2_POLIGONO_PARADAS.map(p => p.coord);
const LINEA2_BOKETE_COORDS = LINEA2_BOKETE_PARADAS.map(p => p.coord);
const LINEA2_BOKETE_SEGMENT = [
  ...LINEA2_BOKETE_COORDS.slice(0, 3),
  LINEA2_BOKETE_RETORNO,
  ...LINEA2_BOKETE_COORDS.slice(3)
];
const LINEA2_POLIGONO_RUTA = [
  METRO_COORD,
  FUENLABRADA_ENTRADA,
  ...LINEA2_POLIGONO_COORDS,
  METRO_COORD
];
const LINEA2_BOKETE_LARGO_RUTA = [
  METRO_COORD,
  FUENLABRADA_ENTRADA,
  ...LINEA2_POLIGONO_COORDS,
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

// Puntos intermedios para forzar la rotonda y la entrada al parking del metro
const VUELTA_METRO_LOOP = [
  [-2.896769, 43.244994], // Acercamiento final al metro siguiendo el trazado de ida
  [-2.896929, 43.244753], // Entrada a la rotonda
  [-2.897663, 43.244142], // Giro interior de la rotonda
  [-2.897483, 43.244004]  // Entrada al parking del metro
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
// Mapbox solo admite PNG/JPEG para loadImage, asi que usamos pequeñas imagenes base64
const ARROW_BLUE_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAaklEQVR4nO2TwRHAIAgEgWbSoGXQYKpJnpkxk1EP8JPbv67LoAghJJV2XqtHLCxblGpI1uOH1hR+XdzGtfhIQanBQlCqIeGEQLpHacaqD/FHWlvo75HbTlmsEPyLtlOWVzghyqFiown5HzdzcCpDMj3R+gAAAABJRU5ErkJggg==';
const ARROW_YELLOW_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAaklEQVR4nO2TOxLAIAhEXZocy7PnWKm0jZNkgnxs3NfDYxkohRASSTuPNlsjXtmsFB7Zo1m9kJLwq7EmrXmlVqlYhVYpPEKVoI5DIeLU/8BNmpoQLyuXlTJXQusvykpZWEKNKISMiyZkQzqB3zcrE+J1PgAAAABJRU5ErkJggg==';
const ARROW_LIGHT_GREEN_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAbklEQVR4nO2TwRGAMAgEA2XYh+VQneXYh23o18noSA7Ix9t/slmGtEYIyWQ71nP0jEZlo1KJyHps2aWk8O1iTy08UlSqqBCVSkToEVj3KMlY9S/sJi0ttIeR60xZqBD9izpTllboEaVQsdGE/JALcDc3B0XgVmwAAAAASUVORK5CYII=';
const ARROW_GREEN_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAbklEQVR4nO2TwRGAMAgEA23YiV1ZiV3ZCXXo18noSA7Ix9t/slmGtEYIyWTZ13P0jEZlo1KJyHpsO6Sk8O1iTy08UlSqqBCVSkToEVj3KMlY9S/sJi0ttIeR60xZqBD9izpTllboEaVQsdGE/JALvZMzn94WUoEAAAAASUVORK5CYII=';
const ARROW_ORANGE_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAZ0lEQVR4nO2TQQ7AIAgEgWfx//gtvTamjbigl+7cYVgCIoSQSlqXvltjWdmuVDOyGdd1PyjhV+NIWnilqNRQISrVjDAi8GkorTj1Ff6QHk3oLyu3m7JUQvQX7aasLGFEVMKJiybkhwyz9iwjimj4ZwAAAABJRU5ErkJggg==';

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
  map.addSource('linea2-poligono',      { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
  map.addSource('linea2-bokete-largo',  { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
  map.addSource('linea2-bokete-corto',  { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });

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
  map.addLayer({
    id: 'linea2-poligono',
    type: 'line',
    source: 'linea2-poligono',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#2ECC40', 'line-width': 4 }
  });
  map.addLayer({
    id: 'linea2-bokete-largo',
    type: 'line',
    source: 'linea2-bokete-largo',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#1B8F3A', 'line-width': 4 }
  });
  map.addLayer({
    id: 'linea2-bokete-corto',
    type: 'line',
    source: 'linea2-bokete-corto',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#C6FF00', 'line-width': 4, 'line-dasharray': [3, 3] }
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
        "L1 Santa Marina",
        "L1 IES Etxebarri BHI",
        "L1 Goiko San Antonio Hiribidea",
        "L1 Marivi Iturbe Kalea",
        "L1 Beheko San Antonio Hiribidea",
        "L1 Doneztebe Eliza 2",
        "L1 Metacal Kalea 2",
        "L1 Metro Etxebarri"
      ];
      const vueltaWaypointsBase = vueltaOrdenNombres.map(coordByName).filter(Boolean);
      const vueltaWaypoints = vueltaWaypointsBase.length >= 2
        ? [
            ...vueltaWaypointsBase.slice(0, -1),
            ...VUELTA_METRO_LOOP,
            vueltaWaypointsBase[vueltaWaypointsBase.length - 1]
          ]
        : vueltaWaypointsBase;
      const vueltaGeom = await buildRouteFromWaypoints(vueltaWaypoints);
      map.getSource('ruta-vuelta').setData({ type: 'Feature', geometry: vueltaGeom });
    } catch (e) { console.error(e); }
  }

  // Línea 2 (Polígono, Bokete largo y corto)
  try {
    if (LINEA2_POLIGONO_RUTA.length >= 2) {
      const poligonoGeom = await buildRouteFromWaypoints(LINEA2_POLIGONO_RUTA);
      map.getSource('linea2-poligono').setData({ type: 'Feature', geometry: poligonoGeom });
    }
    if (LINEA2_BOKETE_LARGO_RUTA.length >= 2) {
      const boketeLargoGeom = await buildRouteFromWaypoints(LINEA2_BOKETE_LARGO_RUTA);
      map.getSource('linea2-bokete-largo').setData({ type: 'Feature', geometry: boketeLargoGeom });
    }
    if (LINEA2_BOKETE_CORTO_RUTA.length >= 2) {
      const boketeCortoGeom = await buildRouteFromWaypoints(LINEA2_BOKETE_CORTO_RUTA);
      map.getSource('linea2-bokete-corto').setData({ type: 'Feature', geometry: boketeCortoGeom });
    }
  } catch (error) {
    console.error('No se pudieron dibujar las variantes de la línea 2', error);
  }

  // Flechas sobre las líneas
  try {
    await Promise.all([
      loadImagePromise(map, ARROW_BLUE_PNG,        'flecha-azul'),
      loadImagePromise(map, ARROW_YELLOW_PNG,      'flecha-amarilla'),
      loadImagePromise(map, ARROW_LIGHT_GREEN_PNG, 'flecha-verde-claro'),
      loadImagePromise(map, ARROW_GREEN_PNG,       'flecha-verde'),
      loadImagePromise(map, ARROW_ORANGE_PNG,      'flecha-naranja')
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
