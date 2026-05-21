const express = require('express');
const favoritosService = require('../services/favoritosService');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function parseNumericId(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function resolveAuthorizedUserId(req, requestedId) {
  const authIdUsuario = req.auth.idUsuario;

  if (requestedId === undefined || requestedId === null || requestedId === '') {
    return authIdUsuario;
  }

  const parsedRequested = parseNumericId(requestedId);
  if (parsedRequested === null) {
    throw buildHttpError(400, 'idUsuario invalido');
  }

  if (parsedRequested !== authIdUsuario) {
    throw buildHttpError(403, 'No autorizado para operar sobre otro usuario');
  }

  return authIdUsuario;
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = resolveAuthorizedUserId(
      req,
      req.query.idUsuario ?? req.query.id_usuario
    );
    const query = {
      ...req.query,
      idUsuario,
    };
    delete query.id_usuario;

    const data = await favoritosService.listFavoritos(query);
    res.json({ data });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = resolveAuthorizedUserId(
      req,
      req.query.idUsuario ?? req.query.id_usuario
    );
    const query = {
      ...req.query,
      idUsuario,
    };
    delete query.id_usuario;

    const data = await favoritosService.obtenerFavorito(req.params.id, query);
    res.json({ data });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = resolveAuthorizedUserId(req, (req.body || {}).idUsuario);
    const payload = {
      ...(req.body || {}),
      idUsuario,
    };

    const data = await favoritosService.crearFavorito(payload);
    res.status(201).json({ data });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = resolveAuthorizedUserId(
      req,
      req.query.idUsuario ?? req.query.id_usuario
    );
    const query = {
      ...req.query,
      idUsuario,
    };
    delete query.id_usuario;

    const data = await favoritosService.actualizarFavorito(
      req.params.id,
      req.body,
      query
    );
    res.json({ data });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = resolveAuthorizedUserId(
      req,
      req.query.idUsuario ?? req.query.id_usuario
    );
    const query = {
      ...req.query,
      idUsuario,
    };
    delete query.id_usuario;

    await favoritosService.eliminarFavorito(req.params.id, query);
    res.status(204).send();
  })
);

module.exports = router;
