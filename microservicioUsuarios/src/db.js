const mongoose = require('mongoose');
const config = require('./config');

async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.connection.on('connected', () => {
    console.log('[microservicio-usuarios] Conexion a Mongo establecida');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[microservicio-usuarios] Error en Mongo:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[microservicio-usuarios] Conexion a Mongo cerrada');
  });

  await mongoose.connect(config.mongoUrl, {
    autoIndex: true,
  });

  return mongoose.connection;
}

module.exports = {
  connect,
};
