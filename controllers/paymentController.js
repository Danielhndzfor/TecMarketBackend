const Cart = require('../models/Cart');
const Order = require('../models/Order');

exports.createPayment = async (req, res) => {
    try {
        const { cartId, paymentMethod } = req.body; // Ahora también esperamos el método de pago
        const userId = req.user._id;
        const payerEmail = req.user.email;

        const cart = await Cart.findById(cartId).populate('items.product');

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        if (cart.buyer.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para realizar esta operación.' });
        }

        const items = cart.items.map(item => ({
            title: item.product.name,
            unit_price: parseFloat(item.product.price),
            quantity: item.quantity,
            currency_id: 'MXN' // Asegúrate de establecer la moneda
        }));

        // Crear la nueva orden y establecer el estado como "pendiente"
        const newOrder = new Order({
            buyer: userId,
            items,
            paymentMethod,
            status: 'pendiente', // Estado inicial de la orden
            // Aquí puedes incluir otros campos que necesites
        });

        await newOrder.save();

        return res.json({ message: 'Orden creada con éxito', orderId: newOrder._id });
    } catch (error) {
        console.error("Error en el proceso de creación de pago:", error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};
