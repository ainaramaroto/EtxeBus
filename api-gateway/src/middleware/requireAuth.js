const config = require('../config');
const { verifyJwt } = require('../utils/jwt');

function buildAuthError(message) {
  const error = new Error(message);
  error.status = 401;
  error.code = 'AUTH_UNAUTHORIZED';
  return error;
}

function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string' || !authorizationHeader.trim()) {
    throw buildAuthError('Token Bearer requerido');
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    throw buildAuthError('Formato de Authorization invalido');
  }

  return token;
}

function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.get('authorization'));
    const claims = verifyJwt(token, config.jwtSecret);
    const idUsuario = Number(claims.idUsuario);

    if (!Number.isFinite(idUsuario)) {
      throw buildAuthError('Token invalido');
    }

    req.auth = {
      ...claims,
      idUsuario,
      token,
    };
    return next();
  } catch (error) {
    if (!error.status) {
      return next(buildAuthError(error.message || 'Token invalido'));
    }
    return next(error);
  }
}

module.exports = requireAuth;
