const config = require('./config');

const serverUrl =
  process.env.GATEWAY_PUBLIC_URL ||
  (config.port ? `http://localhost:${config.port}/api` : 'http://localhost:4000/api');

const swaggerSpec = {
  openapi: '3.0.1',
  info: {
    title: 'EtxeBus API (Gateway)',
    version: '1.0.0',
    description:
      'Documentacion unificada del API expuesto por el gateway hacia los microservicios de usuarios y transporte.',
  },
  servers: [
    {
      url: serverUrl,
      description: 'API Gateway',
    },
  ],
  tags: [
    { name: 'Health', description: 'Estado de los servicios' },
    { name: 'Auth', description: 'Autenticacion de usuarios' },
    { name: 'Usuarios', description: 'Gestion de usuarios' },
    { name: 'Favoritos', description: 'Preferencias y favoritos de usuarios' },
    { name: 'Lineas', description: 'Lineas de transporte' },
    { name: 'Paradas', description: 'Paradas de transporte' },
    { name: 'Trayectos', description: 'Trayectos entre paradas' },
    { name: 'Trayecto-Parada', description: 'Asignacion de paradas a trayectos' },
    { name: 'Horarios', description: 'Horarios crudos y publicados' },
    { name: 'Metro', description: 'Salidas de Metro Etxebarri (GTFS)' },
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
          nomUsuario: { type: 'string' },
          email: { type: 'string', format: 'email' },
          contrasenia: { type: 'string', minLength: 6, maxLength: 15 },
        },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          usuario: { type: 'string' },
          nomUsuario: { type: 'string' },
          contrasenia: { type: 'string' },
        },
        required: ['contrasenia'],
        description: 'Provee email o nomUsuario mas la contrasenia.',
      },
      AuthenticatedUsuario: {
        allOf: [
          { $ref: '#/components/schemas/Usuario' },
          {
            type: 'object',
            properties: {
              token: { type: 'string', example: '<jwt-token>' },
              tokenType: { type: 'string', example: 'Bearer' },
              expiresIn: { type: 'integer', example: 3600 },
            },
            required: ['token', 'tokenType', 'expiresIn'],
          },
        ],
      },
      Preferencia: {
        type: 'object',
        properties: {
          idPreferencia: { type: 'integer', example: 1010 },
          idUsuario: { type: 'integer', example: 12345678 },
          tipo: { type: 'string', example: 'trayecto' },
          paradaOrigen: { type: 'string', nullable: true },
          paradaDestino: { type: 'string', nullable: true },
          nomParadaOrigen: { type: 'string', nullable: true },
          nomParadaDestino: { type: 'string', nullable: true },
          origin_slug: { type: 'string', nullable: true },
          destination_slug: { type: 'string', nullable: true },
          origin_label: { type: 'string', nullable: true },
          destination_label: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['idPreferencia', 'idUsuario', 'tipo', 'createdAt'],
      },
      PreferenciaCreate: {
        type: 'object',
        properties: {
          idUsuario: { type: 'integer' },
          tipo: { type: 'string' },
          paradaOrigen: { type: 'string', nullable: true },
          paradaDestino: { type: 'string', nullable: true },
          nomParadaOrigen: { type: 'string', nullable: true },
          nomParadaDestino: { type: 'string', nullable: true },
          origin_slug: { type: 'string', nullable: true },
          destination_slug: { type: 'string', nullable: true },
          origin_label: { type: 'string', nullable: true },
          destination_label: { type: 'string', nullable: true },
        },
        required: ['idUsuario', 'tipo'],
      },
      PreferenciaUpdate: {
        type: 'object',
        properties: {
          tipo: { type: 'string' },
          paradaOrigen: { type: 'string', nullable: true },
          paradaDestino: { type: 'string', nullable: true },
          nomParadaOrigen: { type: 'string', nullable: true },
          nomParadaDestino: { type: 'string', nullable: true },
          origin_slug: { type: 'string', nullable: true },
          destination_slug: { type: 'string', nullable: true },
          origin_label: { type: 'string', nullable: true },
          destination_label: { type: 'string', nullable: true },
        },
      },
      Linea: {
        type: 'object',
        properties: {
          idLinea: { type: 'integer', example: 1 },
          slug: { type: 'string', example: 'l1-arizgoyen-sanantonio' },
          nomLinea: { type: 'string', example: 'Arizgoien - San Antonio' },
          badge: { type: 'string', example: 'L1' },
          subtitle: { type: 'string', nullable: true },
          info: { type: 'string', nullable: true },
          color: { type: 'string', nullable: true, example: '#007bff' },
          orden: { type: 'integer', example: 1 },
        },
      },
      LineaCreate: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'l1-arizgoyen-sanantonio' },
          nomLinea: { type: 'string', example: 'Arizgoien - San Antonio' },
          badge: { type: 'string', example: 'L1' },
          subtitle: { type: 'string', nullable: true },
          info: { type: 'string', nullable: true },
          color: { type: 'string', nullable: true },
          orden: { type: 'integer', example: 1 },
        },
        required: ['slug', 'nomLinea'],
      },
      LineaUpdate: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          nomLinea: { type: 'string' },
          badge: { type: 'string' },
          subtitle: { type: 'string', nullable: true },
          info: { type: 'string', nullable: true },
          color: { type: 'string', nullable: true },
          orden: { type: 'integer' },
        },
      },
      Parada: {
        type: 'object',
        properties: {
          idParada: { type: 'integer', example: 10 },
          nombre: { type: 'string', example: 'Metro Etxebarri' },
          coordX: { type: 'number', example: -2.9001 },
          coordY: { type: 'number', example: 43.2471 },
          idLinea: { type: 'integer', example: 1 },
          orden: { type: 'integer', example: 5 },
        },
      },
      ParadaCreate: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Metro Etxebarri' },
          coordX: { type: 'number', nullable: true },
          coordY: { type: 'number', nullable: true },
          idLinea: { type: 'integer', example: 1 },
          orden: { type: 'integer', nullable: true },
        },
        required: ['nombre', 'idLinea'],
      },
      ParadaUpdate: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          coordX: { type: 'number', nullable: true },
          coordY: { type: 'number', nullable: true },
          idLinea: { type: 'integer', nullable: true },
          orden: { type: 'integer', nullable: true },
        },
      },
      Trayecto: {
        type: 'object',
        properties: {
          idTrayecto: { type: 'integer', example: 20 },
          idOrigen: { type: 'integer', example: 10 },
          idDestino: { type: 'integer', example: 15 },
          duracionEstm: { type: 'number', example: 17.5, nullable: true },
        },
      },
      TrayectoCreate: {
        type: 'object',
        properties: {
          idOrigen: { type: 'integer', example: 10 },
          idDestino: { type: 'integer', example: 15 },
          duracionEstm: { type: 'number', example: 17.5, nullable: true },
        },
        required: ['idOrigen', 'idDestino'],
      },
      TrayectoUpdate: {
        type: 'object',
        properties: {
          idOrigen: { type: 'integer', nullable: true },
          idDestino: { type: 'integer', nullable: true },
          duracionEstm: { type: 'number', nullable: true },
        },
      },
      TrayectoParada: {
        type: 'object',
        properties: {
          idTrayecto: { type: 'integer', example: 20 },
          idParada: { type: 'integer', example: 10 },
          orden: { type: 'integer', example: 2, nullable: true },
        },
      },
      TrayectoParadaCreate: {
        type: 'object',
        properties: {
          idTrayecto: { type: 'integer', example: 20 },
          idParada: { type: 'integer', example: 10 },
          orden: { type: 'integer', example: 2, nullable: true },
        },
        required: ['idTrayecto', 'idParada'],
      },
      TrayectoParadaUpdate: {
        type: 'object',
        properties: {
          idTrayecto: { type: 'integer', nullable: true },
          idParada: { type: 'integer', nullable: true },
          orden: { type: 'integer', nullable: true },
        },
      },
      Horario: {
        type: 'object',
        properties: {
          idHorario: { type: 'integer', example: 501 },
          tipoDia: { type: 'string', example: 'laborable' },
          horas: { type: 'array', items: { type: 'string', example: '07:30' } },
          idLinea: { type: 'integer', nullable: true },
          idParada: { type: 'integer', nullable: true },
        },
      },
      HorarioCreate: {
        type: 'object',
        properties: {
          tipoDia: { type: 'string', example: 'LABORABLE' },
          horas: { type: 'array', items: { type: 'string', example: '07:30' } },
          idLinea: { type: 'integer', nullable: true },
          idParada: { type: 'integer', nullable: true },
        },
        required: ['tipoDia', 'horas'],
      },
      HorarioUpdate: {
        type: 'object',
        properties: {
          tipoDia: { type: 'string', nullable: true },
          horas: { type: 'array', items: { type: 'string' }, nullable: true },
          idLinea: { type: 'integer', nullable: true },
          idParada: { type: 'integer', nullable: true },
        },
      },
      HorarioPublicado: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'l1-laborable' },
          line_code: { type: 'string', example: 'L1' },
          line_name: { type: 'string', example: 'Arizgoien - San Antonio' },
          line_color: { type: 'string', example: '#007bff' },
          service_name: { type: 'string', example: 'Laborables' },
          orden: { type: 'integer', example: 1 },
          blocks: { type: 'array', items: { type: 'object' } },
        },
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
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      IdUsuarioQuery: {
        name: 'idUsuario',
        in: 'query',
        required: false,
        schema: { type: 'integer' },
        description: 'Identificador del usuario (si se omite, se usa el id del token JWT).',
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Informacion base del gateway',
        description:
          'Endpoint raiz del API Gateway con enlaces rapidos a documentacion y healthcheck.',
        responses: {
          200: {
            description: 'Informacion del gateway',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string', example: 'EtxeBus API Gateway' },
                    docs: { type: 'string', example: '/api/docs' },
                    health: { type: 'string', example: '/api/health' },
                  },
                  required: ['status', 'message', 'docs', 'health'],
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado del gateway',
        responses: {
          200: {
            description: 'OK',
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
        summary: 'Listar usuarios (proxy)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario (proxy)',
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
        summary: 'Obtener usuario (proxy)',
        security: [{ BearerAuth: [] }],
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
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario (proxy)',
        security: [{ BearerAuth: [] }],
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
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario (proxy)',
        security: [{ BearerAuth: [] }],
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
        },
      },
    },
    '/usuarios/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (proxy)',
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
            description: 'Login correcto',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/AuthenticatedUsuario' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Credenciales invalidas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/usuarios/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (proxy)',
        security: [{ BearerAuth: [] }],
        description:
          'Reenvia el cierre de sesion al microservicio de usuarios. Actualmente la operacion es stateless.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  idUsuario: { type: 'integer', example: 12345678 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sesion cerrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        loggedOut: { type: 'boolean', example: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/favoritos': {
      get: {
        tags: ['Favoritos'],
        summary: 'Listar favoritos (proxy)',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdUsuarioQuery' }],
        responses: {
          200: {
            description: 'Lista de favoritos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Preferencia' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Favoritos'],
        summary: 'Crear favorito (proxy)',
        security: [{ BearerAuth: [] }],
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
      get: {
        tags: ['Favoritos'],
        summary: 'Obtener favorito por id (proxy)',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdUsuarioQuery' }],
        responses: {
          200: {
            description: 'Favorito encontrado',
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
            description: 'No encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      put: {
        tags: ['Favoritos'],
        summary: 'Actualizar favorito (proxy)',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdUsuarioQuery' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PreferenciaUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'Favorito actualizado',
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
            description: 'No encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      delete: {
        tags: ['Favoritos'],
        summary: 'Eliminar favorito (proxy)',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdUsuarioQuery' }],
        responses: {
          204: { description: 'Eliminado' },
          404: {
            description: 'No encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/horarios': {
      get: {
        tags: ['Horarios'],
        summary: 'Listar horarios crudos',
        parameters: [
          { name: 'line_id', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'stop_id', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'tipoDia', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Horarios desde el microservicio de transporte',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Horario' } } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Horarios'],
        summary: 'Crear horario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HorarioCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Horario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Horario' } },
                },
              },
            },
          },
        },
      },
    },
    '/horarios/publicados': {
      get: {
        tags: ['Horarios'],
        summary: 'Horarios publicados (formato tarjetas)',
        responses: {
          200: {
            description: 'Horarios listos para el frontend',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/HorarioPublicado' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/horarios/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'idHorario' },
      ],
      get: {
        tags: ['Horarios'],
        summary: 'Obtener horario',
        responses: {
          200: {
            description: 'Horario encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Horario' } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Horarios'],
        summary: 'Actualizar horario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HorarioUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Horario actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Horario' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Horarios'],
        summary: 'Eliminar horario',
        responses: {
          200: {
            description: 'Horario eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Horario' } },
                },
              },
            },
          },
        },
      },
    },
    '/lineas': {
      get: {
        tags: ['Lineas'],
        summary: 'Listar lineas',
        responses: {
          200: {
            description: 'Lineas disponibles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Linea' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Lineas'],
        summary: 'Crear linea',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LineaCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Linea creada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Linea' } },
                },
              },
            },
          },
        },
      },
    },
    '/lineas/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'idLinea' },
      ],
      get: {
        tags: ['Lineas'],
        summary: 'Obtener linea',
        responses: {
          200: {
            description: 'Linea encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Linea' } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Lineas'],
        summary: 'Actualizar linea',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LineaUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Linea actualizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Linea' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Lineas'],
        summary: 'Eliminar linea',
        responses: {
          200: {
            description: 'Linea eliminada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Linea' } },
                },
              },
            },
          },
        },
      },
    },
    '/paradas': {
      get: {
        tags: ['Paradas'],
        summary: 'Listar paradas',
        parameters: [
          { name: 'line_id', in: 'query', required: false, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Paradas disponibles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Parada' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Paradas'],
        summary: 'Crear parada',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParadaCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Parada creada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Parada' } },
                },
              },
            },
          },
        },
      },
    },
    '/paradas/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'idParada' },
      ],
      get: {
        tags: ['Paradas'],
        summary: 'Obtener parada',
        responses: {
          200: {
            description: 'Parada encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Parada' } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Paradas'],
        summary: 'Actualizar parada',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParadaUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Parada actualizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Parada' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Paradas'],
        summary: 'Eliminar parada',
        responses: {
          200: {
            description: 'Parada eliminada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Parada' } },
                },
              },
            },
          },
        },
      },
    },
    '/trayectos': {
      get: {
        tags: ['Trayectos'],
        summary: 'Listar trayectos',
        responses: {
          200: {
            description: 'Trayectos disponibles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Trayecto' } } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Trayectos'],
        summary: 'Crear trayecto',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/TrayectoCreate' } },
          },
        },
        responses: {
          201: {
            description: 'Trayecto creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Trayecto' } },
                },
              },
            },
          },
        },
      },
    },
    '/trayectos/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'idTrayecto' },
      ],
      get: {
        tags: ['Trayectos'],
        summary: 'Obtener trayecto',
        responses: {
          200: {
            description: 'Trayecto encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Trayecto' } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Trayectos'],
        summary: 'Actualizar trayecto',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/TrayectoUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'Trayecto actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Trayecto' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Trayectos'],
        summary: 'Eliminar trayecto',
        responses: {
          200: {
            description: 'Trayecto eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Trayecto' } },
                },
              },
            },
          },
        },
      },
    },
    '/trayectos-paradas': {
      get: {
        tags: ['Trayecto-Parada'],
        summary: 'Listar relaciones trayecto-parada',
        parameters: [
          { name: 'route_id', in: 'query', schema: { type: 'integer' }, required: false },
          { name: 'stop_id', in: 'query', schema: { type: 'integer' }, required: false },
        ],
        responses: {
          200: {
            description: 'Relaciones encontradas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/TrayectoParada' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Trayecto-Parada'],
        summary: 'Crear relacion trayecto-parada',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/TrayectoParadaCreate' } },
          },
        },
        responses: {
          201: {
            description: 'Relacion creada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/TrayectoParada' } },
                },
              },
            },
          },
        },
      },
    },
    '/trayectos-paradas/{routeId}/{stopId}': {
      parameters: [
        { name: 'routeId', in: 'path', required: true, schema: { type: 'integer' }, description: 'idTrayecto' },
        { name: 'stopId', in: 'path', required: true, schema: { type: 'integer' }, description: 'idParada' },
      ],
      get: {
        tags: ['Trayecto-Parada'],
        summary: 'Obtener relacion trayecto-parada',
        responses: {
          200: {
            description: 'Relacion encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/TrayectoParada' } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Trayecto-Parada'],
        summary: 'Actualizar relacion trayecto-parada',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/TrayectoParadaUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'Relacion actualizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/TrayectoParada' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Trayecto-Parada'],
        summary: 'Eliminar relacion trayecto-parada',
        responses: {
          200: {
            description: 'Relacion eliminada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/TrayectoParada' } },
                },
              },
            },
          },
        },
      },
    },
    '/metro/etxebarri': {
      get: {
        tags: ['Metro'],
        summary: 'Proximas salidas desde Metro Etxebarri',
        description:
          'Consulta salidas GTFS filtradas para la estacion de Etxebarri. Soporta limite y fecha/hora de referencia.',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
            description: 'Numero maximo de salidas a devolver.',
          },
          {
            name: 'at',
            in: 'query',
            required: false,
            schema: { type: 'string', example: '2026-05-18T18:30:00+02:00' },
            description:
              'Marca temporal de referencia (ISO o timestamp epoch) para calcular proximas salidas.',
          },
          {
            name: 'tzOffset',
            in: 'query',
            required: false,
            schema: { type: 'integer', example: -120 },
            description:
              'Offset horario en minutos respecto a UTC (por ejemplo, Europe/Madrid en verano: -120).',
          },
        ],
        responses: {
          200: {
            description: 'Salidas calculadas correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        station: { type: 'string', example: 'Metro Etxebarri' },
                        generatedAt: { type: 'string', format: 'date-time' },
                        stopIds: { type: 'array', items: { type: 'string' } },
                        departures: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              time: { type: 'string', example: '18:34' },
                              destination: { type: 'string', example: 'Casco Viejo' },
                              tripId: { type: 'string' },
                              serviceId: { type: 'string' },
                              stopId: { type: 'string' },
                              minutesUntil: { type: 'integer', example: 4 },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          502: {
            description: 'No se pudo consultar el origen GTFS remoto',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
