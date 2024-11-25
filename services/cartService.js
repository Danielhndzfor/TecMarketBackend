const Product = require('../models/Product');
const Cart = require('../models/Cart');
const mongoose = require('mongoose'); // Asegúrate de importar mongoose

// Función para añadir un producto al carrito
const addToCart = async (userId, productId, quantity, cartId = null) => {
    try {
        let cart;

        // Busca el carrito por cartId o buyer
        if (cartId) {
            cartId = Number(cartId); // Asegúrate de convertir cartId a un número
            cart = await Cart.findOne({ cartId });
        } else {
            cart = await Cart.findOne({ buyer: userId });
        }

        // Si no existe, crea uno nuevo
        if (!cart) {
            cart = new Cart({ buyer: userId, items: [] });
        }

        // Encuentra el producto y obtén su precio
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');
        const price = product.price;

        // Verifica si el producto ya está en el carrito
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

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


// Vaciar el carrito
const clearCart = async (userId) => {
    const cart = await Cart.findOneAndUpdate({ buyer: userId }, { items: [] }, { new: true });

    if (!cart) {
        throw new Error('Cart not found.');
    }

    return cart;
};

// Función para eliminar un producto del carrito
const removeFromCart = async (userId, productId, cartId = null) => {
    try {
        let cart;

        // Busca el carrito por cartId o buyer
        if (cartId) {
            cartId = Number(cartId); // Asegúrate de convertir cartId a un número
            cart = await Cart.findOne({ cartId });
        } else {
            cart = await Cart.findOne({ buyer: userId });
        }

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Filtrar el producto a eliminar del carrito
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== productId.toString());

        // Si el producto no estaba en el carrito
        if (cart.items.length === originalLength) {
            throw new Error('Product not found in cart');
        }

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
