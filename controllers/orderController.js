const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear una nueva orden
exports.createOrder = async (req, res) => {
    const { userId, items, paymentMethod } = req.body;

    // Validar los datos de entrada
    if (!userId || !items || !items.length || !paymentMethod) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
        const itemsWithStatus = items.map(item => ({
            productId: item.productId, // ID del producto
            title: item.title, // Título del producto
            unit_price: item.unit_price, // Precio del producto
            quantity: item.quantity, // Cantidad del producto
            sellerId: item.sellerId, // ID del vendedor
            status: 'pendiente' // Inicializamos el status del producto
        }));

        const newOrder = new Order({
            buyer: userId,
            items: itemsWithStatus,
            paymentMethod,
            status: 'pendiente', // Estado inicial de la orden
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ message: 'Error al crear la orden.' });
    }
};

// Obtener una orden por ID
exports.getOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error.message);
        res.status(500).json({ message: 'Error al obtener la orden.' });
    }
};

// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).json({ message: 'Error al obtener las órdenes.' });
    }
};

// Obtener todas las órdenes de un vendedor
exports.getOrdersBySeller = async (req, res) => {
    const { sellerId } = req.params;

    try {
        const orders = await Order.find(); // Obtener todas las órdenes

        // Filtra las órdenes que contengan productos del vendedor específico
        const filteredOrders = orders.filter(order =>
            order.items.some(item => item.sellerId.toString() === sellerId) // Verifica si algún item pertenece al vendedor
        );

        return res.status(200).json(filteredOrders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        return res.status(500).json({ message: 'Error al obtener las órdenes del vendedor.' });
    }
};

// Actualizar el estado de un producto en una orden
exports.updateItemStatus = async (req, res) => {
    const { orderId, itemId } = req.params; // Obtener orderId y itemId
    const { status } = req.body; // Estado nuevo que se va a actualizar

    try {
        // Buscar la orden
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        // Buscar el ítem dentro de la orden
        const item = order.items.find(i => i._id.toString() === itemId);
        if (!item) {
            return res.status(404).json({ message: 'Ítem no encontrado en la orden' });
        }

        // Actualizar el estado del ítem
        item.status = status;

        // Guardar cambios en la orden
        await order.save();

        return res.status(200).json({ message: 'Estado del ítem actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar estado del ítem', error });
    }
};




// Actualizar una orden
exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const updates = req.body;

    try {
        const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error updating order:', error.message);
        res.status(500).json({ message: 'Error al actualizar la orden.' });
    }
};

// Eliminar una orden
exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json({ message: 'Orden eliminada correctamente' });
    } catch (error) {
        console.error('Error deleting order:', error.message);
        res.status(500).json({ message: 'Error al eliminar la orden.' });
    }
};