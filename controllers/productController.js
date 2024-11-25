const Product = require('../models/Product');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const Counter = require('../models/counter'); // Asegúrate de importar el modelo de Counter

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
            ? await Product.find().populate('category').populate('seller')
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
        const products = await Product.find().populate('category').populate('seller');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};

// Obtener productos por categoría
exports.getProductsByCategory = async (req, res) => {
    const categoryId = req.params.categoryId; // Asumiendo que pasas el ID de la categoría como un parámetro

    try {
        const products = await Product.find({ category: categoryId }) // Filtra productos por categoría
            .populate('category')
            .populate('seller');

        if (!products.length) {
            return res.status(404).json({ message: 'No se encontraron productos para esta categoría' });
        }

        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).json({ message: 'Error al obtener productos por categoría', error: error.message });
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

        // Obtener el siguiente productId del contador
        const counterDoc = await Counter.findById('productId');
        if (!counterDoc) {
            const newCounter = new Counter({ _id: 'productId', sequenceValue: 0 });
            await newCounter.save();
        }
        const nextProductId = counterDoc.sequenceValue + 1;

        const newProduct = new Product({
            productId: nextProductId,
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
            sellerClabe: user.clabe,
            images: imagePaths
        });

        await newProduct.save();

        // Actualizar el contador
        counterDoc.sequenceValue = nextProductId;
        await counterDoc.save();

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

        // Encuentra el producto por su ID y popula la categoría
        let product = await Product.findById(productId).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Eliminar imágenes si se especifica
        if (imagesToDelete && imagesToDelete.length > 0) {
            const imagesToDeleteArray = Array.isArray(imagesToDelete) ? imagesToDelete : JSON.parse(imagesToDelete);
            for (const image of imagesToDeleteArray) {
                const publicId = image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                product.images = product.images.filter(img => !img.includes(publicId));
            }
        }

        // Actualiza los campos del producto
        product.name = name || product.name;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.description = description || product.description;
        product.category = category || product.category;

        // Añadir nuevas imágenes
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            product.images.push(...newImages);
        }

        const updatedProduct = await product.save();

        // Popula nuevamente la categoría para incluir el `name` en la respuesta
        await updatedProduct.populate('category', 'name');

        res.json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};


// Actualizar stock de un producto basado en el estado
exports.updateProductStock = async (req, res) => {
    const { productId } = req.params;
    const { newStatus, quantity } = req.body; // `newStatus` es el estado al que se quiere cambiar

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const currentStatus = product.status || 'pendiente'; // Estado actual, predeterminado a 'pendiente'

        // Lógica para manejar las transiciones de estado
        switch (true) {
            case currentStatus === 'pendiente' && newStatus === 'completado':
                // De pendiente a completado: Verificar stock antes de completar
                if (product.stock < quantity) {
                    return res.status(400).json({ message: 'Stock insuficiente para completar el pedido' });
                }
                product.stock -= quantity; // Reducir stock al completar
                break;

            case currentStatus === 'pendiente' && newStatus === 'cancelado':
                // De pendiente a cancelado: Reponer la cantidad al stock
                product.stock += quantity;
                break;

            case currentStatus === 'cancelado' && newStatus === 'pendiente':
                // De cancelado a pendiente: Verificar stock antes de reactivar
                if (product.stock < quantity) {
                    return res.status(400).json({ message: 'Stock insuficiente para reactivar el pedido' });
                }
                product.stock -= quantity; // Reducir stock al reactivar
                break;

            case currentStatus === 'cancelado' && newStatus === 'completado':
                // De cancelado a completado: Verificar stock antes de completar
                if (product.stock < quantity) {
                    return res.status(400).json({ message: 'Stock insuficiente para completar el pedido' });
                }
                product.stock -= quantity; // Reducir stock al completar
                break;

            case currentStatus === 'completado' && newStatus === 'pendiente':
                // De completado a pendiente: Permitir volver al estado inicial sin afectar el stock
                break;

            case currentStatus === 'completado' && newStatus === 'cancelado':
                // De completado a cancelado: Reponer la cantidad al stock
                product.stock += quantity;
                break;

            default:
                return res.status(400).json({ message: 'Transición de estado no válida' });
        }

        // Actualizar el estado del producto
        product.status = newStatus;

        // Guardar los cambios
        await product.save();
        return res.status(200).json({ message: 'Estado y stock actualizados correctamente', product });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el estado del producto', error });
    }
};




// Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
    try {
        // Buscar y eliminar el producto
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Extraer los publicIds de las imágenes
        const publicIds = deletedProduct.images.map(image => {
            return image.split('/uploads/')[1].split('.')[0]; // Extraer el publicId
        });

        // Eliminar las imágenes en Cloudinary
        if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(
                publicIds.map(id => `uploads/${id}`), // Asegurarse de incluir 'uploads/' en cada publicId
                { resource_type: 'image' } // Opcional, para especificar que son imágenes
            );
            console.log('Imágenes eliminadas:', publicIds); // Verificar los IDs eliminados
        }

        res.json({ message: 'Producto eliminado correctamente y sus imágenes asociadas' });
    } catch (error) {
        console.error('Error al eliminar producto o imágenes:', error); // Debug
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
            .sort({ sold: -1 })
            .limit(5);
        res.json(topSold);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos más vendidos' });
    }
};
