const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Obtener un producto por ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category seller');
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Asegúrate de que las imágenes sean URLs de Cloudinary
        // Se asume que product.images ya contiene las URLs completas de Cloudinary
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};

// Obtener todos los productos
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category seller');

        // Asegúrate de que las imágenes sean URLs de Cloudinary
        // Se asume que product.images ya contiene las URLs completas de Cloudinary
        const productsWithImageURLs = products.map(product => {
            return {
                ...product._doc,
                images: product.images // Aquí no es necesario modificar ya que son URLs de Cloudinary
            };
        });

        res.json(productsWithImageURLs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    const { name, description, price, stock, category, seller, rating } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    try {
        const product = new Product({
            name,
            description,
            price,
            stock,
            category,
            seller,
            rating,
            images,
        });

        const savedProduct = await product.save();
        res.status(201).json({ message: 'Producto creado exitosamente!', product: savedProduct });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};






// Actualizar producto
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, stock, description, category, imagesToDelete } = req.body;

        // Encuentra el producto en la base de datos
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si hay imágenes a eliminar, procesa la eliminación
        if (imagesToDelete && imagesToDelete.length > 0) {
            const imagesToDeleteArray = Array.isArray(imagesToDelete) ? imagesToDelete : JSON.parse(imagesToDelete);

            for (const image of imagesToDeleteArray) {
                if (typeof image === 'string') {
                    // Extrae el ID de la imagen de Cloudinary de la URL
                    const publicId = image.split('/').pop().split('.')[0]; // Ajusta según el formato de la URL de Cloudinary
                    
                    // Eliminar imagen de Cloudinary
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

                    // Eliminar imagen del array de la base de datos
                    const indexToRemove = product.images.findIndex(img => img.includes(publicId));
                    if (indexToRemove > -1) {
                        product.images.splice(indexToRemove, 1);
                    }
                } else {
                    console.error('Error: La imagen a eliminar no es una cadena', image);
                }
            }
        }

        // Actualiza los demás campos del producto
        product.name = name || product.name;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.description = description || product.description;
        product.category = category || product.category;

        // Si hay nuevas imágenes, añádelas al array de imágenes
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path); // Asume que las nuevas imágenes están en Cloudinary
            product.images.push(...newImages);
        }

        // Guarda los cambios en la base de datos
        const updatedProduct = await product.save();

        res.json(updatedProduct); // Devuelve el producto actualizado como respuesta
    } catch (error) {
        console.error('Error al actualizar el producto', error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

// Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Eliminar las imágenes de Cloudinary
        for (const image of deletedProduct.images) {
            const publicId = image.split('/').pop().split('.')[0]; // Ajusta según el formato de la URL de Cloudinary
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            } catch (cloudinaryError) {
                console.error(`Error al eliminar imagen de Cloudinary: ${publicId}`, cloudinaryError);
                // No detengas el proceso si hay un error con Cloudinary, puedes manejarlo aquí
            }
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el producto', error);
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
};