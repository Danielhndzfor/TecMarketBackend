const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Obtener un producto por ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category seller');
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Asegúrate de que las rutas de las imágenes sean URLs completas
        product.images = product.images.map(img => `${req.protocol}://${req.get('host')}/images/${path.basename(img)}`);

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};

// Obtener todos los productos
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category seller');

        // Asegúrate de que las rutas de las imágenes sean URLs completas
        const productsWithImageURLs = products.map(product => {
            return {
                ...product._doc,
                images: product.images.map(img => `${req.protocol}://${req.get('host')}/images/${path.basename(img)}`)
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
    const images = req.files ? req.files.map(file => file.path) : []; // Obtiene la URL de Cloudinary

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
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error });
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

            imagesToDeleteArray.forEach(image => {
                if (typeof image === 'string') {
                    const imageName = image.split('/').pop(); // Extrae el nombre de la imagen de la URL
                    const imagePath = path.join('.', 'uploads',  imageName); // Ruta del archivo en el servidor

                    // Eliminar el archivo físico del servidor
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error(`Error al eliminar la imagen: ${imagePath}`, err);
                        } else {
                            console.log(`Imagen eliminada del servidor: ${imagePath}`);
                        }
                    });

                    // Eliminar imagen del array de la base de datos
                    const indexToRemove = product.images.findIndex(img => img.includes(imageName));
                    if (indexToRemove > -1) {
                        product.images.splice(indexToRemove, 1);
                    }
                } else {
                    console.error('Error: La imagen a eliminar no es una cadena', image);
                }
            });
        }

        // Actualiza los demás campos del producto
        product.name = name || product.name;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.description = description || product.description;
        product.category = category || product.category;

        // Si hay nuevas imágenes, añádelas al array de imágenes
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `uploads/${file.filename}`); // Asume que las nuevas imágenes se guardan en la carpeta uploads
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
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
};
