const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para obtener el resumen de ventas, solo accesible para vendedores y administradores
router.get('/summary', authMiddleware.protect, authMiddleware.authorizeRole('vendedor', 'administrador'), dashboardController.getSalesSummary);

// Ruta para actualizar el estado de una orden, protegida
router.put('/update-status', authMiddleware.protect, dashboardController.updateOrderStatus);

module.exports = router;

