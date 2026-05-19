const express = require('express');
const usuariosRouter = require('./usuarios');
const horariosRouter = require('./horarios');
const favoritosRouter = require('./favoritos');
const lineasRouter = require('./lineas');
const paradasRouter = require('./paradas');
const trayectosRouter = require('./trayectos');
const trayectosParadasRouter = require('./trayectosParadas');
const metroRouter = require('./metro');
const usuariosService = require('../services/usuariosService');
const transporteService = require('../services/transporteService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function mapHealthResult(result, fallbackServiceName) {
  if (result.status === 'fulfilled') {
    const payload = result.value || {};
    return {
      status: payload.status === 'ok' ? 'ok' : 'error',
      service: payload.service || fallbackServiceName,
    };
  }

  const error = result.reason || {};
  return {
    status: 'error',
    service: fallbackServiceName,
    code: error.code || null,
    message: error.message || 'No disponible',
    httpStatus: error.status || 500,
  };
}

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

router.get(
  '/health/dependencies',
  asyncHandler(async (req, res) => {
    const [usuariosResult, transporteResult] = await Promise.allSettled([
      usuariosService.healthUsuarios(),
      transporteService.healthTransporte(),
    ]);

    const dependencies = {
      usuarios: mapHealthResult(usuariosResult, 'microservicio-usuarios'),
      transporte: mapHealthResult(transporteResult, 'microservicioTransporte'),
    };

    const allOk =
      dependencies.usuarios.status === 'ok' && dependencies.transporte.status === 'ok';

    res.status(allOk ? 200 : 502).json({
      status: allOk ? 'ok' : 'degraded',
      service: 'api-gateway',
      dependencies,
    });
  })
);

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
router.use('/metro', metroRouter);

module.exports = router;
