const cartService = require('../services/cartService');
const Cart = require('../models/Cart');

// Controlador para añadir un producto al carrito
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const cart = await cartService.addToCart(userId, productId, quantity);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para obtener el carrito
exports.getCart = async (req, res) => {
    const { userId } = req.params;

    try {
        let cart = await Cart.findOne({ buyer: userId });
        if (!cart) {
            // Si no existe carrito, creamos uno vacío con el campo 'buyer'
            cart = new Cart({ buyer: userId, items: [] });
            await cart.save();
        }
        res.status(200).json(cart);
    } catch (err) {
        console.error('Error fetching cart:', err.message); // Detalle del error en el servidor
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


// Eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body; // Cambiar a req.body
        const updatedCart = await cartService.removeFromCart(userId, productId);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

