# EtxeBus

## Microservicios disponibles

- **microservicioUsuarios**: autenticacion y gestion de usuarios (Node.js + MongoDB).
- **microservicioTransporte**: informacion de lineas, paradas, tiempos estimados y planificador (FastAPI + PostgreSQL).
- **api-gateway**: puerta de entrada HTTP que orquesta las peticiones hacia los microservicios.
- **pgadmin**: cliente web para visualizar la base de datos de transporte.

Consulta cada carpeta para instrucciones especificas de despliegue.

## Puesta en marcha rapida

```bash
docker compose up -d --build
```

Esto levanta todos los servicios, incluyendo PostgreSQL (`transporte_db`) y pgAdmin (`http://localhost:5050`, email `admin@etxebus.local`, password `admin`). Desde pgAdmin podras revisar las tablas `lineas`, `paradas`, `horarios`, `trayectos` y `trayecto_parada` mientras los microservicios estan en ejecucion. El frontend estatico queda servido por Nginx en `http://localhost:8080`, asi que puedes abrir `http://localhost:8080/html/principal.html` mientras haces peticiones al gateway en `http://localhost:4000/api`.
