const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Ruta para obtener el historial de compras
router.get('/purchases/:userId', historyController.getPurchaseHistory);

module.exports = router;
