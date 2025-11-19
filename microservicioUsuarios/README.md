## Microservicio de Usuarios

Servicio REST en Node.js + Express + Mongoose encargado de gestionar la información de usuarios para EtxeBus.

### Requisitos

- Node.js >= 18
- Instancia de MongoDB accesible

### Instalación

```bash
npm install
```

### Configuración

Copie el archivo `.env.example` a `.env` y modifique los valores según su entorno.

Variables relevantes:

- `PORT`: Puerto donde se expondrá el microservicio (default `3000`).
- `MONGO_URL`: Cadena de conexión a MongoDB.
- `ALLOWED_ORIGINS`: Lista separada por comas para restringir CORS (dejar vacío para permitir todos los orígenes).

### Scripts útiles

- `npm run dev`: Inicia el servicio con recarga automática (nodemon).
- `npm start`: Inicia el servicio en modo producción.

### Endpoints principales

- `GET /usuarios` – Lista todos los usuarios.
- `POST /usuarios` – Crea un usuario nuevo.
- `GET /usuarios/:id` – Recupera un usuario por su `idUsuario`.
- `PUT /usuarios/:id` – Actualiza los datos del usuario.
- `DELETE /usuarios/:id` – Elimina un usuario.
- `POST /auth/login` – Valida credenciales (`email` + `contrasenia`).
- `GET /health` – Verifica el estado del servicio.

Las respuestas siguen el formato `{ data: ... }`. Los errores utilizan HTTP codes estándar y mensajes en castellano.
