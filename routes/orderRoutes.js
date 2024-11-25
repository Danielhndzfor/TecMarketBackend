const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Ruta para crear una nueva orden
router.post('/', orderController.createOrder);

// Ruta para obtener todas las órdenes
router.get('/all', orderController.getAllOrders);

// Ruta para obtener una orden por ID
router.get('/:orderId', orderController.getOrder);

// Ruta para obtener todas las órdenes de un vendedor
router.get('/seller/:sellerId', orderController.getOrdersBySeller);

// Ruta para actualizar una orden por ID
router.put('/:orderId', orderController.updateOrder);

// Ruta para eliminar una orden por ID
router.delete('/:orderId', orderController.deleteOrder);

// Ruta para actualizar el estado de un ítem en una orden
router.put('/:orderId/items/:itemId/status', orderController.updateItemStatus);

// Ruta para obtener las órdenes de un comprador específico
router.get('/buyer/:buyerId', orderController.getOrdersByBuyer);


module.exports = router;
