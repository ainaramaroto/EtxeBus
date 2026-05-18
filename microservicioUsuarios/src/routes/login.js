const express = require('express');
const Usuario = require('../../data/usuario');
const UsuarioModel = require('../models/usuarioModel');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, usuario, nomUsuario, contrasenia } = req.body || {};

    const identifierInput = email ?? usuario ?? nomUsuario ?? '';
    const identifier = String(identifierInput).trim();

    if (!identifier || !contrasenia) {
      throw httpError(400, 'identificador y contrasenia son requeridos');
    }

    const shouldUseEmail =
      Boolean(email) || (!usuario && !nomUsuario && identifier.includes('@'));

    const query = shouldUseEmail
      ? { email: identifier.toLowerCase() }
      : { nomUsuario: identifier };

    const encontrado = await UsuarioModel.findOne(query).lean();

    if (!encontrado) {
      throw httpError(401, 'Credenciales invalidas');
    }

    const usuarioEncontrado = Usuario.fromObject(encontrado);

    if (!usuarioEncontrado.verificarContrasenia(contrasenia)) {
      throw httpError(401, 'Credenciales invalidas');
    }

    res.json({ data: usuarioEncontrado.toJSON() });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    // Actualmente la autenticacion es stateless en cliente (sin token/cookie de sesion en backend).
    // Este endpoint normaliza el cierre de sesion para futuras estrategias de auth.
    res.json({
      data: {
        loggedOut: true,
      },
    });
  })
);

module.exports = router;
