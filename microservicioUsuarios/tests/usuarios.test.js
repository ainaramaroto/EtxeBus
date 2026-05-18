const request = require('supertest');

jest.mock('../src/models/usuarioModel', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  exists: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../src/models/preferenciaModel', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const UsuarioModel = require('../src/models/usuarioModel');
const PreferenciaModel = require('../src/models/preferenciaModel');
const app = require('../src/app');

function withLean(result) {
  return {
    lean: jest.fn().mockResolvedValue(result),
  };
}

function withSortAndLean(result) {
  return {
    sort: jest.fn().mockReturnValue(withLean(result)),
  };
}

function buildPreferenciaDoc(initial) {
  const doc = {
    ...initial,
    save: jest.fn().mockResolvedValue(null),
  };
  doc.toObject = jest.fn(() => ({
    idPreferencia: doc.idPreferencia,
    idUsuario: doc.idUsuario,
    tipo: doc.tipo,
    origin_slug: doc.origin_slug ?? null,
    destination_slug: doc.destination_slug ?? null,
    origin_label: doc.origin_label ?? null,
    destination_label: doc.destination_label ?? null,
    createdAt: doc.createdAt,
  }));
  return doc;
}

describe('microservicioUsuarios tests basicos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health devuelve estado del servicio', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'microservicio-usuarios',
    });
  });

  test('GET /usuarios devuelve listado de usuarios', async () => {
    UsuarioModel.find.mockReturnValue(
      withLean([
        {
          idUsuario: 1,
          nomUsuario: 'ainara',
          email: 'ainara@example.com',
          contrasenia:
            '8d969eef6ecad3c29a3a629280e686cff8fabbd5d7a4f0f0f5c9d92fddf6f6cc',
        },
      ])
    );

    const response = await request(app).get('/usuarios');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      idUsuario: 1,
      nomUsuario: 'ainara',
      email: 'ainara@example.com',
    });
  });

  test('GET /usuarios/:id devuelve 400 si el id es invalido', async () => {
    const response = await request(app).get('/usuarios/abc');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('idUsuario invalido');
  });

  test('GET /usuarios/:id devuelve 404 si no existe', async () => {
    UsuarioModel.findOne.mockReturnValue(withLean(null));

    const response = await request(app).get('/usuarios/999');

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Usuario no encontrado');
  });

  test('POST /auth/login devuelve 400 con payload incompleto', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'ainara@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('identificador y contrasenia son requeridos');
  });

  test('POST /auth/login devuelve 401 para credenciales invalidas', async () => {
    UsuarioModel.findOne.mockReturnValue(withLean(null));

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'ainara@example.com', contrasenia: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Credenciales invalidas');
  });

  test('POST /auth/logout devuelve confirmacion de cierre de sesion', async () => {
    const response = await request(app).post('/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        loggedOut: true,
      },
    });
  });

  test('GET /favoritos devuelve 400 si no llega idUsuario', async () => {
    const response = await request(app).get('/favoritos');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('idUsuario requerido');
  });

  test('GET /favoritos devuelve favoritos del usuario', async () => {
    PreferenciaModel.find.mockReturnValue(
      withSortAndLean([
        {
          idPreferencia: 1,
          idUsuario: 1,
          tipo: 'trayecto',
          origin_slug: 'metro',
          destination_slug: 'santa-marina',
          origin_label: 'Metro',
          destination_label: 'Santa Marina',
        },
      ])
    );

    const response = await request(app).get('/favoritos?idUsuario=1');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      idUsuario: 1,
      tipo: 'trayecto',
    });
  });

  test('GET /favoritos/:id devuelve favorito por idUsuario', async () => {
    PreferenciaModel.findOne.mockReturnValue(
      withLean({
        idPreferencia: 1,
        idUsuario: 1,
        tipo: 'trayecto',
        origin_slug: 'metro',
        destination_slug: 'santa-marina',
        origin_label: 'Metro',
        destination_label: 'Santa Marina',
      })
    );

    const response = await request(app).get('/favoritos/1?idUsuario=1');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      idPreferencia: 1,
      idUsuario: 1,
      tipo: 'trayecto',
    });
  });

  test('PUT /favoritos/:id actualiza campos del favorito', async () => {
    const doc = buildPreferenciaDoc({
      idPreferencia: 1,
      idUsuario: 1,
      tipo: 'trayecto',
      origin_slug: 'metro',
      destination_slug: 'santa-marina',
      origin_label: 'Metro',
      destination_label: 'Santa Marina',
      createdAt: '2026-05-18T00:00:00.000Z',
    });
    PreferenciaModel.findOne.mockResolvedValue(doc);

    const response = await request(app)
      .put('/favoritos/1?idUsuario=1')
      .send({ destination_label: 'San Antonio' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      idPreferencia: 1,
      idUsuario: 1,
      destination_label: 'San Antonio',
    });
    expect(doc.save).toHaveBeenCalledTimes(1);
  });

  test('GET /usuarios devuelve 500 para fallo inesperado de base de datos', async () => {
    UsuarioModel.find.mockImplementation(() => {
      throw new Error('Mongo no disponible');
    });

    const response = await request(app).get('/usuarios');

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Mongo no disponible');
  });

  test('Ruta inexistente devuelve 404', async () => {
    const response = await request(app).get('/no-existe');

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Ruta no encontrada');
  });
});
