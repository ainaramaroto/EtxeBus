/* eslint-disable no-unused-vars */
const config = require('../config');

const isProd = config.env === 'production';
const isTest = config.env === 'test';

function errorHandler(err, req, res, next) {
  const isCorsDenied = typeof err.message === 'string'
    && err.message.startsWith('Origen no permitido:');
  const status = err.status || err.statusCode || (isCorsDenied ? 403 : 500);
  const payload = {
    message: err.message || 'Error interno del servidor',
  };

  if (err.code || isCorsDenied) {
    payload.code = err.code || 'CORS_ORIGIN_NOT_ALLOWED';
  }

  if (!isProd) {
    payload.stack = err.stack;
    if (err.details) payload.details = err.details;
  }

  if (!isTest) {
    console.error(
      `[microservicio-usuarios] ${err.message}`,
      !isProd ? err : undefined
    );
  }
  res.status(status).json(payload);
}

module.exports = errorHandler;
