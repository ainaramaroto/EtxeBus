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

function buildUpdatesFromPayload(payload = {}) {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'tipo')) {
    if (!Preferencia.validarTipo(payload.tipo)) {
      throw httpError(400, 'tipo invalido');
    }
    updates.tipo = String(payload.tipo).trim();
  }

  const fieldMap = {
    paradaOrigen: 'paradaOrigen',
    paradaDestino: 'paradaDestino',
    nomParadaOrigen: 'nomParadaOrigen',
    nomParadaDestino: 'nomParadaDestino',
    origin_slug: 'paradaOrigen',
    destination_slug: 'paradaDestino',
    origin_label: 'nomParadaOrigen',
    destination_label: 'nomParadaDestino',
  };

  Object.entries(fieldMap).forEach(([incoming, canonical]) => {
    if (Object.prototype.hasOwnProperty.call(payload, incoming)) {
      updates[canonical] = Preferencia.parseNullableString(payload[incoming], 120);
    }
  });

  return updates;
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

router.get(
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

    const encontrada = await PreferenciaModel.findOne({
      idPreferencia,
      idUsuario,
    }).lean();

    if (!encontrada) {
      throw httpError(404, 'Preferencia no encontrada');
    }

    res.json({ data: Preferencia.fromObject(encontrada).toJSON() });
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

router.put(
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

    const updates = buildUpdatesFromPayload(req.body || {});
    if (!Object.keys(updates).length) {
      throw httpError(400, 'No hay campos para actualizar');
    }

    const existente = await PreferenciaModel.findOne({ idPreferencia, idUsuario });
    if (!existente) {
      throw httpError(404, 'Preferencia no encontrada');
    }

    Object.assign(existente, updates);

    try {
      await existente.save();
    } catch (error) {
      if (error.code === 11000) {
        throw httpError(409, 'La preferencia ya existe para este usuario');
      }
      throw error;
    }

    res.json({ data: Preferencia.fromObject(existente.toObject()).toJSON() });
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
