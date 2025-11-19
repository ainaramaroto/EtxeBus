/* eslint-disable no-unused-vars */
const { env } = require('../config');

function buildErrorPayload(err) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    message: err.message || 'Error interno del servidor',
  };

  if (err.code) {
    payload.code = err.code;
  }

  if (env !== 'production') {
    payload.details = err.details || err.response?.data || undefined;
    payload.stack = err.stack;
  }

  return { status, payload };
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[api-gateway] ${err.message}`, err);
  const { status, payload } = buildErrorPayload(err);
  res.status(status).json(payload);
}

module.exports = errorHandler;
