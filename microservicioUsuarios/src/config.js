const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
  quiet: true,
});

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOrigins = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/etxebus',
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  jwtSecret: process.env.JWT_SECRET || 'etxebus-dev-secret-change-me',
  jwtExpiresInSeconds: toInt(process.env.JWT_EXPIRES_IN_SECONDS, 3600),
};

module.exports = config;
