const dashboardService = require('../services/dashboardService');

// Controlador para obtener el resumen de ventas
const getSalesSummary = async (req, res) => {
    try {
        const summary = await dashboardService.getSalesSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSalesSummary,
};
