# Uso de Postman para memoria TFG

Coleccion:
- `EtxeBus-TFG.postman_collection.json`
- `EtxeBus-TFG-organizada.postman_collection.json` (version recomendada para memoria/defensa)

Carpetas de la coleccion organizada:
- `Health checks`
- `Gateway`
- `Usuarios`
- `Transporte`
- `Errores`

## Orden sugerido de demostracion
1. Health checks (gateway, usuarios, transporte).
2. Login correcto y login 401.
3. CRUD basico de usuarios.
4. Favoritos (crear/listar/eliminar).
5. Lineas, paradas, rutas y horarios.
6. Errores controlados 400, 404 y 502.

## Capturas recomendadas
- Carpeta `01 Health Checks` completa.
- `POST /usuarios/login` con 200 y con 401.
- Un `POST` valido de favoritos y un `DELETE` 204.
- `GET /lineas` y `GET /horarios/publicados` via gateway.
- Error 400 (`/usuarios/abc`), 404 (`/api/no-existe`) y 502 (`/api/lineas` con transporte caido).
