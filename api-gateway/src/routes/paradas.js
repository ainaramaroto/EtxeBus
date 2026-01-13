const express = require('express');
const transporteService = require('../services/transporteService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await transporteService.listParadas(req.query);
    res.json({ data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await transporteService.obtenerParada(req.params.id);
    res.json({ data });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await transporteService.crearParada(req.body);
    res.status(201).json({ data });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await transporteService.actualizarParada(req.params.id, req.body);
    res.json({ data });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await transporteService.eliminarParada(req.params.id);
    res.json({ data });
  })
);

module.exports = router;
