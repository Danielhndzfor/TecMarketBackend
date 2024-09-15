const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para obtener el resumen de ventas, solo accesible para vendedores y administradores
router.get('/summary', authMiddleware.authorizeRole('vendedor'), dashboardController.getSalesSummary);

module.exports = router;
