const express = require('express');
const transporteService = require('../services/transporteService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await transporteService.listLineas(req.query);
    res.json({ data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await transporteService.obtenerLinea(req.params.id);
    res.json({ data });
  })
);

module.exports = router;
