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

async function listParadas(params = {}) {
  const { data } = await client.get('/paradas', { params });
  return unwrap(data);
}

async function obtenerParada(id) {
  const { data } = await client.get(`/paradas/${id}`);
  return unwrap(data);
}

module.exports = {
  listLineas,
  obtenerLinea,
  listParadas,
  obtenerParada,
};
