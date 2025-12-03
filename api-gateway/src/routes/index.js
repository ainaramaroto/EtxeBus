const express = require('express');
const usuariosRouter = require('./usuarios');
const horariosRouter = require('./horarios');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/usuarios', usuariosRouter);
router.use('/horarios', horariosRouter);

module.exports = router;
