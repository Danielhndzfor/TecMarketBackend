const { MercadoPagoConfig, Preference } = require('mercadopago'); // Usa require
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-6422305036676330-092221-d78400c15576406179537cf8aec5a5ed-2003832630' }); // Reemplaza con tu token

exports.createPayment = async (req, res) => {
    try {
        const { cartId } = req.body;
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
        

        const preference = new Preference(client);
        const preferenceData = {
            items: items,
            payer: {
                email: payerEmail
            },
            back_urls: {
                success: "https://mi-sitio/success",
                failure: "http://localhost:5173/home",
                pending: "https://mi-sitio/pending"
            },
            auto_return: "approved",
            notification_url: "https://mi-sitio/notifications"
        };

        const response = await preference.create({ body: preferenceData });
        console.log("Respuesta de MercadoPago:", response); // Muestra la respuesta completa

        // Acceder a init_point correctamente
        if (response && response.init_point) {
            return res.json({ init_point: response.init_point });
        } else {
            console.error("Respuesta de MercadoPago no contiene init_point:", response);
            throw new Error('No se pudo obtener el init_point de MercadoPago');
        }

    } catch (error) {
        console.error("Error en el proceso de creación de pago:", error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};



// Actualizar el estado del pedido después del pago exitoso
exports.handlePaymentNotification = async (req, res) => {
    try {
        const { payment_status, external_reference } = req.body;

        const order = await Order.findOne({ externalReference: external_reference });

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }

        order.status = payment_status;
        await order.save();

        return res.json({ success: true });

    } catch (error) {
        console.error("Error al procesar la notificación de pago:", error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};
