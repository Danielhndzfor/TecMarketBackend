const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', categoryController.getCategories); // Obtener todas las categorías
router.get('/:id', categoryController.getCategoryById); // Obtener categoría por ID
router.post('/', protect, authorizeRole('admin'), categoryController.createCategory); // Crear una nueva categoría
router.put('/:id', protect, authorizeRole('admin'), categoryController.updateCategory); // Actualizar una categoría
router.delete('/:id', protect, authorizeRole('admin'), categoryController.deleteCategory); // Eliminar una categoría

module.exports = router;

