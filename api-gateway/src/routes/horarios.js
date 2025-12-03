const express = require('express');
const horariosService = require('../services/horariosService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await horariosService.listHorarios(req.query);
    res.json({ data });
  })
);

router.get(
  '/publicados',
  asyncHandler(async (req, res) => {
    const data = await horariosService.listHorariosPublicados();
    res.json({ data });
  })
);

module.exports = router;
