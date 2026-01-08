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

async function listUsuarios(query = {}) {
  const { data } = await client.get('/usuarios', { params: query });
  return unwrap(data);
}

async function obtenerUsuario(id) {
  const { data } = await client.get(`/usuarios/${id}`);
  return unwrap(data);
}

async function crearUsuario(payload) {
  const { data } = await client.post('/usuarios', payload);
  return unwrap(data);
}

async function actualizarUsuario(id, payload) {
  const { data } = await client.put(`/usuarios/${id}`, payload);
  return unwrap(data);
}

async function eliminarUsuario(id) {
  const { data } = await client.delete(`/usuarios/${id}`);
  return unwrap(data);
}

async function loginUsuario(payload) {
  const { data } = await client.post('/auth/login', payload);
  return unwrap(data);
}

module.exports = {
  listUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
};
