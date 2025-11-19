# API Gateway EtxeBus

Gateway HTTP construido con Node.js y Express para exponer un punto de entrada único entre el frontend y los microservicios del proyecto EtxeBus.

## Requisitos

- Node.js >= 18
- Un microservicio de usuarios accesible (por defecto en `http://localhost:3000`)

## Instalación

```bash
npm install
```

## Configuración

Copie el archivo `.env.example` a `.env` y ajuste los valores necesarios:

```bash
cp .env.example .env
```

Variables relevantes:

- `PORT`: Puerto donde escuchará el gateway (default `4000`).
- `ALLOWED_ORIGINS`: Lista separada por comas con los orígenes permitidos para CORS.
- `USERS_SERVICE_URL`: URL base hacia el microservicio de usuarios.
- `REQUEST_TIMEOUT_MS`: Tiempo máximo de espera por respuesta del microservicio.

## Scripts disponibles

- `npm run dev`: Levanta el gateway con recarga automática (nodemon).
- `npm start`: Levanta el gateway en modo producción.
- `npm run seed:test-user`: Crea un usuario de prueba a través del gateway (requiere que el microservicio de usuarios esté operativo).

## Endpoints

Todos los endpoints se exponen bajo el prefijo `/api`. Los principales recursos disponibles son:

- `GET /api/usuarios` – Lista usuarios.
- `POST /api/usuarios` – Crea un usuario.
- `GET /api/usuarios/:id` – Recupera un usuario específico.
- `PUT /api/usuarios/:id` – Actualiza un usuario.
- `DELETE /api/usuarios/:id` – Elimina un usuario.
- `POST /api/usuarios/login` – Reenvía las credenciales al microservicio para autenticación.

Además, un endpoint de salud:

- `GET /api/health`

## Docker

El proyecto incluye un `Dockerfile` y una definición en `docker-compose.yml`. Para levantar toda la pila (Mongo, microservicio de usuarios y gateway) ejecute:

```bash
docker compose up --build
```

El frontend podrá comunicarse con el gateway en `http://localhost:4000/api/...`.
