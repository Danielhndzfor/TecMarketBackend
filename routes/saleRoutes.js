const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Ruta para procesar una venta
router.post('/process', saleController.processSale);

module.exports = router;
