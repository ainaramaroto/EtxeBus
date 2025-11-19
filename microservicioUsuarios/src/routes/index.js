const express = require('express');
const usuariosRouter = require('./usuarios');
const authRouter = require('./login');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/usuarios', usuariosRouter);
router.use('/auth', authRouter);

module.exports = router;
