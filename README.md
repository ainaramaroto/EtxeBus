# EtxeBus

Plataforma con microservicios de usuarios, transporte y un API Gateway que sirve datos de rutas, horarios y preferencias para la web estatic de Etxebarri.

## 0) Software que se necesita instalar

- Node.js >= 18 (incluye `npm`)
- Python 3.11 o superior con `pip` y virtualenv
- MongoDB 7 (instalado localmente o via contenedor)
- PostgreSQL 15
- Docker y Docker Compose (opcional, recomendado para levantar todo el stack)
- Git y un editor de texto/código

## 1) Servicios que hay que arrancar

- `mongo`: base de datos usada por el microservicio de usuarios.
- `transporte_db`: PostgreSQL con la informacion de lineas, paradas y horarios.
- `pgadmin` (opcional): cliente web para inspeccionar PostgreSQL en [http://localhost:5050](http://localhost:5050) (usuario `admin@example.com`, contraseña `admin` en el compose).
- `microservicioUsuarios`: API Node.js para autenticacion y gestion de usuarios/preferencias ([http://localhost:3000](http://localhost:3000); health en `/health`; Swagger en `/docs`).
- `microservicioTransporte`: API FastAPI que sirve lineas, trayectos y horarios ([http://localhost:5000](http://localhost:5000) y la documentacion en [http://localhost:5000/docs](http://localhost:5000/docs)).
- `api-gateway`: fachada HTTP que orquesta las peticiones hacia ambos microservicios; expone el prefijo [http://localhost:4000/api](http://localhost:4000/api) (health en `/api/health`, Swagger unificado en `/api/docs`).
- `web_frontend`: Nginx que expone el frontend estatico `web/` en [http://localhost:8080/html/principal.html](http://localhost:8080/html/principal.html).

## 2) Dependencias que hay que instalar

Ejecuta estos comandos desde la raiz del repo para preparar cada servicio:

```powershell
# Microservicio Usuarios (Node.js + MongoDB)
cd microservicioUsuarios
npm install

# API Gateway (Node.js)
cd ..\api-gateway
npm install

# Microservicio Transporte (FastAPI + PostgreSQL)
cd ..\microservicioTransporte
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

El frontend estatico no requiere build; solo se sirve con Nginx (contenedor) o cualquier servidor estatico (`npx serve web`).

## 3) Cómo arrancar la parte servidora

### Opcion recomendada: Docker Compose

```powershell
docker compose up -d --build
```

Accede a:

- Frontend: [http://localhost:8080/html/principal.html](http://localhost:8080/html/principal.html)
- API Gateway: [http://localhost:4000/api/docs](http://localhost:4000/api/docs) (health en `/api/health`)
- Microservicio de usuarios: [http://localhost:3000](http://localhost:3000) (docs en `/docs`, health en `/health`)
- Microservicio de transporte: [http://localhost:5000](http://localhost:5000) (docs en `/docs`)
- MongoDB: `mongodb://localhost:27018`
- PostgreSQL (transporte): `postgresql://etxebus:etxebus@localhost:5434/etxebus_transporte`
- pgAdmin: [http://localhost:5050](http://localhost:5050) (`admin@example.com` / `admin`)

### Arranque manual para desarrollo

1. Ten MongoDB y PostgreSQL corriendo con las credenciales definidas en `microservicioUsuarios/.env` y `microservicioTransporte/.env`.
   Define tambien `JWT_SECRET` (mismo valor) en `microservicioUsuarios/.env` y `api-gateway/.env` para que el gateway pueda validar los tokens emitidos en login.
2. En `microservicioTransporte`:
   ```powershell
   uvicorn app.main:app --reload --port 5000
   ```
3. En `microservicioUsuarios`:
   ```powershell
   npm run dev
   ```
4. En `api-gateway` (ajustando `USERS_SERVICE_URL` y `TRANSPORTE_SERVICE_URL` a tus puertos locales):
   ```powershell
   npm run dev
   ```
5. Sirve la carpeta `web` con el contenedor Nginx (`docker compose up web_frontend`) o ejecuta `npx serve web` para entornos locales.

## 4) Cómo acceder a la parte cliente

Con el servidor estatico activo, abre [http://localhost:8080/html/principal.html](http://localhost:8080/html/principal.html). Desde esa pantalla principal podras navegar hacia:

- [http://localhost:8080/html/lineas.html](http://localhost:8080/html/lineas.html) para el mapa de lineas y paradas.
- [http://localhost:8080/html/horarios.html](http://localhost:8080/html/horarios.html) para las tarjetas de horarios generadas dinamicamente desde el API Gateway.
- [http://localhost:8080/html/trayecto.html](http://localhost:8080/html/trayecto.html) para planificar trayectos.

En modo local sin Nginx tambien puedes abrir los archivos dentro de `web/html` directamente en el navegador, pero recuerda mantener `api-gateway` arrancado para que las llamadas `fetch` funcionen.

## 5) Soporte movil (PWA instalable)

El frontend ahora incluye:

- `manifest.webmanifest`
- `service worker` (`web/sw.js`)
- iconos de app (`web/image/icon-192.png` y `web/image/icon-512.png`)

Esto permite instalar EtxeBus en movil como app web (Android/iOS).

### Probar en movil (misma red WiFi)

1. Arranca el stack (`docker compose up -d --build`).
2. Desde tu PC, averigua tu IP local (por ejemplo `192.168.1.44`).
3. En el movil abre: `http://192.168.1.44:8080/html/principal.html`.
4. Instala la app desde el menu del navegador:
   - Android (Chrome): `Anadir a pantalla de inicio` o `Instalar app`.
   - iPhone/iPad (Safari): `Compartir -> Anadir a pantalla de inicio`.

Nota: la configuracion web (`web/config.local.js`) calcula automaticamente la API como `http://<host-actual>:4000/api`, para que funcione desde movil sin hardcodear `localhost`.

Si cambias assets estaticos y quieres forzar refresco de cache offline, incrementa `CACHE_VERSION` en `web/sw.js`.

## 6) Versionado recomendado (web + movil)

- Usa ramas por feature: `feature/pwa`, `feature/mobile-ui`, `feature/offline-cache`.
- Etiqueta releases con SemVer:
  - `v1.0.0`: release base web.
  - `v1.1.0`: mejoras responsive.
  - `v1.2.0`: PWA instalable.
- Mantén un `CHANGELOG.md` con cambios de UX movil, caché y compatibilidad.
