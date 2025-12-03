# Microservicio Transporte

Servicio FastAPI encargado de exponer la informacion de lineas, paradas, trayectos y horarios del sistema **EtxeBus**. Utiliza PostgreSQL como origen de datos y sigue el modelo relacional compartido en el documento de diseno.

## Requisitos

- Python 3.14 (o la version disponible mas cercana)
- PostgreSQL 15 o superior
- Virtualenv/pip

## Configuracion rapida

1. Crea un entorno virtual y activa:
   ```powershell
   python -m venv .venv
   .venv\\Scripts\\Activate.ps1
   ```
2. Instala las dependencias:
   ```powershell
   pip install -r requirements.txt
   ```
3. Copia `.env.example` a `.env` y ajusta `TRANSPORTE_DATABASE_URL` si tu instancia de PostgreSQL usa otras credenciales:
   ```text
   TRANSPORTE_DATABASE_URL=postgresql+psycopg2://usuario:password@localhost:5432/etxebus_transporte
   TRANSPORTE_TIMEZONE=Europe/Madrid
   ```
4. Arranca el API:
   ```powershell
   uvicorn app.main:app --reload --port 5000
   ```
   Por defecto el servicio se expone en `http://127.0.0.1:5000` y la documentacion interactiva queda disponible en `/docs`.

## Tablas gestionadas

- `linea`, `parada`, `trayecto`, `trayecto_parada`
- `horario`

Cada tabla cuenta con un router especifico dentro de `app/routers` que implementa operaciones CRUD basicas mas filtros por parametros de consulta.

## Uso con Docker Compose

El archivo `docker-compose.yml` en la raiz del mono-repo ya define los servicios `microservicio_transporte`, `transporte_db` (PostgreSQL) y `pgadmin`. Para levantar todo el stack:

```powershell
# desde la raiz del repositorio
docker compose up --build microservicio_transporte transporte_db pgadmin
```

- PostgreSQL queda accesible en `localhost:5434` (usuario/clave `etxebus`).
- pgAdmin estara disponible en `http://localhost:5050` (admin/admin) para visualizar y administrar la base de datos desde tu PC, tal como se requiere.
- El microservicio escucha en `http://localhost:5000` dentro del stack y expone los endpoints descritos.

## Endpoints principales

Consulta la documentacion OpenAPI (`/docs`) para ver ejemplos, pero a modo de guia rapida:

- `GET /lineas`, `POST /lineas`
- `GET /paradas`, `POST /paradas`
- `GET /trayectos`, `POST /trayectos`
- `GET /trayectos-paradas`
- `GET /horarios`

Cada ruta soporta operaciones `GET /{id}`, `PUT /{id}` y `DELETE /{id}` cuando corresponda. Las validaciones necesarias (existencia de llaves foraneas, email unico, etc.) estan integradas dentro de los routers.

## Notas adicionales

- `app/database.py` crea las tablas al iniciar la aplicacion, por lo que no necesitas un sistema de migraciones para comenzar a probar.
- Ajusta `TRANSPORTE_TIMEZONE` si necesitas personalizar calculos de horarios o logs.
- La gestion de usuarios y preferencias se delega al microservicio de usuarios; este servicio se centra unicamente en el dominio de transporte.
- Si integras este microservicio con el API Gateway, recuerda usar la URL interna `http://microservicio_transporte:5000` dentro del compose.
