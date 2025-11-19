const express = require('express');
const Usuario = require('../../data/usuario');
const UsuarioModel = require('../models/usuarioModel');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, contrasenia } = req.body || {};

    if (!email || !contrasenia) {
      throw httpError(400, 'email y contrasenia son requeridos');
    }

    const encontrado = await UsuarioModel.findOne({
      email: String(email).trim().toLowerCase(),
    }).lean();

    if (!encontrado) {
      throw httpError(401, 'Credenciales invalidas');
    }

    const usuario = Usuario.fromObject(encontrado);

    if (!usuario.verificarContrasenia(contrasenia)) {
      throw httpError(401, 'Credenciales invalidas');
    }

    res.json({ data: usuario.toJSON() });
  })
);

module.exports = router;
