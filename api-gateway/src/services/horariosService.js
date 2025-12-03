const { services, requestTimeoutMs } = require('../config');
const createHttpClient = require('./httpClient');

const client = createHttpClient({
  baseURL: services.transporte,
  timeout: requestTimeoutMs,
});

async function listHorarios(query = {}) {
  const { data } = await client.get('/horarios', { params: query });
  return data;
}

async function listHorariosPublicados() {
  const { data } = await client.get('/horarios/publicados');
  return data;
}

module.exports = {
  listHorarios,
  listHorariosPublicados,
};
