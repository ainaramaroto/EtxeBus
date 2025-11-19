const express = require('express');
const usuariosService = require('../services/usuariosService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/usuarios
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const usuarios = await usuariosService.listUsuarios(req.query);
    res.json({ data: usuarios });
  })
);

// GET /api/usuarios/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const usuario = await usuariosService.obtenerUsuario(req.params.id);
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
  asyncHandler(async (req, res) => {
    const actualizado = await usuariosService.actualizarUsuario(
      req.params.id,
      req.body
    );
    res.json({ data: actualizado });
  })
);

// DELETE /api/usuarios/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const eliminado = await usuariosService.eliminarUsuario(req.params.id);
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

module.exports = router;
