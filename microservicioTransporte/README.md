# Microservicio de Transporte

Servicio FastAPI responsable de exponer la información de líneas, paradas, estimaciones de llegada y planificador sencillo para EtxeBus. Usa PostgreSQL como base de datos.

## Endpoints principales

- `GET /lines` listado de líneas.
- `GET /lines/{id}` detalle con paradas ordenadas.
- `GET /stops` listado de paradas.
- `GET /stops/{id}/arrivals` próximos horarios para una parada.
- `GET /journeys?origin_stop_id=101&destination_stop_id=108` planificador entre dos paradas si comparten línea.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `TRANSPORTE_DATABASE_URL` | Cadena de conexión SQLAlchemy a PostgreSQL | `postgresql+psycopg2://etxebus:etxebus@transporte-db:5432/etxebus_transporte` |
| `TRANSPORTE_DEFAULT_HEADWAY_MINUTES` | Intervalo genérico entre buses | `12` |
| `TRANSPORTE_SERVICE_START_HOUR` | Hora (0-23) de inicio del servicio diario | `5` |
| `TRANSPORTE_TIMEZONE` | Zona horaria utilizada para los cálculos | `UTC` |

El servicio crea y rellena la base de datos con datos de ejemplo en el arranque.
