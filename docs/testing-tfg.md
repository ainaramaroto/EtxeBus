# Sistema de pruebas base para EtxeBus (TFG)

## 1) Analisis inicial

### Estructura detectada
- `api-gateway` (Node.js + Express)
- `microservicioUsuarios` (Node.js + Express + MongoDB)
- `microservicioTransporte` (FastAPI + SQLAlchemy + PostgreSQL)
- `web` (frontend estatico)
- `docker-compose.yml`

### Endpoints principales detectados

#### api-gateway
- `GET /api/health`
- `GET /api/`
- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`
- `POST /api/usuarios/login`
- `POST /api/usuarios/logout`
- `GET /api/favoritos`
- `GET /api/favoritos/:id`
- `POST /api/favoritos`
- `PUT /api/favoritos/:id`
- `DELETE /api/favoritos/:id`
- `GET /api/lineas`
- `GET /api/lineas/:id`
- `POST /api/lineas`
- `PUT /api/lineas/:id`
- `DELETE /api/lineas/:id`
- `GET /api/paradas`
- `GET /api/paradas/:id`
- `POST /api/paradas`
- `PUT /api/paradas/:id`
- `DELETE /api/paradas/:id`
- `GET /api/trayectos`
- `GET /api/trayectos/:id`
- `POST /api/trayectos`
- `PUT /api/trayectos/:id`
- `DELETE /api/trayectos/:id`
- `GET /api/trayectos-paradas`
- `GET /api/trayectos-paradas/:routeId/:stopId`
- `POST /api/trayectos-paradas`
- `PUT /api/trayectos-paradas/:routeId/:stopId`
- `DELETE /api/trayectos-paradas/:routeId/:stopId`
- `GET /api/horarios`
- `GET /api/horarios/publicados`
- `GET /api/horarios/:id`
- `POST /api/horarios`
- `PUT /api/horarios/:id`
- `DELETE /api/horarios/:id`
- `GET /api/metro/etxebarri`

#### microservicioUsuarios
- `GET /health`
- `GET /usuarios`
- `GET /usuarios/:id`
- `POST /usuarios`
- `PUT /usuarios/:id`
- `DELETE /usuarios/:id`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /favoritos`
- `GET /favoritos/:id`
- `POST /favoritos`
- `PUT /favoritos/:id`
- `DELETE /favoritos/:id`

#### microservicioTransporte
- `GET /`
- `GET /health`
- `GET /lineas/`
- `GET /lineas/{line_id}`
- `POST /lineas/`
- `PUT /lineas/{line_id}`
- `DELETE /lineas/{line_id}`
- `GET /paradas/`
- `GET /paradas/{stop_id}`
- `POST /paradas/`
- `PUT /paradas/{stop_id}`
- `DELETE /paradas/{stop_id}`
- `GET /trayectos/`
- `GET /trayectos/{route_id}`
- `POST /trayectos/`
- `PUT /trayectos/{route_id}`
- `DELETE /trayectos/{route_id}`
- `GET /trayectos-paradas/`
- `GET /trayectos-paradas/{route_id}/{stop_id}`
- `POST /trayectos-paradas/`
- `PUT /trayectos-paradas/{route_id}/{stop_id}`
- `DELETE /trayectos-paradas/{route_id}/{stop_id}`
- `GET /horarios/`
- `GET /horarios/publicados`
- `GET /horarios/{schedule_id}`
- `POST /horarios/`
- `PUT /horarios/{schedule_id}`
- `DELETE /horarios/{schedule_id}`
- `GET /favoritos/`
- `POST /favoritos/`
- `DELETE /favoritos/{favorite_id}`

### Health checks
- `api-gateway`: existia, se completo con `service`.
- `microservicioUsuarios`: existia, se completo con `service`.
- `microservicioTransporte`: faltaba `/health`, se anadio.

Formato unificado:
- `{"status":"ok","service":"nombre-servicio"}`

### Dependencias actuales relevantes

#### api-gateway/package.json
- runtime: `express`, `axios`, `cors`, `helmet`, `morgan`, etc.
- testing (anadidas): `jest`, `supertest`, `c8`.

#### microservicioUsuarios/package.json
- runtime: `express`, `mongoose`, `cors`, `helmet`, `morgan`, etc.
- testing (anadidas): `jest`, `supertest`, `c8`.

#### microservicioTransporte/requirements.txt
- runtime principal: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `pydantic`, `pydantic-settings`, etc.
- desarrollo: nuevo `requirements-dev.txt` con `pytest`, `pytest-cov`.

### Carpetas tests
- No habia carpetas `tests/` propias en los 3 servicios.
- Ahora existen:
  - `api-gateway/tests`
  - `microservicioUsuarios/tests`
  - `microservicioTransporte/tests`

## 2) Tests Node.js / Express

### Herramientas
- `Jest`
- `Supertest`
- `c8`

### Cobertura implementada

#### api-gateway
- tests creados en `api-gateway/tests/gateway.test.js`
- cobertura de:
  - `GET /api/health`
  - endpoint principal `GET /api/usuarios`
  - errores `400`, `401`, `404`, `500`, `502`
- mocks simples de servicios:
  - `usuariosService`
  - `favoritosService`
  - `transporteService`

#### microservicioUsuarios
- tests creados en `microservicioUsuarios/tests/usuarios.test.js`
- cobertura de:
  - `GET /health`
  - endpoints principales (`/usuarios`, `/auth/login`, `/auth/logout`, `/favoritos`)
  - errores `400`, `401`, `404`, `500`
- mocks simples de modelos Mongo:
  - `UsuarioModel`
  - `PreferenciaModel`

### Scripts anadidos

#### api-gateway/package.json
- `npm test`
- `npm run coverage`

#### microservicioUsuarios/package.json
- `npm test`
- `npm run coverage`

### Configuracion c8
- `api-gateway/.c8rc.json`
- `microservicioUsuarios/.c8rc.json`

Genera:
- reporte consola
- reporte HTML en `coverage/`

## 3) Tests FastAPI / Python

### Herramientas
- `pytest`
- `TestClient` de FastAPI
- `pytest-cov`

### Tests creados
- `microservicioTransporte/tests/conftest.py`
- `microservicioTransporte/tests/test_api.py`

### Cobertura de pruebas
- health check: `GET /health`
- endpoints principales:
  - lineas
  - paradas
  - rutas (trayectos)
  - horarios
  - favoritos
- errores cubiertos:
  - `400`
  - `404`
  - `422`
  - `500`

### Nota tecnica de entorno local
- Para pruebas locales se fuerza DB SQLite en test (`TRANSPORTE_DATABASE_URL=sqlite://`) para no depender de PostgreSQL real.
- Se evita el startup pesado en tests sobreescribiendo temporalmente `app.router.lifespan_context`.

## 4) Comandos exactos

### Node - api-gateway
1. `cd api-gateway`
2. `npm install`
3. `npm.cmd test`
4. `npm.cmd run coverage`

### Node - microservicioUsuarios
1. `cd microservicioUsuarios`
2. `npm install`
3. `npm.cmd test`
4. `npm.cmd run coverage`

### Python - microservicioTransporte
1. `cd microservicioTransporte`
2. `py -3.14 -m pip install -r requirements-dev.txt`
3. `py -3.14 -m pip install --upgrade "anyio>=4.11,<5"`
4. `py -3.14 -m pytest`
5. `py -3.14 -m pytest --cov=app`
6. `py -3.14 -m pytest --cov=app --cov-report=html`

### Abrir reportes HTML
- Node:
  - `api-gateway/coverage/index.html`
  - `microservicioUsuarios/coverage/index.html`
- Python:
  - `microservicioTransporte/htmlcov/index.html`

## 5) Docker y prueba global

### Orden recomendado
1. `docker compose up --build -d`
2. comprobar estado de servicios:
   - `docker compose ps`
3. comprobar health checks:
   - `curl http://localhost:4000/api/health`
   - `curl http://localhost:3000/health`
   - `curl http://localhost:5000/health`
4. comprobar gateway funcional:
   - `curl http://localhost:4000/api/lineas`
5. comprobar frontend:
   - abrir `http://localhost:8080/html/principal.html`

### Peticion funcional basica recomendada
- `POST http://localhost:4000/api/usuarios/login` (via Postman)

### Apagado
- `docker compose down`

## 6) Postman

Coleccion preparada:
- `postman/EtxeBus-TFG.postman_collection.json`

Carpetas incluidas:
- `01 Health Checks`
- `02 Auth y Usuarios`
- `03 Favoritos`
- `04 Lineas`
- `05 Paradas`
- `06 Rutas (Trayectos)`
- `07 Horarios`
- `08 Errores Esperados`

Errores contemplados en coleccion:
- 400
- 401
- 404
- 502

## 7) Estructura de evidencias para memoria

Recomendado guardar en:
- `api-gateway/tests/`
- `microservicioUsuarios/tests/`
- `microservicioTransporte/tests/`
- `api-gateway/coverage/`
- `microservicioUsuarios/coverage/`
- `microservicioTransporte/htmlcov/`
- `postman/`
- `docs/evidencias/`

En `docs/evidencias/` guardar:
- capturas de `npm test`
- capturas de `npm run coverage`
- capturas de `python -m pytest`
- capturas de `python -m pytest --cov=app`
- capturas de Docker (`docker compose ps`, logs de arranque)
- capturas de health checks por servicio
- capturas de llamadas clave en Postman

## 8) Capturas recomendadas (memoria)
- Resultado de `npm test` en `api-gateway`.
- Resultado de `npm run coverage` en `api-gateway` (tabla de cobertura).
- Resultado de `npm test` en `microservicioUsuarios`.
- Resultado de `npm run coverage` en `microservicioUsuarios`.
- Resultado de `python -m pytest` en `microservicioTransporte`.
- Resultado de `python -m pytest --cov=app` en `microservicioTransporte`.
- Pantalla del HTML report `coverage/index.html` (Node).
- Pantalla del HTML report `htmlcov/index.html` (Python).
- `docker compose ps` con servicios `Up`.
- `curl`/Postman de `/health` de cada servicio.
- 1 ejemplo de error 400, 401, 404 y 502 en Postman.

## 9) Valoracion para TFG
- El sistema es basico, solido y defendible para TFG.
- Cubre casos felices y errores tipicos sin sobre-ingenieria.
- No exige BD real en tests de desarrollo.
- Genera evidencia objetiva: tests automatizados + cobertura + pruebas funcionales manuales en Postman + validacion global en Docker.
