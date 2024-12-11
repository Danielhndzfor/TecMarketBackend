const cartService = require('../services/cartService');
const Cart = require('../models/Cart');
const Counter = require('../models/counter'); // Asegúrate de importar el modelo Counter
const mongoose = require('mongoose');

// Controlador para añadir un producto al carrito
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, cartId } = req.body; // Incluye cartId
        const cart = await cartService.addToCart(userId, productId, quantity, cartId);

        // Incluir cartId en la respuesta
        res.json({
            cartId: cart.cartId,
            items: cart.items,
        });

        console.log('cartId recibido:', cartId);
        console.log('Usuario ID:', userId);

    } catch (error) {
        console.error('Error al añadir al carrito:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Controlador para añadir un producto al carrito
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, cartId } = req.body; // Incluye cartId
        const cart = await cartService.addToCart(userId, productId, quantity, cartId);

        // Incluir cartId en la respuesta
        res.json({
            cartId: cart.cartId,
            items: cart.items,
        });

        console.log('cartId recibido:', cartId);
        console.log('Usuario ID:', userId);

    } catch (error) {
        console.error('Error al añadir al carrito:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Controlador para aumentar la cantidad de un producto en el carrito
// Controlador para aumentar la cantidad de un producto en el carrito
exports.increaseQuantity = async (req, res) => {
    try {
        console.log('Cuerpo de la solicitud:', req.body); // Verifica el cuerpo de la solicitud

        const { userId, productId, cartId } = req.body;

        console.log('cartId recibido:', cartId);

        // Convertir cartId a ObjectId correctamente
        const cartObjectId = new mongoose.Types.ObjectId(cartId);
        console.log('cartObjectId:', cartObjectId);

        // Buscar carrito por cartId
        const cart = await Cart.findById(cartObjectId);
        if (!cart) {
            console.log('Carrito no encontrado');
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Llamamos al servicio para incrementar la cantidad
        const updatedCart = await cartService.updateProductQuantity(userId, productId, 1, cartObjectId);

        res.status(200).json({
            cartId: updatedCart.cartId,
            items: updatedCart.items,
        });
    } catch (error) {
        console.error('Error increasing product quantity:', error.message);
        res.status(500).json({ message: error.message });
    }
};



// Controlador para disminuir la cantidad de un producto en el carrito
exports.decreaseQuantity = async (req, res) => {
    try {
        const { userId, productId, cartId } = req.body;

        // Validación rápida para evitar solicitudes incompletas
        if (!userId || !productId || !cartId) {
            return res.status(400).json({ message: 'Faltan datos en la solicitud' });
        }

        // Convertir cartId a ObjectId correctamente
        const cartObjectId = new mongoose.Types.ObjectId(cartId);

        // Disminuir cantidad
        const updatedCart = await cartService.updateProductQuantity(userId, productId, -1, cartObjectId);

        // Respuesta con el carrito actualizado
        res.status(200).json({
            cartId: updatedCart._id,  // Ahora usamos _id de MongoDB
            items: updatedCart.items,
        });
    } catch (error) {
        console.error('Error al disminuir la cantidad del producto:', error.message);
        res.status(500).json({ message: error.message });
    }
};






// Controlador para actualizar la cantidad de un producto en el carrito
exports.updateQuantity = async (req, res) => {
    try {
        const { userId, productId, quantity, cartId } = req.body;

        // Verifica si la cantidad es válida (mayor que 0)
        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        // Llamamos al servicio para actualizar la cantidad del producto
        const updatedCart = await cartService.updateProductQuantity(userId, productId, quantity, cartId);

        // Devuelve el carrito actualizado
        res.status(200).json({
            cartId: updatedCart.cartId,
            items: updatedCart.items,
        });
    } catch (error) {
        console.error('Error updating product quantity:', error.message);
        res.status(500).json({ message: error.message });
    }
};


// Controlador para obtener el carrito
exports.getCart = async (req, res) => {
    const { userId } = req.params;

    try {
        let cart = await Cart.findOne({ buyer: userId });
        if (!cart) {
            // Si no existe carrito, creamos uno vacío
            const counterDoc = await Counter.findOne({ _id: 'cartId' }); // Asegúrate de que el ID del contador sea correcto
            if (!counterDoc) {
                return res.status(500).json({ message: 'Counter not found' });
            }
            const nextCartId = counterDoc.sequenceValue + 1;

            // Crear un nuevo carrito y asignar cartId
            cart = new Cart({ buyer: userId, items: [], cartId: nextCartId });
            await cart.save();

            // Actualizar el contador
            counterDoc.sequenceValue = nextCartId;
            await counterDoc.save();
        }
        res.status(200).json(cart);
    } catch (err) {
        console.error('Error fetching cart:', err.message);
        res.status(500).json({ message: 'Error fetching cart.' });
    }
};


// Controlador para vaciar el carrito
exports.clearCart = async (req, res) => {
    const { userId } = req.params; // Obtenemos el userId desde los parámetros de la URL

    try {
        // Actualizamos el carrito del usuario, estableciendo los items como un arreglo vacío
        const cart = await Cart.findOneAndUpdate({ buyer: userId }, { items: [] }, { new: true });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        res.status(200).json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        console.error('Error clearing cart:', error.message);
        res.status(500).json({ message: 'Failed to clear cart.' });
    }
};

// Controlador para eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId, cartId } = req.body; // Incluye cartId

        // Verifica que cartId sea válido
        if (!cartId || isNaN(cartId)) {
            return res.status(400).json({ message: 'Invalid cartId' });
        }

        const updatedCart = await cartService.removeFromCart(userId, productId, cartId); // Pasa cartId

        // Verifica si se devolvió un carrito actualizado
        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart not found or product not in cart' });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error removing item from cart:', error.message);
        res.status(500).json({ message: error.message });
    }
};

