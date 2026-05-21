const crypto = require('crypto');

const DEFAULT_EXPIRATION_SECONDS = 3600;

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  if (typeof value !== 'string' || !value) {
    throw new Error('Token invalido');
  }

  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (base64.length % 4)) % 4;
  const padded = `${base64}${'='.repeat(paddingLength)}`;
  return Buffer.from(padded, 'base64');
}

function parseJsonBuffer(buffer) {
  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch {
    throw new Error('Token invalido');
  }
}

function assertSecret(secret) {
  if (typeof secret !== 'string' || !secret.trim()) {
    throw new Error('JWT secret no configurado');
  }
}

function computeSignature(encodedHeader, encodedPayload, secret) {
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();
  return toBase64Url(signature);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getExpirationSeconds(value) {
  if (!Number.isFinite(value)) return DEFAULT_EXPIRATION_SECONDS;
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : DEFAULT_EXPIRATION_SECONDS;
}

function signJwt(payload, secret, options = {}) {
  assertSecret(secret);

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload JWT invalido');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = getExpirationSeconds(options.expiresInSeconds);
  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  );
  const encodedPayload = toBase64Url(JSON.stringify(claims));
  const encodedSignature = computeSignature(encodedHeader, encodedPayload, secret);

  return {
    token: `${encodedHeader}.${encodedPayload}.${encodedSignature}`,
    payload: claims,
  };
}

function verifyJwt(token, secret) {
  assertSecret(secret);

  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Token no proporcionado');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Token invalido');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJsonBuffer(fromBase64Url(encodedHeader));
  if (!header || header.alg !== 'HS256') {
    throw new Error('Token invalido');
  }

  const expectedSignature = computeSignature(encodedHeader, encodedPayload, secret);
  if (!safeEqual(expectedSignature, encodedSignature)) {
    throw new Error('Token invalido');
  }

  const payload = parseJsonBuffer(fromBase64Url(encodedPayload));
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Token invalido');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.nbf && Number.isFinite(payload.nbf) && now < payload.nbf) {
    throw new Error('Token aun no valido');
  }
  if (!Number.isFinite(payload.exp) || now >= payload.exp) {
    throw new Error('Token expirado');
  }

  return payload;
}

module.exports = {
  signJwt,
  verifyJwt,
};
