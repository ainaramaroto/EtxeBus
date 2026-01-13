const express = require('express');
const transporteService = require('../services/transporteService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await transporteService.listTrayectosParadas(req.query);
    res.json({ data });
  })
);

router.get(
  '/:routeId/:stopId',
  asyncHandler(async (req, res) => {
    const data = await transporteService.obtenerTrayectoParada(
      req.params.routeId,
      req.params.stopId
    );
    res.json({ data });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await transporteService.crearTrayectoParada(req.body);
    res.status(201).json({ data });
  })
);

router.put(
  '/:routeId/:stopId',
  asyncHandler(async (req, res) => {
    const data = await transporteService.actualizarTrayectoParada(
      req.params.routeId,
      req.params.stopId,
      req.body
    );
    res.json({ data });
  })
);

router.delete(
  '/:routeId/:stopId',
  asyncHandler(async (req, res) => {
    const data = await transporteService.eliminarTrayectoParada(
      req.params.routeId,
      req.params.stopId
    );
    res.json({ data });
  })
);

module.exports = router;
