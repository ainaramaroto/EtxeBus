const express = require('express');
const Preferencia = require('../../data/preferencia');
const PreferenciaModel = require('../models/preferenciaModel');
const UsuarioModel = require('../models/usuarioModel');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

function parseNumericId(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const idUsuario = parseNumericId(req.query.idUsuario || req.query.id_usuario);
    if (idUsuario === null) {
      throw httpError(400, 'idUsuario requerido');
    }

    const preferencias = await PreferenciaModel.find({ idUsuario })
      .sort({ createdAt: -1 })
      .lean();
    const data = preferencias.map((item) => Preferencia.fromObject(item).toJSON());
    res.json({ data });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const idUsuario = parseNumericId(payload.idUsuario);
    if (idUsuario === null) {
      throw httpError(400, 'idUsuario requerido');
    }

    const usuarioExiste = await UsuarioModel.exists({ idUsuario });
    if (!usuarioExiste) {
      throw httpError(404, 'Usuario no encontrado');
    }

    const preferencia = new Preferencia({
      ...payload,
      idUsuario,
      tipo: payload.tipo || 'trayecto',
    });
    const documento = preferencia.toObject();

    try {
      await PreferenciaModel.create(documento);
    } catch (error) {
      if (error.code === 11000) {
        throw httpError(409, 'La preferencia ya existe para este usuario');
      }
      throw error;
    }

    res.status(201).json({ data: preferencia.toJSON() });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const idPreferencia = parseNumericId(req.params.id);
    if (idPreferencia === null) {
      throw httpError(400, 'idPreferencia invalido');
    }
    const idUsuario = parseNumericId(req.query.idUsuario || req.query.id_usuario);
    if (idUsuario === null) {
      throw httpError(400, 'idUsuario requerido');
    }

    const eliminado = await PreferenciaModel.findOneAndDelete({
      idPreferencia,
      idUsuario,
    }).lean();

    if (!eliminado) {
      throw httpError(404, 'Preferencia no encontrada');
    }

    res.json({ data: Preferencia.fromObject(eliminado).toJSON() });
  })
);

module.exports = router;
