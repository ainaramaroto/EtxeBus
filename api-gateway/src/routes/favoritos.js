const express = require('express');
const favoritosService = require('../services/favoritosService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await favoritosService.listFavoritos(req.query);
    res.json({ data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await favoritosService.obtenerFavorito(req.params.id, req.query);
    res.json({ data });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await favoritosService.crearFavorito(req.body);
    res.status(201).json({ data });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await favoritosService.actualizarFavorito(
      req.params.id,
      req.body,
      req.query
    );
    res.json({ data });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await favoritosService.eliminarFavorito(req.params.id, req.query);
    res.status(204).send();
  })
);

module.exports = router;
