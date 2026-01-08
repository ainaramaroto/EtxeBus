## Microservicio de Usuarios

Servicio REST en Node.js + Express + Mongoose encargado de gestionar autenticacion, usuarios y preferencias dentro de EtxeBus.

### Requisitos

- Node.js >= 18
- Instancia de MongoDB accesible (local o en contenedor)

### Instalacion

```powershell
npm install
```

### Configuracion

Crea un archivo `.env` en la raiz del servicio con las variables necesarias. Como referencia:

```
PORT=3000
MONGO_URL=mongodb://localhost:27017/etxebus
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

- `PORT`: Puerto donde se expone el microservicio.
- `MONGO_URL`: Cadena de conexion a MongoDB.
- `ALLOWED_ORIGINS`: Lista separada por comas para restringir CORS (deja vacio para permitir todos los origenes).

### Scripts utiles

- `npm run dev`: Inicia el servicio con recarga automatica (nodemon).
- `npm start`: Inicia el servicio en modo produccion.

### Endpoints principales

- `GET /usuarios`: Lista todos los usuarios.
- `POST /usuarios`: Crea un usuario nuevo.
- `GET /usuarios/:id`: Recupera un usuario por su `idUsuario`.
- `PUT /usuarios/:id`: Actualiza los datos del usuario.
- `DELETE /usuarios/:id`: Elimina un usuario.
- `POST /auth/login`: Valida credenciales (`email` + `contrasenia`).
- `GET /health`: Verifica el estado del servicio.

Las respuestas siguen el formato `{ data: ... }` y los errores utilizan codigos HTTP y mensajes en castellano.
