const historyService = require('../services/historyService');

// Controlador para obtener el historial de compras
const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const history = await historyService.getPurchaseHistory(userId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPurchaseHistory,
};
