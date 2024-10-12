const Product = require('../models/Product');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Obtener un producto por ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('seller');  // Popula los datos del vendedor

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};


// Controlador para obtener los productos del vendedor autenticado
exports.getProductsBySeller = async (req, res) => {
    try {
        const products = req.user.role === 'admin'
            ? await Product.find().populate('category').populate('seller')  // Incluye la información del vendedor
            : await Product.find({ seller: req.user._id }).populate('category').populate('seller');

        if (!products.length) {
            return res.status(404).json({ message: 'No se encontraron productos para este vendedor.' });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};


// Obtener todos los productos
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category').populate('seller');  // Incluye la información del vendedor
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};


// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    const { name, description, price, stock, category } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }

        const imagePaths = req.files.map(file => file.path);

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            seller: user._id,
            sellerName: user.name,
            sellerFirstName: user.firstName,
            sellerLastName: user.lastName,
            sellerEmail: user.email,
            images: imagePaths
        });

        await newProduct.save();
        res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, stock, description, category, imagesToDelete } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Eliminar imágenes si se especifica
        if (imagesToDelete && imagesToDelete.length > 0) {
            const imagesToDeleteArray = Array.isArray(imagesToDelete) ? imagesToDelete : JSON.parse(imagesToDelete);
            for (const image of imagesToDeleteArray) {
                const publicId = image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                product.images = product.images.filter(img => !img.includes(publicId)); // Elimina la imagen del array
            }
        }

        // Actualiza los demás campos del producto
        product.name = name || product.name;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.description = description || product.description;
        product.category = category || product.category;

        // Añade nuevas imágenes
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            product.images.push(...newImages);
        }

        const updatedProduct = await product.save();
        res.json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

// Actualizar stock de un producto
exports.updateProductStock = async (req, res) => {
    const { productId } = req.params; // Obtener productId
    const { status, quantity } = req.body; // Estado y cantidad del ítem

    try {
        // Buscar el producto
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Ajustar el stock del producto según el estado
        if (status === 'completado') {
            product.stock -= quantity; // Reduce el stock según la cantidad
        } else if (status === 'pendiente') {
            product.stock -= quantity; // Aumenta el stock según la cantidad
        } else if (status === 'cancelado') {
            // se regresa la cantidad al stock, es decir, se suma la cantidad
            product.stock += quantity;
        }

        // Guardar cambios en el producto
        await product.save();

        return res.status(200).json({ message: 'Stock del producto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el stock del producto', error });
    }
};


// Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        for (const image of deletedProduct.images) {
            const publicId = image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};


// Obtener total de productos
exports.getTotalProducts = async (req, res) => {
    try {
        const total = await Product.countDocuments();
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el total de productos' });
    }
};

// Obtener top 5 productos más vendidos
exports.getTopSoldProducts = async (req, res) => {
    try {
        const topSold = await Product.find()
            .sort({ sold: -1 }) // Asumiendo que hay un campo "sold" que lleva la cuenta de las ventas
            .limit(5);
        res.json(topSold);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos más vendidos' });
    }
};

