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
- `pgadmin` (opcional): cliente web para inspeccionar PostgreSQL.
- `microservicioUsuarios`: API Node.js para autenticacion y gestion de usuarios/preferencias.
- `microservicioTransporte`: API FastAPI que sirve lineas, trayectos y horarios.
- `api-gateway`: fachada HTTP (`http://localhost:4000/api`) que orquesta las peticiones hacia ambos microservicios.
- `web_frontend`: Nginx que expone el frontend estatico `web/` en `http://localhost:8080`.

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

Puertos expuestos una vez que todos los contenedores estan arriba:

- API Gateway: `http://localhost:4000/api`
- Usuarios: `http://localhost:3000`
- Transporte: `http://localhost:5000`
- PostgreSQL: `localhost:5434` (usuario/clave `etxebus`)
- MongoDB: `localhost:27018`
- pgAdmin: `http://localhost:5050` (admin@etxebus.local / admin)
- Frontend: `http://localhost:8080`

### Arranque manual para desarrollo

1. Ten MongoDB y PostgreSQL corriendo con las credenciales definidas en `microservicioUsuarios/.env` y `microservicioTransporte/.env`.
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

Con el servidor estatico activo, abre `http://localhost:8080/html/principal.html`. Desde esa pantalla principal podras navegar hacia:

- `/html/lineas.html` para el mapa de lineas y paradas.
- `/html/horarios.html` para las tarjetas de horarios generadas dinamicamente desde el API Gateway.
- `/html/trayecto.html` para planificar trayectos.

En modo local sin Nginx tambien puedes abrir los archivos dentro de `web/html` directamente en el navegador, pero recuerda mantener `api-gateway` arrancado para que las llamadas `fetch` funcionen.
