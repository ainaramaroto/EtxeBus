const express = require('express');
const metroService = require('../services/metroService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/etxebarri',
  asyncHandler(async (req, res) => {
    const limitParam = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 10) : 5;
    const atRaw = req.query.at;
    let atDate = null;
    if (atRaw) {
      const asNumber = Number(atRaw);
      if (Number.isFinite(asNumber)) {
        atDate = new Date(asNumber);
      } else {
        atDate = new Date(atRaw);
      }
    }
    const tzOffsetRaw = Number.parseInt(req.query.tzOffset, 10);
    const tzOffsetMinutes = Number.isFinite(tzOffsetRaw) ? tzOffsetRaw : null;
    const data = await metroService.getUpcomingDepartures({ limit, at: atDate, tzOffsetMinutes });
    res.json({ data });
  })
);

module.exports = router;
