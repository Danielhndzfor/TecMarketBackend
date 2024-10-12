const dashboardService = require('../services/dashboardService');
const Order = require('../models/Order'); // Asegúrate de importar el modelo de Order

// Controlador para obtener el resumen de ventas
const getSalesSummary = async (req, res) => {
    try {
        const summary = await dashboardService.getSalesSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para actualizar el estado de una orden
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body; // Esperamos el ID de la orden y el nuevo estado
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }

        // Aquí puedes agregar lógica para verificar que el usuario sea el vendedor correspondiente
        // Por ejemplo, si el vendedor es el mismo que creó la orden
        if (order.buyer.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para actualizar esta orden.' });
        }

        order.status = status; // Actualiza el estado de la orden
        await order.save();

        return res.json({ message: 'Estado de la orden actualizado con éxito', order });
    } catch (error) {
        console.error("Error al actualizar el estado de la orden:", error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getSalesSummary,
    updateOrderStatus,
};

