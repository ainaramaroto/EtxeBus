const { services, requestTimeoutMs } = require('../config');
const createHttpClient = require('./httpClient');

const client = createHttpClient({
  baseURL: services.transporte,
  timeout: requestTimeoutMs,
});

async function listFavoritos(query = {}) {
  const { data } = await client.get('/favoritos', { params: query });
  return data;
}

async function crearFavorito(payload) {
  const { data } = await client.post('/favoritos', payload);
  return data;
}

async function eliminarFavorito(id, query = {}) {
  await client.delete(`/favoritos/${id}`, { params: query });
}

module.exports = {
  listFavoritos,
  crearFavorito,
  eliminarFavorito,
};
