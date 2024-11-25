const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: Number, required: true, unique: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        unit_price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, default: 'pendiente' } // El estado individual de cada producto
    }],
    paymentMethod: { type: String, enum: ['efectivo', 'transferencia'], required: true },
    status: { type: String, default: 'pendiente' } // El estado general de la orden
}, { timestamps: true });

// Middleware para actualizar el estado de la orden
orderSchema.methods.updateOrderStatus = function () {
    const statuses = this.items.map(item => item.status); // Obtener todos los estados de los productos

    if (statuses.every(status => status === 'completado')) {
        this.status = 'completado';
    } else if (statuses.every(status => status === 'cancelado')) {
        this.status = 'cancelado';
    } else {
        this.status = 'pendiente'; // Si no todos están completados ni cancelados
    }
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;



