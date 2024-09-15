const Ticket = require('../models/Ticket');

// Obtener el historial de compras de un usuario
const getPurchaseHistory = async (userId) => {
    try {
        const tickets = await Ticket.find({ buyer: userId })
            .populate('items.product', 'name price')  // Opcional: para obtener detalles del producto
            .sort({ createdAt: -1 });  // Ordenar por fecha, más reciente primero

        return tickets;
    } catch (error) {
        throw new Error('Unable to retrieve purchase history: ' + error.message);
    }
};

module.exports = {
    getPurchaseHistory,
};
