const express = require('express');
const Usuario = require('../../data/usuario');
const UsuarioModel = require('../models/usuarioModel');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const usuarios = await UsuarioModel.find({}).lean();
    const data = usuarios.map((item) =>
      Usuario.fromObject(item).toJSON()
    );
    res.json({ data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const idUsuario = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(idUsuario)) {
      throw httpError(400, 'idUsuario invalido');
    }

    const encontrado = await UsuarioModel.findOne({ idUsuario }).lean();
    if (!encontrado) {
      throw httpError(404, 'Usuario no encontrado');
    }

    res.json({ data: Usuario.fromObject(encontrado).toJSON() });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const usuario = new Usuario(req.body);
    const documento = usuario.toObject(true);

    try {
      await UsuarioModel.create(documento);
    } catch (error) {
      if (error.code === 11000) {
        throw httpError(409, 'El email o idUsuario ya existe');
      }
      throw error;
    }

    res.status(201).json({ data: usuario.toJSON() });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idUsuario = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(idUsuario)) {
      throw httpError(400, 'idUsuario invalido');
    }

    const existente = await UsuarioModel.findOne({ idUsuario });
    if (!existente) {
      throw httpError(404, 'Usuario no encontrado');
    }

    const usuario = Usuario.fromObject(existente.toObject());
    const { nomUsuario, email, telf, contrasenia } = req.body || {};

    if (nomUsuario !== undefined) {
      if (!Usuario.validarNomUsuario(nomUsuario)) {
        throw httpError(400, 'nomUsuario invalido');
      }
      usuario.nomUsuario = nomUsuario.trim();
    }

    if (email !== undefined) {
      if (!Usuario.validarEmail(email)) {
        throw httpError(400, 'email invalido');
      }
      usuario.email = email.trim();
    }

    if (telf !== undefined) {
      if (!Usuario.validarTelf(telf)) {
        throw httpError(400, 'telf invalido');
      }
      usuario.telf = telf !== null ? String(telf).trim() : null;
    }

    if (contrasenia !== undefined) {
      usuario.setContrasenia(contrasenia);
    }

    existente.nomUsuario = usuario.nomUsuario;
    existente.email = usuario.email;
    existente.telf = usuario.telf;
    existente.contrasenia = usuario.contrasenia;

    try {
      await existente.save();
    } catch (error) {
      if (error.code === 11000) {
        throw httpError(409, 'El email ya existe');
      }
      throw error;
    }

    res.json({ data: usuario.toJSON() });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const idUsuario = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(idUsuario)) {
      throw httpError(400, 'idUsuario invalido');
    }

    const eliminado = await UsuarioModel.findOneAndDelete({ idUsuario }).lean();
    if (!eliminado) {
      throw httpError(404, 'Usuario no encontrado');
    }

    res.json({ data: Usuario.fromObject(eliminado).toJSON() });
  })
);

module.exports = router;
