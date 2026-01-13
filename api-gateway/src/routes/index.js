const express = require('express');
const usuariosRouter = require('./usuarios');
const horariosRouter = require('./horarios');
const favoritosRouter = require('./favoritos');
const lineasRouter = require('./lineas');
const paradasRouter = require('./paradas');
const trayectosRouter = require('./trayectos');
const trayectosParadasRouter = require('./trayectosParadas');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EtxeBus API Gateway',
    docs: '/api/docs',
    health: '/api/health',
  });
});

router.use('/usuarios', usuariosRouter);
router.use('/horarios', horariosRouter);
router.use('/favoritos', favoritosRouter);
router.use('/lineas', lineasRouter);
router.use('/paradas', paradasRouter);
router.use('/trayectos', trayectosRouter);
router.use('/trayectos-paradas', trayectosParadasRouter);

module.exports = router;
