const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/:id', productController.getProduct);          // Obtener un producto por ID
router.get('/', productController.getProducts);            // Obtener todos los productos

// Rutas protegidas por autenticación y roles
router.post('/', protect, authorizeRole(['vendedor', 'admin']), productController.createProduct);  // Solo 'vendedor' o 'admin' pueden crear
router.put('/:id', protect, authorizeRole(['vendedor', 'admin']), productController.updateProduct); // Solo 'vendedor' o 'admin' pueden actualizar
router.delete('/:id', protect, authorizeRole(['vendedor', 'admin']), productController.deleteProduct);          // Solo 'admin' puede eliminar

module.exports = router;

