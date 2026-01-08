# API Gateway EtxeBus

Gateway HTTP construido con Node.js y Express para exponer un punto de entrada unico entre el frontend y los microservicios del proyecto EtxeBus.

## Requisitos

- Node.js >= 18
- Microservicio de usuarios accesible (por defecto en `http://localhost:3000`)
- Microservicio de transporte (FastAPI + PostgreSQL) accesible (por defecto en `http://localhost:5000`)

## Instalacion

```bash
npm install
```

## Configuracion

Copia el archivo `.env.example` a `.env` y ajusta los valores necesarios:

```bash
cp .env.example .env
```

Variables relevantes:

- `PORT`: Puerto donde escuchara el gateway (default `4000`).
- `ALLOWED_ORIGINS`: Lista separada por comas con los origenes permitidos para CORS.
- `USERS_SERVICE_URL`: URL base hacia el microservicio de usuarios.
- `TRANSPORTE_SERVICE_URL`: URL base hacia el microservicio de transporte.
- `REQUEST_TIMEOUT_MS`: Tiempo maximo de espera por respuesta de los microservicios.

## Scripts disponibles

- `npm run dev`: Levanta el gateway con recarga automatica (nodemon).
- `npm start`: Levanta el gateway en modo produccion.
- `npm run seed:test-user`: Crea un usuario de prueba a traves del gateway (requiere el microservicio de usuarios en ejecucion).

## Endpoints

Todos los endpoints se exponen bajo el prefijo `/api`. Los principales recursos disponibles son:

- `GET /api/usuarios` – Lista usuarios.
- `POST /api/usuarios` — Crea un usuario.
- `GET /api/usuarios/:id` — Recupera un usuario especifico.
- `PUT /api/usuarios/:id` — Actualiza un usuario.
- `DELETE /api/usuarios/:id` — Elimina un usuario.
- `POST /api/usuarios/login` — Reenvia las credenciales al microservicio para autenticacion.
- `GET /api/horarios` – Proxy directo al microservicio de transporte para consultar horarios crudos (`line_id`, `stop_id`, etc.).
- `GET /api/horarios/publicados` – Devuelve los horarios publicados que consume el frontend.
- `GET /api/lineas` y `GET /api/lineas/:id` – Recuperan la informacion de lineas desde el microservicio de transporte.
- `GET /api/paradas` y `GET /api/paradas/:id` – Devuelven paradas; aceptan `line_id` como filtro opcional.
- `GET /api/health` – Endpoint de salud del gateway.

## Docker

El proyecto incluye un `Dockerfile` y una definicion en `docker-compose.yml`. Para levantar toda la pila (MongoDB, microservicio de usuarios, microservicio de transporte y gateway) ejecuta:

```bash
docker compose up --build
```

El frontend puede comunicarse con el gateway en `http://localhost:4000/api/...`.
