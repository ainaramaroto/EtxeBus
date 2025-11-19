const express = require('express');
const usuariosRouter = require('./usuarios');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/usuarios', usuariosRouter);

module.exports = router;
