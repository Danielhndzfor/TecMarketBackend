const cartService = require('../services/cartService');
const Cart = require('../models/Cart');
const Counter = require('../models/Counter'); // Asegúrate de importar el modelo Counter

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

