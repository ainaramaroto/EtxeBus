/* eslint-disable no-unused-vars */
const config = require('../config');

const isProd = config.env === 'production';

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    message: err.message || 'Error interno del servidor',
  };

  if (err.code) {
    payload.code = err.code;
  }

  if (!isProd) {
    payload.stack = err.stack;
    if (err.details) payload.details = err.details;
  }

  console.error(
    `[microservicio-usuarios] ${err.message}`,
    !isProd ? err : undefined
  );
  res.status(status).json(payload);
}

module.exports = errorHandler;
