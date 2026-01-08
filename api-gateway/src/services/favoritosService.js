const { services, requestTimeoutMs } = require('../config');
const createHttpClient = require('./httpClient');

const client = createHttpClient({
  baseURL: services.usuarios,
  timeout: requestTimeoutMs,
});

function unwrap(payload) {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
}

async function listFavoritos(query = {}) {
  const { data } = await client.get('/favoritos', { params: query });
  return unwrap(data);
}

async function crearFavorito(payload) {
  const { data } = await client.post('/favoritos', payload);
  return unwrap(data);
}

async function eliminarFavorito(id, query = {}) {
  await client.delete(`/favoritos/${id}`, { params: query });
}

module.exports = {
  listFavoritos,
  crearFavorito,
  eliminarFavorito,
};
