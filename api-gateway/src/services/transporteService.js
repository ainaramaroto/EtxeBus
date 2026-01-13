const { services, requestTimeoutMs } = require('../config');
const createHttpClient = require('./httpClient');

const client = createHttpClient({
  baseURL: services.transporte,
  timeout: requestTimeoutMs,
});

function unwrap(payload) {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
}

async function listLineas(params = {}) {
  const { data } = await client.get('/lineas', { params });
  return unwrap(data);
}

async function obtenerLinea(id) {
  const { data } = await client.get(`/lineas/${id}`);
  return unwrap(data);
}

async function crearLinea(payload) {
  const { data } = await client.post('/lineas', payload);
  return unwrap(data);
}

async function actualizarLinea(id, payload) {
  const { data } = await client.put(`/lineas/${id}`, payload);
  return unwrap(data);
}

async function eliminarLinea(id) {
  const { data } = await client.delete(`/lineas/${id}`);
  return unwrap(data);
}

async function listParadas(params = {}) {
  const { data } = await client.get('/paradas', { params });
  return unwrap(data);
}

async function obtenerParada(id) {
  const { data } = await client.get(`/paradas/${id}`);
  return unwrap(data);
}

async function crearParada(payload) {
  const { data } = await client.post('/paradas', payload);
  return unwrap(data);
}

async function actualizarParada(id, payload) {
  const { data } = await client.put(`/paradas/${id}`, payload);
  return unwrap(data);
}

async function eliminarParada(id) {
  const { data } = await client.delete(`/paradas/${id}`);
  return unwrap(data);
}

async function listTrayectos(params = {}) {
  const { data } = await client.get('/trayectos', { params });
  return unwrap(data);
}

async function obtenerTrayecto(id) {
  const { data } = await client.get(`/trayectos/${id}`);
  return unwrap(data);
}

async function crearTrayecto(payload) {
  const { data } = await client.post('/trayectos', payload);
  return unwrap(data);
}

async function actualizarTrayecto(id, payload) {
  const { data } = await client.put(`/trayectos/${id}`, payload);
  return unwrap(data);
}

async function eliminarTrayecto(id) {
  const { data } = await client.delete(`/trayectos/${id}`);
  return unwrap(data);
}

async function listTrayectosParadas(params = {}) {
  const { data } = await client.get('/trayectos-paradas', { params });
  return unwrap(data);
}

async function obtenerTrayectoParada(routeId, stopId) {
  const { data } = await client.get(`/trayectos-paradas/${routeId}/${stopId}`);
  return unwrap(data);
}

async function crearTrayectoParada(payload) {
  const { data } = await client.post('/trayectos-paradas', payload);
  return unwrap(data);
}

async function actualizarTrayectoParada(routeId, stopId, payload) {
  const { data } = await client.put(`/trayectos-paradas/${routeId}/${stopId}`, payload);
  return unwrap(data);
}

async function eliminarTrayectoParada(routeId, stopId) {
  const { data } = await client.delete(`/trayectos-paradas/${routeId}/${stopId}`);
  return unwrap(data);
}

module.exports = {
  listLineas,
  obtenerLinea,
  crearLinea,
  actualizarLinea,
  eliminarLinea,
  listParadas,
  obtenerParada,
  crearParada,
  actualizarParada,
  eliminarParada,
  listTrayectos,
  obtenerTrayecto,
  crearTrayecto,
  actualizarTrayecto,
  eliminarTrayecto,
  listTrayectosParadas,
  obtenerTrayectoParada,
  crearTrayectoParada,
  actualizarTrayectoParada,
  eliminarTrayectoParada,
};
