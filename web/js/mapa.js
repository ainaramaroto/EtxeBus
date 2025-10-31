// map.js

mapboxgl.accessToken = 'pk.eyJ1IjoiaW5pZ29maWF0IiwiYSI6ImNtZ3psb3JhMTBnc2gybHI0dzZpOWpqYnYifQ.wAcZcyjV9eSJYxHNsn7vfg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-3.0095, 43.3369],
  zoom: 13
});

const ruta = [
  [ -3.00814437757425, 43.34526151224117 ],
  [ -3.0095680603902406, 43.336891888544486 ],
  [ -3.014065966439262, 43.322421299815026 ]
];

map.on('load', () => {
  // Añadir la ruta
  map.addSource('ruta1', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: ruta
      }
    }
  });

  map.addLayer({
    id: 'linea-ruta1',
    type: 'line',
    source: 'ruta1',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#0074D9',
      'line-width': 4
    }
  });

  // Añadir paradas como marcadores
  const paradas = [
    { nombre: "Parada A", coord: [ -3.00814437757425, 43.34526151224117 ] },
    { nombre: "Parada B", coord: [ -3.0095680603902406, 43.336891888544486 ] },
    { nombre: "Parada C", coord: [ -3.014065966439262, 43.322421299815026 ] }
  ];

  paradas.forEach(parada => {
    new mapboxgl.Marker({ color: 'red' })
      .setLngLat(parada.coord)
      .setPopup(new mapboxgl.Popup().setText(parada.nombre))
      .addTo(map);
  });
});
