const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const crypto = require('crypto');

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const port = process.env.PORT || 4000;
const baseUrl =
  process.env.GATEWAY_URL ||
  process.env.API_GATEWAY_URL ||
  `http://localhost:${port}/api`;

const randomSuffix = crypto.randomBytes(3).toString('hex');

const usuarioPayload = {
  nomUsuario: `usuario_${randomSuffix}`,
  email: `usuario.${randomSuffix}@etxebus.test`,
  contrasenia: 'Temporal123',
};

async function main() {
  console.log(`[seed] Creando usuario de prueba en ${baseUrl}/usuarios`);
  try {
    const { data } = await axios.post(`${baseUrl}/usuarios`, usuarioPayload, {
      timeout: Number.parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 8000,
    });
    console.log('[seed] Usuario creado correctamente:');
    console.log(JSON.stringify(data, null, 2));

    const loginPayload = {
      email: usuarioPayload.email,
      contrasenia: usuarioPayload.contrasenia,
    };

    const loginResponse = await axios.post(
      `${baseUrl}/usuarios/login`,
      loginPayload,
      {
        timeout: Number.parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 8000,
      }
    );

    console.log('[seed] Resultado de login:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error(
        `[seed] Error del gateway (${error.response.status}):`,
        error.response.data
      );
    } else {
      console.error('[seed] No se pudo crear el usuario:', error.message);
    }
    process.exitCode = 1;
  }
}

main();
