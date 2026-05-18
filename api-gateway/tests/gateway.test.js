const request = require('supertest');

jest.mock('../src/services/usuariosService', () => ({
  listUsuarios: jest.fn(),
  loginUsuario: jest.fn(),
  logoutUsuario: jest.fn(),
}));

jest.mock('../src/services/favoritosService', () => ({
  listFavoritos: jest.fn(),
  obtenerFavorito: jest.fn(),
  crearFavorito: jest.fn(),
  actualizarFavorito: jest.fn(),
  eliminarFavorito: jest.fn(),
}));

jest.mock('../src/services/transporteService', () => ({
  listLineas: jest.fn(),
}));

jest.mock('../src/services/metroService', () => ({
  getUpcomingDepartures: jest.fn(),
}));

const usuariosService = require('../src/services/usuariosService');
const favoritosService = require('../src/services/favoritosService');
const transporteService = require('../src/services/transporteService');
const metroService = require('../src/services/metroService');
const { app } = require('../src/server');

function buildError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

describe('api-gateway tests basicos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/health devuelve estado del servicio', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'api-gateway',
    });
  });

  test('GET /api/usuarios devuelve usuarios desde el servicio mockeado', async () => {
    const users = [{ idUsuario: 1, nomUsuario: 'ainara' }];
    usuariosService.listUsuarios.mockResolvedValue(users);

    const response = await request(app).get('/api/usuarios');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: users });
    expect(usuariosService.listUsuarios).toHaveBeenCalledTimes(1);
  });

  test('POST /api/usuarios/login propaga 401', async () => {
    usuariosService.loginUsuario.mockRejectedValue(
      buildError(401, 'Credenciales invalidas')
    );

    const response = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'foo@bar.com', contrasenia: 'bad-pass' });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Credenciales invalidas');
  });

  test('POST /api/usuarios/logout devuelve confirmacion de cierre de sesion', async () => {
    usuariosService.logoutUsuario.mockResolvedValue({ loggedOut: true });

    const response = await request(app).post('/api/usuarios/logout').send({ idUsuario: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { loggedOut: true } });
    expect(usuariosService.logoutUsuario).toHaveBeenCalledWith({ idUsuario: 1 });
  });

  test('POST /api/favoritos propaga 400', async () => {
    favoritosService.crearFavorito.mockRejectedValue(
      buildError(400, 'idUsuario requerido')
    );

    const response = await request(app)
      .post('/api/favoritos')
      .send({ tipo: 'trayecto' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('idUsuario requerido');
  });

  test('GET /api/favoritos/:id devuelve favorito por id', async () => {
    const favorito = { idPreferencia: 7, idUsuario: 1, tipo: 'trayecto' };
    favoritosService.obtenerFavorito.mockResolvedValue(favorito);

    const response = await request(app).get('/api/favoritos/7?idUsuario=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: favorito });
    expect(favoritosService.obtenerFavorito).toHaveBeenCalledWith('7', { idUsuario: '1' });
  });

  test('PUT /api/favoritos/:id actualiza favorito', async () => {
    const actualizado = {
      idPreferencia: 7,
      idUsuario: 1,
      tipo: 'trayecto',
      destination_label: 'San Antonio',
    };
    favoritosService.actualizarFavorito.mockResolvedValue(actualizado);

    const response = await request(app)
      .put('/api/favoritos/7?idUsuario=1')
      .send({ destination_label: 'San Antonio' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: actualizado });
    expect(favoritosService.actualizarFavorito).toHaveBeenCalledWith(
      '7',
      { destination_label: 'San Antonio' },
      { idUsuario: '1' }
    );
  });

  test('GET /api/lineas propaga 502 cuando falla el microservicio transporte', async () => {
    transporteService.listLineas.mockRejectedValue(
      buildError(502, 'Bad gateway al consultar transporte')
    );

    const response = await request(app).get('/api/lineas');

    expect(response.status).toBe(502);
    expect(response.body.message).toContain('Bad gateway');
  });

  test('GET /api/metro/etxebarri devuelve salidas de metro', async () => {
    const payload = { station: 'Metro Etxebarri', departures: [] };
    metroService.getUpcomingDepartures.mockResolvedValue(payload);

    const response = await request(app).get('/api/metro/etxebarri?limit=3');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: payload });
    expect(metroService.getUpcomingDepartures).toHaveBeenCalled();
  });

  test('GET /api/usuarios devuelve 500 para error no controlado', async () => {
    usuariosService.listUsuarios.mockRejectedValue(new Error('Fallo inesperado'));

    const response = await request(app).get('/api/usuarios');

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Fallo inesperado');
  });

  test('Ruta inexistente devuelve 404', async () => {
    const response = await request(app).get('/api/no-existe');

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Ruta no encontrada');
  });
});
