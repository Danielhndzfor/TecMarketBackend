const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Importa el middleware de autenticación
const { createPayment, handlePaymentNotification } = require('../controllers/paymentController'); // Asegúrate de que la ruta sea correcta

// Ruta para crear un nuevo pago (compra)
router.post('/create-payment', protect, createPayment);


module.exports = router;


