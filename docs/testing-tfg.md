# EtxeBus - Sistema de pruebas TFG (estado final)

## 1) Cobertura automatizada

### 1.1 Node.js (`api-gateway`, `microservicioUsuarios`)

Estado revisado:
- Jest: presente en ambos servicios.
- c8: presente en ambos servicios.
- Scripts `test` y `coverage`: presentes y funcionando.
- `.c8rc.json`: presente en ambos servicios con `report-dir: coverage`.

Scripts activos en ambos `package.json`:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest --runInBand",
  "coverage": "c8 --reporter=text --reporter=html npm test"
}
```

Nota:
- En `api-gateway` existe ademas `seed:test-user` y se mantiene igual.
- En PowerShell de Windows usar `npm.cmd` para evitar bloqueo de `npm.ps1`.

Comandos exactos:

```powershell
cd api-gateway
npm.cmd test
npm.cmd run coverage

cd ..\microservicioUsuarios
npm.cmd test
npm.cmd run coverage
```

Salida esperada:
- Cobertura en consola (tabla por archivo).
- Reporte HTML en:
  - `api-gateway/coverage/index.html`
  - `microservicioUsuarios/coverage/index.html`

Carpetas generadas:
- `coverage/` (en cada microservicio Node)

---

### 1.2 FastAPI / Python (`microservicioTransporte`)

Estado revisado:
- `pytest`: presente.
- `pytest-cov`: presente en `requirements-dev.txt`.
- `pytest.ini`: presente y correcto (`testpaths = tests`).

`requirements-dev.txt` actual:

```txt
-r requirements.txt
anyio>=4.11,<5
pytest==8.3.5
pytest-cov==5.0.0
httpx==0.28.1
```

Comandos exactos:

```powershell
cd microservicioTransporte
py -3.14 -m pytest
py -3.14 -m pytest --cov=app
py -3.14 -m pytest --cov=app --cov-report=html
```

Salida esperada:
- Ejecucion de tests en consola.
- Cobertura en consola.
- HTML de cobertura en:
  - `microservicioTransporte/htmlcov/index.html`

Carpetas generadas:
- `htmlcov/`
- `.pytest_cache/`

## 2) Health checks

### Endpoints `GET /health`

- API Gateway: `GET /api/health`
- Microservicio Usuarios: `GET /health`
- Microservicio Transporte: `GET /health`

Formato estandar:

```json
{
  "status": "ok",
  "service": "nombre-servicio"
}
```

### Health agregado en gateway (nuevo)

Endpoint anadido:
- `GET /api/health/dependencies`

Funcion:
- Consulta salud de usuarios y transporte.
- Devuelve `200` si ambos estan `ok`.
- Devuelve `502` con `status: degraded` si alguna dependencia falla.

Respuesta ejemplo OK:

```json
{
  "status": "ok",
  "service": "api-gateway",
  "dependencies": {
    "usuarios": { "status": "ok", "service": "microservicio-usuarios" },
    "transporte": { "status": "ok", "service": "microservicioTransporte" }
  }
}
```

## 3) Postman (uso recomendado para defensa)

Colecciones disponibles:
- `postman/EtxeBus-TFG.postman_collection.json`
- `postman/EtxeBus-TFG-organizada.postman_collection.json` (recomendada)

Carpetas de la coleccion organizada:
- `Health checks`
- `Gateway`
- `Usuarios`
- `Transporte`
- `Errores`

Endpoints clave a ensenar:
- Login/autenticacion:
  - `POST /api/usuarios/login`
  - `POST /auth/login`
- Usuarios:
  - `GET /api/usuarios`, `GET /usuarios`, `POST /usuarios`
- Favoritos:
  - `GET /api/favoritos?idUsuario=...`
  - `POST /api/favoritos`
- Transporte funcional:
  - `GET /api/lineas`, `GET /api/paradas`, `GET /api/trayectos`, `GET /api/horarios/publicados`
- Health:
  - `/api/health`, `/api/health/dependencies`, `/health` (usuarios/transporte)
- Errores:
  - `400` (`/usuarios/abc`)
  - `401` (login invalido)
  - `404` (`/api/no-existe`)
  - `502` (`/api/health/dependencies` con dependencia caida)

## 4) Prueba global con Docker

## Comandos

```powershell
docker compose up -d --build
docker compose ps

curl.exe -s http://localhost:4000/api/health
curl.exe -s http://localhost:4000/api/health/dependencies
curl.exe -s http://localhost:3000/health
curl.exe -s http://localhost:5000/health
curl.exe -s http://localhost:4000/api/lineas
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8080/html/principal.html
```

Orden de validacion:
1. `docker compose ps` (todos `Up`).
2. Health checks de los 3 servicios.
3. Health agregado del gateway.
4. Peticion funcional via gateway (`/api/lineas`).
5. Frontend accesible (`200` en `principal.html`).

Logs utiles para memoria:
- `docker compose ps`
- `docker compose logs --tail=50 api_gateway`
- `docker compose logs --tail=50 microservicio_usuarios`
- `docker compose logs --tail=50 microservicio_transporte`

## 5) Organizacion final de pruebas y evidencias

Estructura recomendada:

- `api-gateway/tests/`
- `microservicioUsuarios/tests/`
- `microservicioTransporte/tests/`
- `api-gateway/coverage/`
- `microservicioUsuarios/coverage/`
- `microservicioTransporte/htmlcov/`
- `postman/`
- `docs/evidencias/`

Guardar en `docs/evidencias/`:
- Captura `npm.cmd test` (gateway y usuarios).
- Captura `npm.cmd run coverage` (tabla y % totales).
- Captura `py -3.14 -m pytest`.
- Captura `py -3.14 -m pytest --cov=app`.
- Captura HTML coverage Node y Python.
- Captura `docker compose ps`.
- Capturas de `curl` o Postman en health y endpoints funcionales.
- Capturas de errores 400/401/404/502.

## 6) Resumen de cumplimiento TFG

Estado final:
- Tests automatizados en los 3 servicios: OK.
- Cobertura Node con HTML: OK.
- Cobertura FastAPI con HTML: OK.
- Health checks unificados: OK.
- Health agregado de dependencias en gateway: OK.
- Postman organizado para defensa: OK.
- Flujo Docker global verificable: OK.

Este nivel es realista, defendible y profesional para un TFG sin sobre-ingenieria.
