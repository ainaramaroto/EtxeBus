/* eslint-disable no-unused-vars */
const { env } = require('../config');
const isTest = env === 'test';

function buildErrorPayload(err) {
  const isCorsDenied = typeof err.message === 'string'
    && err.message.startsWith('Origen no permitido:');
  const status = err.status || err.statusCode || (isCorsDenied ? 403 : 500);
  const payload = {
    message: err.message || 'Error interno del servidor',
  };

  if (err.code || isCorsDenied) {
    payload.code = err.code || 'CORS_ORIGIN_NOT_ALLOWED';
  }

  if (env !== 'production') {
    payload.details = err.details || err.response?.data || undefined;
    payload.stack = err.stack;
  }

  return { status, payload };
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!isTest) {
    console.error(`[api-gateway] ${err.message}`, err);
  }
  const { status, payload } = buildErrorPayload(err);
  res.status(status).json(payload);
}

module.exports = errorHandler;
