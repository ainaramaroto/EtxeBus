const express = require('express');
const usuariosRouter = require('./usuarios');
const authRouter = require('./login');
const favoritosRouter = require('./favoritos');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/usuarios', usuariosRouter);
router.use('/auth', authRouter);
router.use('/favoritos', favoritosRouter);

module.exports = router;
