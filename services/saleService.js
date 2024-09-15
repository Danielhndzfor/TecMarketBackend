const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Ticket = require('../models/Ticket');

// Función para procesar una venta
const processSale = async (userId) => {
    try {
        // Encuentra el carrito del usuario
        const cart = await Cart.findOne({ buyer: userId });
        if (!cart) throw new Error('Cart not found');

        // Crea un nuevo ticket para la venta
        const ticketItems = cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price,
        }));

        const ticket = new Ticket({
            buyer: userId,
            items: ticketItems,
            total: ticketItems.reduce((acc, item) => acc + item.quantity * item.price, 0),
        });

        await ticket.save();

        // Actualiza el stock de los productos
        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product) throw new Error('Product not found');

            if (product.stock < item.quantity) {
                throw new Error('Insufficient stock for product: ' + product.name);
            }

            product.stock -= item.quantity;
            await product.save();
        }

        // Limpia el carrito después de la compra
        await Cart.deleteOne({ buyer: userId });

        return ticket;
    } catch (error) {
        throw new Error('Unable to process sale: ' + error.message);
    }
};

module.exports = {
    processSale,
};
