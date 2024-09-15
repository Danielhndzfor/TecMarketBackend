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

