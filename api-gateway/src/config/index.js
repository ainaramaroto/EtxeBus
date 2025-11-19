const path = require('path');
const dotenv = require('dotenv');

// Carga el archivo .env si existe en la raíz del proyecto
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const parseOrigins = (value) => {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 4000),
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  requestTimeoutMs: toInt(process.env.REQUEST_TIMEOUT_MS, 8000),
  services: {
    usuarios: process.env.USERS_SERVICE_URL || 'http://localhost:3000',
  },
};

module.exports = config;
