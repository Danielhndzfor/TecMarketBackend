// cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController'); // Ajusta la ruta según tu estructura

// Ruta para añadir al carrito
router.post('/add', cartController.addToCart);

// Ruta para obtener el carrito del usuario
router.get('/:userId', cartController.getCart);

// Ruta para eliminar del carrito
router.post('/remove', cartController.removeFromCart);

// Vaciar el carrito
router.delete('/clear/:userId', cartController.clearCart);  // Nueva ruta para vaciar el carrito

module.exports = router;



