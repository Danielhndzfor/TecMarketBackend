const saleService = require('../services/saleService');

// Controlador para procesar una venta
const processSale = async (req, res) => {
    try {
        const userId = req.body.userId;
        const ticket = await saleService.processSale(userId);
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processSale,
};
