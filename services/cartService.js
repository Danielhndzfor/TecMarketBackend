const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Función para añadir un producto al carrito
const addToCart = async (userId, productId, quantity) => {
    try {
        // Verifica si el carrito existe
        let cart = await Cart.findOne({ buyer: userId });

        // Si no existe, crea uno nuevo
        if (!cart) {
            cart = new Cart({ buyer: userId, items: [] });
        }

        // Encuentra el producto y obtén su precio
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');
        const price = product.price;

        // Verifica si el producto ya está en el carrito
        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
        
        if (itemIndex > -1) {
            // Si el producto ya está en el carrito, actualiza la cantidad
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Si el producto no está en el carrito, agrégalo
            cart.items.push({ product: productId, quantity, price });
        }

        // Guarda el carrito actualizado
        await cart.save();

        return cart;
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        throw error;
    }
};

//Vaciar el carrito
const clearCart = async (userId) => {
    const cart = await Cart.findOneAndUpdate({ buyer: userId }, { items: [] }, { new: true });

    if (!cart) {
        throw new Error('Cart not found.');
    }

    return cart;
};

// Función para eliminar un producto del carrito
const removeFromCart = async (userId, productId) => {
    try {
        let cart = await Cart.findOne({ buyer: userId });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Filtrar el producto a eliminar del carrito
        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        // Guardar los cambios en el carrito
        cart.updatedAt = Date.now();
        await cart.save();

        return cart;
    } catch (error) {
        console.error('Error removing from cart:', error.message);
        throw error;
    }
};

module.exports = {
    addToCart,
    clearCart,
    removeFromCart
};
