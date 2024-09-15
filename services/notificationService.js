const Product = require('../models/Product');

const checkStockLevels = async () => {
    try {
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
        // Enviar notificaciones a los vendedores o administradores
        // Implementar lógica para enviar notificaciones
        return lowStockProducts;
    } catch (error) {
        throw new Error('Unable to check stock levels: ' + error.message);
    }
};

module.exports = {
    checkStockLevels,
};
