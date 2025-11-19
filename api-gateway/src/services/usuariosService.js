const { services, requestTimeoutMs } = require('../config');
const createHttpClient = require('./httpClient');

const client = createHttpClient({
  baseURL: services.usuarios,
  timeout: requestTimeoutMs,
});

async function listUsuarios(query = {}) {
  const { data } = await client.get('/usuarios', { params: query });
  return data;
}

async function obtenerUsuario(id) {
  const { data } = await client.get(`/usuarios/${id}`);
  return data;
}

async function crearUsuario(payload) {
  const { data } = await client.post('/usuarios', payload);
  return data;
}

async function actualizarUsuario(id, payload) {
  const { data } = await client.put(`/usuarios/${id}`, payload);
  return data;
}

async function eliminarUsuario(id) {
  const { data } = await client.delete(`/usuarios/${id}`);
  return data;
}

async function loginUsuario(payload) {
  const { data } = await client.post('/auth/login', payload);
  return data;
}

module.exports = {
  listUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
};
