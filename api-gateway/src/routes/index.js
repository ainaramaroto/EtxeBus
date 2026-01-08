const express = require('express');
const usuariosRouter = require('./usuarios');
const horariosRouter = require('./horarios');
const favoritosRouter = require('./favoritos');
const lineasRouter = require('./lineas');
const paradasRouter = require('./paradas');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/usuarios', usuariosRouter);
router.use('/horarios', horariosRouter);
router.use('/favoritos', favoritosRouter);
router.use('/lineas', lineasRouter);
router.use('/paradas', paradasRouter);

module.exports = router;
