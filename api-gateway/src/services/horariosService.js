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

async function obtenerHorario(id) {
  const { data } = await client.get(`/horarios/${id}`);
  return data;
}

async function crearHorario(payload) {
  const { data } = await client.post('/horarios', payload);
  return data;
}

async function actualizarHorario(id, payload) {
  const { data } = await client.put(`/horarios/${id}`, payload);
  return data;
}

async function eliminarHorario(id) {
  const { data } = await client.delete(`/horarios/${id}`);
  return data;
}

module.exports = {
  listHorarios,
  listHorariosPublicados,
  obtenerHorario,
  crearHorario,
  actualizarHorario,
  eliminarHorario,
};
