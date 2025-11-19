const http = require('http');
const app = require('./app');
const config = require('./config');
const { connect } = require('./db');

async function start() {
  try {
    await connect();

    const server = http.createServer(app);

    server.listen(config.port, () => {
      console.log(
        `[microservicio-usuarios] escuchando en puerto ${config.port} (env: ${config.env})`
      );
    });

    const shutdown = () => {
      console.log('\n[microservicio-usuarios] cerrando servidor...');
      server.close(() => {
        console.log('[microservicio-usuarios] servidor detenido');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    return server;
  } catch (error) {
    console.error(
      '[microservicio-usuarios] No se pudo iniciar el servidor:',
      error.message
    );
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = start;
