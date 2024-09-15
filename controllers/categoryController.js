const Category = require('../models/Category');

// Obtener todas las categorías
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las categorías', error });
    }
};

// Obtener una categoría por ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la categoría', error });
    }
};

// Crear una nueva categoría
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.status(201).json({ message: 'Categoría creada exitosamente', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la categoría', error });
    }
};

// Actualizar una categoría
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        if (!updatedCategory) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.status(200).json({ message: 'Categoría actualizada exitosamente', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la categoría', error });
    }
};

// Eliminar una categoría
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.status(200).json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la categoría', error });
    }
};
