const Order = require('../models/Order');
const Product = require('../models/Product');
const Counter = require('../models/counter'); // Importa el modelo Counter

// Crear una nueva orden
exports.createOrder = async (req, res) => {
    const { userId, items, paymentMethod } = req.body;

    // Validar los datos de entrada
    if (!userId || !items || !items.length || !paymentMethod) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
        const itemsWithStatus = [];
        const updatedProducts = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado.` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Stock insuficiente para el producto ${product.title}. Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
                });
            }

            // Reducir el stock del producto
            product.stock -= item.quantity;
            updatedProducts.push(product.save());

            // Agregar el item a la lista con status pendiente
            itemsWithStatus.push({
                productId: item.productId,
                title: item.title,
                unit_price: item.unit_price,
                quantity: item.quantity,
                sellerId: item.sellerId,
                status: 'pendiente' // Inicializamos el status del producto
            });
        }

        // Esperar a que todos los productos se actualicen
        await Promise.all(updatedProducts);

        // Obtener el siguiente orderId del contador
        const counterDoc = await Counter.findById('orderId');
        const nextOrderId = counterDoc.sequenceValue + 1;

        // Crear la nueva orden
        const newOrder = new Order({
            orderId: nextOrderId,
            buyer: userId,
            items: itemsWithStatus,
            paymentMethod,
            status: 'pendiente', // Estado inicial de la orden
        });

        const savedOrder = await newOrder.save();

        // Actualizar el contador
        counterDoc.sequenceValue = nextOrderId;
        await counterDoc.save();

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
        // Poblamos los datos del comprador y los vendedores
        const orders = await Order.find()
            .populate({
                path: 'buyer',
                select: 'name firstName lastName email phoneNumber' // Datos del comprador
            })
            .populate({
                path: 'items.sellerId',
                select: 'name firstName lastName email phoneNumber' // Datos de los vendedores
            });

        // Filtramos y validamos órdenes con datos completos
        const validOrders = orders.map(order => ({
            ...order._doc,
            items: order.items.map(item => ({
                ...item._doc,
                sellerInfo: item.sellerId || null // Aseguramos que sellerInfo siempre tenga un valor
            }))
        }));

        res.json(validOrders);
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).json({ message: 'Error al obtener las órdenes.' });
    }
};



// Obtener todas las órdenes de un comprador
exports.getOrdersByBuyer = async (req, res) => {
    const { buyerId } = req.params;

    try {
        // Buscar órdenes por comprador
        const orders = await Order.find({ buyer: buyerId });

        // Manejar el caso de no encontrar órdenes
        if (orders.length === 0) {
            return res.status(200).json({
                message: 'No se encontraron órdenes para este comprador',
                data: []
            });
        }

        // Devolver las órdenes encontradas
        return res.status(200).json({
            message: 'Órdenes encontradas',
            data: orders
        });
    } catch (error) {
        console.error('Error al buscar órdenes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todas las órdenes de un vendedor
exports.getOrdersBySeller = async (req, res) => {
    const { sellerId } = req.params;

    try {
        const orders = await Order.find().populate('buyer'); // Obtener todas las órdenes

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

        // Actualizar el estado de la orden
        order.updateOrderStatus(); // Actualiza el estado de la orden según el estado de los ítems

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

        // Actualizar el estado de la orden después de cualquier cambio
        order.updateOrderStatus();
        await order.save();

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
