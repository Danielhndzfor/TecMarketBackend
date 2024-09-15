const Ticket = require('../models/Ticket');
const Product = require('../models/Product');

const getSalesSummary = async () => {
    try {
        // Total de ventas
        const totalSales = await Ticket.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        // Ventas por producto
        const salesByProduct = await Ticket.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $project: { productName: "$product.name", totalSales: 1 } }
        ]);

        return {
            totalSales: totalSales[0]?.total || 0,
            salesByProduct
        };
    } catch (error) {
        throw new Error('Unable to retrieve sales summary: ' + error.message);
    }
};

module.exports = {
    getSalesSummary,
};
