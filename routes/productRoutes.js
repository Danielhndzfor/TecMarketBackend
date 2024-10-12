const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/:id', productController.getProduct);          // Obtener un producto por ID

router.get('/', productController.getProducts);            // Obtener todos los productos

router.get('/seller', protect, productController.getProductsBySeller); // Obtener todos los productos de un vendedor

// Rutas protegidas por autenticación y roles
router.post('/', protect, authorizeRole(['vendedor', 'admin']), productController.createProduct);  // Solo 'vendedor' o 'admin' pueden crear

router.put('/:id', protect, authorizeRole(['vendedor', 'admin']), productController.updateProduct); // Solo 'vendedor' o 'admin' pueden actualizar

// Rutas adicionales
router.get('/total', productController.getTotalProducts); // Obtener total de productos
router.get('/top-sold', productController.getTopSoldProducts); // Obtener top 5 productos más vendidos


// Ruta para actualizar el stock de un producto
router.put('/:productId/stock', productController.updateProductStock);

router.delete('/:id', protect, authorizeRole(['vendedor', 'admin']), productController.deleteProduct);          // Solo 'admin' puede eliminar

module.exports = router;

