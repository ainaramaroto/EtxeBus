const express = require('express');
const usuariosService = require('../services/usuariosService');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function parseNumericId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function ensureSameUserOrThrow(authIdUsuario, requestedIdUsuario) {
  if (requestedIdUsuario === null) {
    throw buildHttpError(400, 'idUsuario invalido');
  }
  if (authIdUsuario !== requestedIdUsuario) {
    throw buildHttpError(403, 'No autorizado para operar sobre otro usuario');
  }
  return requestedIdUsuario;
}

// GET /api/usuarios
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const usuarios = await usuariosService.listUsuarios(req.query);
    res.json({ data: usuarios });
  })
);

// GET /api/usuarios/:id
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = ensureSameUserOrThrow(
      req.auth.idUsuario,
      parseNumericId(req.params.id)
    );
    const usuario = await usuariosService.obtenerUsuario(idUsuario);
    res.json({ data: usuario });
  })
);

// POST /api/usuarios
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const creado = await usuariosService.crearUsuario(req.body);
    res.status(201).json({ data: creado });
  })
);

// PUT /api/usuarios/:id
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = ensureSameUserOrThrow(
      req.auth.idUsuario,
      parseNumericId(req.params.id)
    );
    const actualizado = await usuariosService.actualizarUsuario(
      idUsuario,
      req.body
    );
    res.json({ data: actualizado });
  })
);

// DELETE /api/usuarios/:id
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const idUsuario = ensureSameUserOrThrow(
      req.auth.idUsuario,
      parseNumericId(req.params.id)
    );
    const eliminado = await usuariosService.eliminarUsuario(idUsuario);
    res.json({ data: eliminado });
  })
);

// POST /api/usuarios/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const resultado = await usuariosService.loginUsuario(req.body);
    res.json({ data: resultado });
  })
);

// POST /api/usuarios/logout
router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const requestedId = payload.idUsuario === undefined
      ? req.auth.idUsuario
      : parseNumericId(payload.idUsuario);

    ensureSameUserOrThrow(req.auth.idUsuario, requestedId);

    const resultado = await usuariosService.logoutUsuario({
      ...payload,
      idUsuario: req.auth.idUsuario,
    });
    res.json({ data: resultado });
  })
);

module.exports = router;
