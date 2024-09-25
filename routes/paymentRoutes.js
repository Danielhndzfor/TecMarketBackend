const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController'); // Asegúrate de que la ruta es correcta
const { protect } = require('../middleware/authMiddleware'); // Importa el middleware de autenticación

// Ruta para crear el pago (protegida por el middleware de autenticación)
router.post('/create-payment', protect, paymentController.createPayment);

// Ruta para manejar las notificaciones de pago
router.post('/payment-notification', paymentController.handlePaymentNotification);

module.exports = router;

