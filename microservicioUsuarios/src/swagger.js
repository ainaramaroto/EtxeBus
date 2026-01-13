const config = require('./config');

const serverUrl =
  process.env.SERVICE_URL ||
  (config.port ? `http://localhost:${config.port}` : 'http://localhost:3000');

const swaggerSpec = {
  openapi: '3.0.1',
  info: {
    title: 'Microservicio de Usuarios - EtxeBus',
    version: '1.0.0',
    description:
      'API para autenticacion, gestion de usuarios y preferencias (favoritos) usada por el frontend y el API Gateway.',
  },
  servers: [
    {
      url: serverUrl,
      description: 'Local',
    },
  ],
  components: {
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          idUsuario: { type: 'integer', example: 12345678 },
          nomUsuario: { type: 'string', example: 'inaki' },
          email: { type: 'string', format: 'email', example: 'demo@example.com' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['idUsuario', 'nomUsuario', 'email', 'createdAt'],
      },
      UsuarioCreate: {
        type: 'object',
        properties: {
          nomUsuario: { type: 'string', example: 'inaki' },
          email: { type: 'string', format: 'email', example: 'demo@example.com' },
          contrasenia: { type: 'string', minLength: 6, maxLength: 15, example: 'secreto1' },
        },
        required: ['nomUsuario', 'email', 'contrasenia'],
      },
      UsuarioUpdate: {
        type: 'object',
        properties: {
          nomUsuario: { type: 'string', example: 'nuevo_nombre' },
          email: { type: 'string', format: 'email', example: 'nuevo@example.com' },
          contrasenia: { type: 'string', minLength: 6, maxLength: 15, example: 'nuevaPass' },
        },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'demo@example.com' },
          usuario: { type: 'string', example: 'demo' },
          nomUsuario: { type: 'string', example: 'demo' },
          contrasenia: { type: 'string', example: 'secreto1' },
        },
        required: ['contrasenia'],
        description:
          'Puedes autenticar por email o nomUsuario; envia cualquiera de los dos junto con la contrasenia.',
      },
      Preferencia: {
        type: 'object',
        properties: {
          idPreferencia: { type: 'integer', example: 1010 },
          idUsuario: { type: 'integer', example: 12345678 },
          tipo: { type: 'string', example: 'trayecto' },
          origin_slug: { type: 'string', nullable: true, example: 'plaza-ayuntamiento' },
          destination_slug: { type: 'string', nullable: true, example: 'metro-etxebarri' },
          origin_label: { type: 'string', nullable: true, example: 'Plaza Ayuntamiento' },
          destination_label: { type: 'string', nullable: true, example: 'Metro Etxebarri' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['idPreferencia', 'idUsuario', 'tipo', 'createdAt'],
      },
      PreferenciaCreate: {
        type: 'object',
        properties: {
          idUsuario: { type: 'integer', example: 12345678 },
          tipo: { type: 'string', example: 'trayecto' },
          origin_slug: { type: 'string', nullable: true },
          destination_slug: { type: 'string', nullable: true },
          origin_label: { type: 'string', nullable: true },
          destination_label: { type: 'string', nullable: true },
        },
        required: ['idUsuario', 'tipo'],
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
          stack: { type: 'string' },
        },
      },
    },
    parameters: {
      IdUsuarioQuery: {
        name: 'idUsuario',
        in: 'query',
        required: true,
        schema: { type: 'integer' },
        description: 'Identificador numerico del usuario.',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado del servicio',
        responses: {
          200: {
            description: 'Servicio operativo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Usuario' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UsuarioCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Usuario' } },
                },
              },
            },
          },
          409: {
            description: 'Email o idUsuario duplicado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/usuarios/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'idUsuario numerico',
        },
      ],
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por id',
        responses: {
          200: {
            description: 'Usuario encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Usuario' } },
                },
              },
            },
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UsuarioUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuario actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Usuario' } },
                },
              },
            },
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario',
        responses: {
          200: {
            description: 'Usuario eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Usuario' } },
                },
              },
            },
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login de usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Credenciales validas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Usuario' } },
                },
              },
            },
          },
          401: {
            description: 'Credenciales invalidas',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/favoritos': {
      get: {
        tags: ['Favoritos'],
        summary: 'Listar favoritos por usuario',
        parameters: [{ $ref: '#/components/parameters/IdUsuarioQuery' }],
        responses: {
          200: {
            description: 'Lista de favoritos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Preferencia' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Favoritos'],
        summary: 'Crear favorito/preferencia',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PreferenciaCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Favorito creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Preferencia' } },
                },
              },
            },
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/favoritos/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'idPreferencia',
        },
      ],
      delete: {
        tags: ['Favoritos'],
        summary: 'Eliminar favorito',
        parameters: [
          {
            $ref: '#/components/parameters/IdUsuarioQuery',
          },
        ],
        responses: {
          200: {
            description: 'Favorito eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Preferencia' } },
                },
              },
            },
          },
          404: {
            description: 'Preferencia no encontrada',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
